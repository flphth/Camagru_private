<?php

class Database
{
    private static $pdo;

    private static function connect()
    {
        $host = getenv('DB_HOST');
        $dbname = getenv('DB_NAME');
        $user = getenv('DB_USER');
        $password = getenv('DB_PASSWORD');

        try {
            self::$pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage() . ' (host=' . $host . ', db=' . $dbname . ')');
            throw new RuntimeException('Database connection failed.');
        }
    }

    public static function getPDO()
    {
        if (!isset(self::$pdo)) {
            self::connect();
        }
        return self::$pdo;
    }
}
