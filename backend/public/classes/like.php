<?php

require_once 'account.php';

class Like
{
    // Add a like to an image
    public function add($token)
    {
        $account = new Account();
        $userId = $account->getUser($token);

        if ($userId < 1) {
            return ["status" => "error", "message" => "You must be logged in."];
        }

        // Get JSON data
        $json = file_get_contents('php://input');
        $data = json_decode($json);

        if (!isset($data->imageId)) {
            return ["status" => "error", "message" => "Invalid image."];
        }

        // Check if the user has already liked the image
        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT * FROM `Like` WHERE imageId = :imageId AND userId = :userId');
        $stmt->execute(['imageId' => $data->imageId, 'userId' => $userId]);
        $existingLike = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingLike) {
            return ["status" => "error", "message" => "You have already liked this image."];
        }

        // Add like to the database
        $stmt = $pdo->prepare('INSERT INTO `Like` (imageId, userId) VALUES (:imageId, :userId)');

        try {
            $stmt->execute(['imageId' => $data->imageId, 'userId' => $userId]);
            return ["status" => "success", "message" => "Image liked successfully."];
        } catch (PDOException $e) {
            return ["status" => "error", "message" => "Failed to like image."];
        }
    }

    // Remove a like from an image
    public function remove($token)
    {
        $account = new Account();
        $userId = $account->getUser($token);

        if ($userId < 1) {
            return ["status" => "error", "message" => "You must be logged in."];
        }

        // Get JSON data
        $json = file_get_contents('php://input');
        $data = json_decode($json);

        if (!isset($data->imageId)) {
            return ["status" => "error", "message" => "Invalid image."];
        }

        // Remove like from the database
        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('DELETE FROM `Like` WHERE imageId = :imageId AND userId = :userId');

        try {
            $stmt->execute(['imageId' => $data->imageId, 'userId' => $userId]);
            return ["status" => "success", "message" => "Like removed successfully."];
        } catch (PDOException $e) {
            return ["status" => "error", "message" => "Failed to remove like."];
        }
    }

    // Get the number of likes for each image
    public function get($token, $param)
    {
        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT COUNT(*) as likeCount FROM `Like` WHERE imageId = :imageId');
        $stmt->execute(['imageId' => $param]);
        $likeCount = $stmt->fetch(PDO::FETCH_ASSOC);

        return ["status" => "success", "likeCount" => $likeCount['likeCount']];
    }
}
