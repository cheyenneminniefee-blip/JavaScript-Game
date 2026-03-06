<?php
// functions.php

function getDBConnection() {
    $host = 'localhost';
    $dbname = 'snowball_game'; // Replace with your actual DB name
    $user = 'root';            // Replace with your actual DB user
    $pass = '';                // Replace with your actual DB password

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
        // Turn on strict error reporting for debugging
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        // In a real production environment, log this error instead of showing it
        die("Connection failed: " . $e->getMessage());
    }
}

function sanitizePlayerName($name) {
    // Remove extra spaces from the beginning and end
    $cleanName = trim($name);

    // Strip out any HTML or PHP tags
    $cleanName = strip_tags($cleanName);

    // Limit the length so they don't submit a 5,000-character name
    $cleanName = substr($cleanName, 0, 20); 

    // If they entered nothing (or only spaces/tags), give them a default name
    if (empty($cleanName)) {
        return "Anonymous Snowman";
    }

    return $cleanName;
}

function getTopScores($pdo, $limit = 10) {
    // Prepare a query to get the top players, sorted by score descending
    $sql = "SELECT name, score, totalKills, survivedTime FROM scores ORDER BY score DESC LIMIT :limit";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    // Return an array of all the top players
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>