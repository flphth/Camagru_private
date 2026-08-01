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
