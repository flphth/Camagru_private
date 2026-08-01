<?php
class Sticker
{
    // Get all stickers
    public function all()
    {
        try {
            // Get all stickers from database
            $pdo = Database::getPDO();
            $stmt = $pdo->query('SELECT * FROM Sticker');
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Return stickers data
            if ($result !== false) {
                foreach ($result as &$sticker) {
                    if (isset($sticker['imagePath'])) {
                        $sticker['imagePath'] = './static/' . $sticker['imagePath'];
                    }
                }
                return ["status" => "success", "data" => $result];
            } else {
                return ["status" => "error", "message" => "No stickers found"];
            }
        } catch (PDOException $e) {
            error_log('Sticker query error: ' . $e->getMessage());
            return ["status" => "error", "message" => "Unable to load stickers."];
        }
    }
}
