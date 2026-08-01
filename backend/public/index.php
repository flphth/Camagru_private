<?php

// Never leak PHP errors into the HTTP response; log them server-side instead
ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json');

// Any uncaught error or exception returns clean JSON instead of an HTML stack trace
set_exception_handler(function ($e) {
    http_response_code(500);
    error_log('Uncaught: ' . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "Internal server error."]);
});

require 'database.php';
require 'router.php';

routeRequest();
