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

        if (!$data || !isset($data->image)) {
            return ["status" => "error", "message" => "Invalid image data."];
        }

        // Normalise the base64 payload
        $imageData = $data->image;
        $stickersId = $data->stickersId ?? [];

        $imageData = str_replace('data:image/png;base64,', '', $imageData);
        $imageData = str_replace(' ', '+', $imageData);

        $imageBinary = base64_decode($imageData, true);
        if ($imageBinary === false) {
            return ["status" => "error", "message" => "Invalid image data."];
        }

        // Enforce a size limit (5 MB)
        if (strlen($imageBinary) > 5 * 1024 * 1024) {
            return ["status" => "error", "message" => "Image is too large."];
        }

        // Make sure the payload really is a PNG image before touching the filesystem
        $info = @getimagesizefromstring($imageBinary);
        if ($info === false || $info[2] !== IMAGETYPE_PNG) {
            return ["status" => "error", "message" => "Only PNG images are allowed."];
        }

        $webcamImage = @imagecreatefromstring($imageBinary);
        if ($webcamImage === false) {
            return ["status" => "error", "message" => "Invalid image data."];
        }

        // Merge with the selected stickers (scaled to the capture, alpha preserved)
        if (!empty($stickersId)) {
            $baseW = imagesx($webcamImage);
            $baseH = imagesy($webcamImage);

            // Blend semi-transparent sticker pixels onto the capture
            imagealphablending($webcamImage, true);

            $stickerPaths = $this->getStickerPaths($stickersId);
            foreach ($stickerPaths as $stickerPath) {
                $stickerImage = @imagecreatefrompng($stickerPath);
                if ($stickerImage === false) {
                    continue;
                }
                // Stretch each sticker over the whole frame, like the live preview does
                imagecopyresampled(
                    $webcamImage, $stickerImage,
                    0, 0, 0, 0,
                    $baseW, $baseH,
                    imagesx($stickerImage), imagesy($stickerImage)
                );
                imagedestroy($stickerImage);
            }
        }

        // Save the final image (only validated content is ever written to disk)
        $fileName = 'image_' . uniqid() . '.png';
        $fullPath = getcwd() . '/static/' . $fileName;

        if (!imagepng($webcamImage, $fullPath)) {
            imagedestroy($webcamImage);
            return ["status" => "error", "message" => "Failed to save image."];
        }
        imagedestroy($webcamImage);

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

    public function getAll($token, $param)
    {
        $perPage = 5;
        $page = max(1, (int)$param);
        $offset = ($page - 1) * $perPage;

        $pdo = Database::getPDO();

        $total = (int)$pdo->query('SELECT COUNT(*) FROM Image')->fetchColumn();

        // Newest first; $perPage and $offset are validated integers
        $stmt = $pdo->prepare(
            'SELECT Image.id, Image.imagePath, Image.createdAt, User.username
             FROM Image JOIN User ON Image.userId = User.id
             ORDER BY Image.createdAt DESC, Image.id DESC
             LIMIT ' . $perPage . ' OFFSET ' . $offset
        );
        $stmt->execute();
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            "status" => "success",
            "images" => $images,
            "page" => $page,
            "totalPages" => (int)ceil($total / $perPage),
            "total" => $total
        ];
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
