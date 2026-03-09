<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Leaderboard - Snowman Showdown</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* A little bit of extra styling just for the table */
        table {
            margin: 0 auto; /* Centers the table */
            border-collapse: collapse;
            width: 50%;
            background-color: #ecf0f1;
            color: black;
        }
        th, td {
            border: 2px solid #bdc3c7;
            padding: 10px;
            text-align: center;
        }
        th {
            background-color: #3498db;
            color: white;
        }
    </style>
</head>
<body style="text-align: center; background-color: #2c3e50; color: white;">
    <h1>High Scores</h1>

    <?php
    $file = 'data/leaderboard.json';

    // 1. Check if the file exists
    if (file_exists($file)) {
        // Read and decode the JSON
        $data = file_get_contents($file);
        $leaderboard = json_decode($data, true);

        // Make sure the array isn't empty
        if (!empty($leaderboard)) {

            // 2. Sort the array from highest score to lowest
            usort($leaderboard, function($a, $b) {
                return $b['score'] <=> $a['score']; 
            });

            // 3. Start drawing the HTML table
            echo "<table>";
            echo "<tr><th>Rank</th><th>Player Name</th><th>Score</th></tr>";

            // 4. Loop through the sorted data and make a row for each entry
            $rank = 1;
            foreach ($leaderboard as $entry) {
                // htmlspecialchars protects our site from people typing code into their names!
                $name = htmlspecialchars($entry['name']);
                $score = htmlspecialchars($entry['score']);

                echo "<tr>";
                echo "<td>{$rank}</td>";
                echo "<td>{$name}</td>";
                echo "<td>{$score}</td>";
                echo "</tr>";

                $rank++; // Increase the rank number by 1 for the next loop
            }

            echo "</table>";

        } else {
            echo "<p>No scores yet! Be the first to play!</p>";
        }
    } else {
        echo "<p>Leaderboard data not found. Play a game to generate it!</p>";
    }
    ?>

    <br>
    <nav>
        <a href="index.php" style="color: #3498db; font-size: 20px;">Back to Main Menu</a>
    </nav>
</body>
</html>