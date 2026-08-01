<?php

require_once 'account.php';

class Comment
{
    // Upload image and merge with stickers
    public function add($token)
    {
        $account = new Account();
        $userId = $account->getUser($token);

        if ($userId < 1) {
            return ["status" => "error", "message" => "You must be logged."];
        }

        // Get JSON data
        $json = file_get_contents('php://input');
        $data = json_decode($json);

        if (!isset($data->imageId) || !isset($data->content) || trim($data->content) === '') {
            return ["status" => "error", "message" => "Invalid comment."];
        }

        // Add comment in database
        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('INSERT INTO Comment (imageId, userId, content, createdAt) VALUES (:imageId, :userId, :content, :createdAt)');

        try {
            $stmt->execute([
                'imageId' => $data->imageId,
                'userId' => $userId,
                'content' => $data->content,
                'createdAt' => date('Y-m-d H:i:s')
            ]);

            $commentId = $pdo->lastInsertId();

            if ($commentId > 0) {
                $this->notifyAuthor($pdo, $data->imageId, $userId);
                return ["status" => "success", "contentId" => $commentId];
            } else {
                return ["status" => "error", "message" => "Failed to send content."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "message" => "Unknow error."];
        }
    }

    // Notify the image author by email, if enabled and not commenting on their own image
    private function notifyAuthor($pdo, $imageId, $commenterId)
    {
        $stmt = $pdo->prepare('SELECT User.id, User.email, User.notifyOnComment
                               FROM Image JOIN User ON Image.userId = User.id
                               WHERE Image.id = :imageId');
        $stmt->execute(['imageId' => $imageId]);
        $author = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$author || (int)$author['id'] === (int)$commenterId || (int)$author['notifyOnComment'] !== 1) {
            return;
        }

        $appUrl = getenv('APP_URL') ?: 'http://localhost:8080';
        $subject = 'New comment on your Camagru image';
        $body = '<p>Someone just commented on one of your images.</p>'
            . '<p><a href="' . $appUrl . '/list">See it on Camagru</a></p>';

        // Observable in dev even without a configured SMTP relay
        error_log('Camagru comment notification for ' . $author['email']);

        Mailer::send($author['email'], $subject, $body);
    }

    // Get comments for a specific image
    public function get($token, $param)
    {
        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT * FROM Comment WHERE imageId = :imageId');

        try {
            $stmt->execute(['imageId' => $param]);
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ["status" => "success", "comments" => $comments];
        } catch (PDOException $e) {
            if ($e->errorInfo[1]) {
                return ["status" => "error", "message" => "Unknow error."];
            }
        }
    }
}
