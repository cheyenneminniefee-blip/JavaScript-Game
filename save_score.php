<?php

require_once 'functions.php';

$pdo = getDBConnection();

// Get the raw JSON from JavaScript
$rawData = file_get_contents("php://input");
$gameData = json_decode($rawData, true);

// Clean the name before saving!
$safeName = sanitizePlayerName($gameData['name']);

// L2-ST-savePHP-20260227

// 1. Get the raw string data that JavaScript sent via fetch
$rawData = file_get_contents('php://input');

// 2. Decode the JSON string into a PHP associative array
$newScoreData = json_decode($rawData, true);

if ($newScoreData) {
    // 3. Read the existing leaderboard JSON file
    $file = 'data/leaderboard.json';
    $currentData = file_get_contents($file);
    $leaderboard = json_decode($currentData, true);

    // If the file was somehow empty or broken, make a new array
    if (!$leaderboard) {
        $leaderboard = [];
    }

    // 4. Add the new score data to the array
    $leaderboard[] = $newScoreData;

    // 5. Turn it back into a string and save it to the file
    file_put_contents($file, json_encode($leaderboard, JSON_PRETTY_PRINT));

    // Send a success message back to the JavaScript console
    echo "Score saved successfully!";
} else {
    echo "Error: No data received.";
}
?>