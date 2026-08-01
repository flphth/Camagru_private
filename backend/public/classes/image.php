<?php

require_once 'account.php';

class Image
{
    // Upload image and merge with stickers
    public function upload($token)
    {
        $account = new Account();
        $userId = $account->getUser($token);

        if ($userId < 1) {
            return ["status" => "error", "message" => "You must be logged."];
        }
    
        // Get JSON data
        $json = file_get_contents('php://input');
        $data = json_decode($json);

        if ($data && isset($data->image)) {

            // Get image data
            $imageData = $data->image;
            $stickersId = $data->stickersId;

            // Remove data URL scheme part
            $imageData = str_replace('data:image/png;base64,', '', $imageData);
            $imageData = str_replace(' ', '+', $imageData);

            // Decode base64 image data
            $imageBinary = base64_decode($imageData);

            // Save image to file
            $filePath = getcwd() . '/static/'; 
            $fileName = 'image_' . uniqid() . '.png';
            $fullPath = $filePath . $fileName;
            $bytesWritten = file_put_contents($fullPath, $imageBinary);

            if ($bytesWritten !== false) {
                
                // Load webcam image
                $webcamImage = imagecreatefrompng($fullPath);
                if (!empty($stickersId)) {
                    $stickerPaths = $this->getStickerPaths($stickersId);
                    // Merge webcam image with stickers
                    foreach ($stickerPaths as $stickerPath) {
                        $stickerImage = imagecreatefrompng($stickerPath);
                        imagecopy($webcamImage, $stickerImage, 0, 0, 0, 0, imagesx($stickerImage), imagesy($stickerImage));
                        imagedestroy($stickerImage);
                    }
                }

                // Save merged image
                imagepng($webcamImage, $fullPath);
                imagedestroy($webcamImage);

            } else {
                return ["status" => "error", "message" => "Failed to save image to file."];
            }
        } else {
            return ["status" => "error", "message" => "Invalid image data."];
        }

        // Add image in database
        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('INSERT INTO Image (userId, imagePath, createdAt) VALUES (:userId, :imagePath, :createdAt)');

        try {
            $stmt->execute([
                'userId' => $userId,
                'imagePath' => './static/' . $fileName,
                'createdAt' => date('Y-m-d H:i:s')
            ]);
    
            // Return the ID of the newly inserted user
            $imageId = $pdo->lastInsertId();
    
            if ($imageId > 0) {
                return ["status" => "success", "imageId" => $imageId];
            } else {
                return ["status" => "error", "message" => "Failed to upload image."];
            }
        } catch (PDOException $e) {
            if ($e->errorInfo[1]) {
                return ["status" => "error", "message" => "Unknow error."];
            }
        }
    }

    public function getAll() {

        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT * FROM Image');
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        
        return $results;
    }

    // Get sticker paths from database
    private function getStickerPaths($stickersId)
    {
        $ids = array_map('intval', (array)$stickersId);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        $pdo = Database::getPDO();
        $stmt = $pdo->prepare('SELECT imagePath FROM Sticker WHERE id IN (' . $placeholders . ')');
        $stmt->execute($ids);
        $result = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stickerPaths = [];
        foreach ($result as $imagePath) {
            $stickerPaths[] = './static/' . $imagePath;
        }

        return $stickerPaths;
    }
}
