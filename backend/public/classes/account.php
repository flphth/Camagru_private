<?php

require_once './jwt.php';
require_once './mailer.php';

class Account
{
    public function register()
    {
        // Get JSON data
        $json = file_get_contents('php://input');
        $data = json_decode($json);

        // Validate input
        if (!isset($data->email) || !isset($data->username) || !isset($data->password)) {
            return ["status" => "error", "message" => "Missing required fields."];
        }
        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            return ["status" => "error", "message" => "Invalid email address."];
        }
        if (!preg_match('/^[A-Za-z0-9_]{3,50}$/', $data->username)) {
            return ["status" => "error", "message" => "Username must be 3 to 50 characters (letters, digits, underscore)."];
        }
        if (!$this->validatePassword($data->password)) {
            return ["status" => "error", "message" => "Password must be at least 8 characters and include upper and lower case letters and a digit."];
        }

        // Hash the password
        $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);

        // Generate an activation hash
        $activationHash = bin2hex(random_bytes(16));

        // Insert the user data into the database
        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('INSERT INTO User (username, email, passwordHash, activationHash) VALUES (:username, :email, :passwordHash, :activationHash)');

        try {
            $stmt->execute([
                'username' => $data->username,
                'email' => $data->email,
                'passwordHash' => $passwordHash,
                'activationHash' => $activationHash
            ]);
    
            // Return the ID of the newly inserted user
            $userId = $pdo->lastInsertId();
    
            if ($userId > 0) {
                $this->sendActivationEmail($data->email, $activationHash);
                return ["status" => "success", "message" => "Registration successful. Please check your email to activate your account."];
            } else {
                return ["status" => "error", "message" => "Failed to register user."];
            }
        } catch (PDOException $e) {
            if ($e->errorInfo[1] == 1062) {
                return ["status" => "error", "message" => "Email is already in use."];
            } else {
                return ["status" => "error", "message" => "Failed to register user."];
            }
        }
    }

    public function login()
    {
        // Get JSON data
        $json = file_get_contents('php://input');
        $data = json_decode($json);
    
        // Check if the email and password match a user in the database
        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT id, passwordHash, isActiveted FROM User WHERE email = :email');
        $stmt->execute(['email' => $data->email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($user && password_verify($data->password, $user['passwordHash'])) {
            // Check if the account has been activated
            if ((int)$user['isActiveted'] === 1) {

                // Activate cross import
                $jwt = new JWT(1);
                $payload = json_encode(
                    [
                        "iat" => time(),
                        "exp" => time() + (60 * 60),
                        "userId" => $user['id']
                    ]
                );
                $token = $jwt->create($payload);
                return ["status" => "success", "message" => "Login successful.", "token" => $token];
            } else {
                return ["status" => "error", "message" => "Account is not activated. Please check your email to activate your account."];
            }
        } else {
            return ["status" => "error", "message" => "Invalid email or password."];
        }
    }

    public function activate($token, $param)
    {
        $hash = $param;

        if (!$hash || !preg_match('/^[a-f0-9]{32}$/', $hash)) {
            return ["status" => "error", "message" => "Invalid activation link."];
        }

        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT id, isActiveted FROM User WHERE activationHash = :hash');
        $stmt->execute(['hash' => $hash]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ["status" => "error", "message" => "Invalid activation link."];
        }

        if ((int)$user['isActiveted'] === 1) {
            return ["status" => "success", "message" => "Account already activated. You can log in."];
        }

        $stmt = $pdo->prepare('UPDATE User SET isActiveted = 1 WHERE id = :id');
        $stmt->execute(['id' => $user['id']]);

        return ["status" => "success", "message" => "Account activated. You can now log in."];
    }

    private function sendActivationEmail($email, $activationHash)
    {
        $appUrl = getenv('APP_URL') ?: 'http://localhost:8080';
        $link = $appUrl . '/activate?hash=' . $activationHash;

        $subject = 'Activate your Camagru account';
        $body = '<p>Welcome to Camagru!</p>'
            . '<p>Please activate your account by clicking the link below:</p>'
            . '<p><a href="' . $link . '">' . $link . '</a></p>';

        // Keep the link retrievable during development even without a configured SMTP relay
        error_log('Camagru activation link for ' . $email . ': ' . $link);

        Mailer::send($email, $subject, $body);
    }

    private function validatePassword($password)
    {
        // At least 8 characters, with upper and lower case letters and a digit
        return is_string($password) && preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password);
    }

    public function requestReset()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json);

        // Always return the same message to avoid leaking which emails exist
        $generic = ["status" => "success", "message" => "If an account exists for this email, a reset link has been sent."];

        if (!isset($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            return $generic;
        }

        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT id FROM User WHERE email = :email');
        $stmt->execute(['email' => $data->email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $resetHash = bin2hex(random_bytes(16));
            $expires = date('Y-m-d H:i:s', time() + 3600);

            $upd = $pdo->prepare('UPDATE User SET resetHash = :hash, resetExpires = :expires WHERE id = :id');
            $upd->execute(['hash' => $resetHash, 'expires' => $expires, 'id' => $user['id']]);

            $this->sendResetEmail($data->email, $resetHash);
        }

        return $generic;
    }

    public function resetPassword()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json);

        if (!isset($data->hash) || !preg_match('/^[a-f0-9]{32}$/', $data->hash)) {
            return ["status" => "error", "message" => "Invalid reset link."];
        }
        if (!isset($data->password) || !$this->validatePassword($data->password)) {
            return ["status" => "error", "message" => "Password must be at least 8 characters and include upper and lower case letters and a digit."];
        }

        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT id, resetExpires FROM User WHERE resetHash = :hash');
        $stmt->execute(['hash' => $data->hash]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || $user['resetExpires'] === null || strtotime($user['resetExpires']) < time()) {
            return ["status" => "error", "message" => "Reset link is invalid or has expired."];
        }

        $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);
        $upd = $pdo->prepare('UPDATE User SET passwordHash = :ph, resetHash = NULL, resetExpires = NULL WHERE id = :id');
        $upd->execute(['ph' => $passwordHash, 'id' => $user['id']]);

        return ["status" => "success", "message" => "Password updated. You can now log in."];
    }

    public function getProfile($token)
    {
        $userId = $this->getUser($token);
        if ($userId < 1) {
            return ["status" => "error", "message" => "You must be logged in."];
        }

        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT username, email FROM User WHERE id = :id');
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return ["status" => "success", "user" => $user];
    }

    public function update($token)
    {
        $userId = $this->getUser($token);
        if ($userId < 1) {
            return ["status" => "error", "message" => "You must be logged in."];
        }

        $json = file_get_contents('php://input');
        $data = json_decode($json);

        // Build the update from the provided fields only (column names are a fixed whitelist)
        $fields = [];
        $params = ['id' => $userId];

        if (isset($data->username) && $data->username !== '') {
            if (!preg_match('/^[A-Za-z0-9_]{3,50}$/', $data->username)) {
                return ["status" => "error", "message" => "Invalid username."];
            }
            $fields[] = 'username = :username';
            $params['username'] = $data->username;
        }

        if (isset($data->email) && $data->email !== '') {
            if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
                return ["status" => "error", "message" => "Invalid email address."];
            }
            $fields[] = 'email = :email';
            $params['email'] = $data->email;
        }

        if (isset($data->password) && $data->password !== '') {
            if (!$this->validatePassword($data->password)) {
                return ["status" => "error", "message" => "Password must be at least 8 characters and include upper and lower case letters and a digit."];
            }
            $fields[] = 'passwordHash = :passwordHash';
            $params['passwordHash'] = password_hash($data->password, PASSWORD_DEFAULT);
        }

        if (empty($fields)) {
            return ["status" => "error", "message" => "Nothing to update."];
        }

        $pdo = Database::getPDO();
        $sql = 'UPDATE User SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute($params);
            return ["status" => "success", "message" => "Profile updated."];
        } catch (PDOException $e) {
            if ($e->errorInfo[1] == 1062) {
                return ["status" => "error", "message" => "Email is already in use."];
            }
            return ["status" => "error", "message" => "Failed to update profile."];
        }
    }

    private function sendResetEmail($email, $resetHash)
    {
        $appUrl = getenv('APP_URL') ?: 'http://localhost:8080';
        $link = $appUrl . '/reset?hash=' . $resetHash;

        $subject = 'Reset your Camagru password';
        $body = '<p>You requested a password reset.</p>'
            . '<p>Choose a new password using the link below (valid for 1 hour):</p>'
            . '<p><a href="' . $link . '">' . $link . '</a></p>';

        // Keep the link retrievable during development even without a configured SMTP relay
        error_log('Camagru reset link for ' . $email . ': ' . $link);

        Mailer::send($email, $subject, $body);
    }

    public function getUser($token) {

        $jwt = new JWT(1);
        $userId = $jwt->getUserId($token);
        if ($userId > 0) {
            return $userId;
        } else {
            return 0;
        }
    }

    public function check($token) {

        $userId = $this->getUser($token);
        if ($userId > 0) {
            return ["status" => "connected", "userId" => $userId];
        } else {
            return ["status" => "error"];
        }
    }
    
}
