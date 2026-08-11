<?php

function routeRequest()
{
    // Get the request URL
    $url = $_SERVER['REQUEST_URI'];
    $parts = explode('/', trim($url, '/'));

    if (count($parts) < 2) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid request"]);
        exit;
    }

    // Get the class and method name
    $className = $parts[0];
    $methodName = $parts[1];
    $param = $parts[2] ?? null;

    if (!isValidName($className) || !isValidName($methodName)) {
        sendErrorResponse("Invalid class or method name");
    }

    // Whitelist of routable endpoints (case-insensitive). Internal helpers such as
    // Account::getUser are deliberately left out so they can't be reached via the API.
    $routes = [
        'account' => ['register', 'login', 'activate', 'requestreset', 'resetpassword', 'getprofile', 'update', 'check'],
        'image'   => ['upload', 'getall', 'one', 'mine', 'delete'],
        'comment' => ['add', 'get'],
        'like'    => ['add', 'remove', 'get'],
        'sticker' => ['all'],
    ];
    $classKey = strtolower($className);
    if (!isset($routes[$classKey]) || !in_array(strtolower($methodName), $routes[$classKey], true)) {
        sendErrorResponse("Invalid class or method name");
    }

    // Check if the class and method exist
    $filePath = './classes/' . $className . '.php';
    if (!file_exists($filePath)) {
        sendErrorResponse("Invalid class or method name");
    }
    require $filePath;

    // Check if the class and method exist
    if (!class_exists($className)) {
        sendErrorResponse("Invalid class or method name");
    }
    $instance = new $className;

    // Check if the method exists and is callable
    if (!method_exists($instance, $methodName) || !is_callable([$instance, $methodName])) {
        sendErrorResponse("Invalid class or method name");
    }

    // Bearer
    $token = null;
    if (isset(getallheaders()['Authorization']) && preg_match('/Bearer\s(\S+)/', getallheaders()['Authorization'], $matches)) {
        $token = $matches[1];
    }

    // Call the method with the token as an argument, if it exists
    $result = $instance->$methodName($token ?? null, $param);
    echo json_encode($result);
}

// Check if a string is a valid class or method name
function isValidName($name)
{
    return preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $name);
}

// Send an error response
function sendErrorResponse($message)
{
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $message]);
    exit;
}
