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
        /* Style the dropdown form */
        .sort-form {
            margin-bottom: 20px;
        }
        select {
            padding: 5px;
            font-size: 16px;
        }
    </style>
</head>
<body style="text-align: center; background-color: #2c3e50; color: white;">
    <h1>High Scores</h1>

    <?php
    // --- NEW: 1. Figure out what the user wants to sort by ---
    // If they picked something from the dropdown, use it. Otherwise, default to 'score'.
    $sortKey = isset($_GET['sort']) ? $_GET['sort'] : 'score';

    // Security check: Only allow sorting by keys that actually exist in your JSON
    $allowedKeys = ['score', 'totalKills', 'bossesKilled', 'survivedTime'];
    if (!in_array($sortKey, $allowedKeys)) {
        $sortKey = 'score';
    }
    ?>

    <form method="GET" action="leaderboard.php" class="sort-form">
        <label for="sort" style="font-size: 18px;">Sort by: </label>
        <select name="sort" id="sort" onchange="this.form.submit()">
            <option value="score" <?php if ($sortKey == 'score') echo 'selected'; ?>>Score</option>
            <option value="totalKills" <?php if ($sortKey == 'totalKills') echo 'selected'; ?>>Enemies Killed</option>
            <option value="bossesKilled" <?php if ($sortKey == 'bossesKilled') echo 'selected'; ?>>Bosses Defeated</option>
            <option value="survivedTime" <?php if ($sortKey == 'survivedTime') echo 'selected'; ?>>Time Survived</option>
        </select>
    </form>

    <?php
    $file = 'data/leaderboard.json';

    // 1. Check if the file exists
    if (file_exists($file)) {
        // Read and decode the JSON
        $data = file_get_contents($file);
        $leaderboard = json_decode($data, true);

        // Make sure the array isn't empty
        if (!empty($leaderboard)) {

            // --- UPDATED: 3. Sort the array dynamically ---
            // We use the $sortKey variable we defined at the top
            usort($leaderboard, function($a, $b) use ($sortKey) {
                return $b[$sortKey] <=> $a[$sortKey]; 
            });

            // Start drawing the HTML table
            echo "<table>";
            echo "<tr>";
            echo "<th>Rank</th>";
            echo "<th>Player Name</th>";
            echo "<th>Score</th>";
            echo "<th>Kills</th>";
            echo "<th>Bosses Defeated</th>";
            echo "<th>Time Survived</th>";
            echo "<th>Date Played</th>";
            echo "</tr>";

            // 4. Loop through the sorted data and make a row for each entry
            $rank = 1;
            foreach ($leaderboard as $entry) {
                // htmlspecialchars protects our site from people typing code into their names!
                $name = htmlspecialchars($entry['name']);
                $score = htmlspecialchars($entry['score']);
                $kills = htmlspecialchars($entry['totalKills']); 
                $bosses = htmlspecialchars($entry['bossesKilled']); 
                $survived = htmlspecialchars($entry['survivedTime']); 

                // Convert the JavaScript timestamp into a readable date!
                $rawSeconds = $entry['dateTime'] / 1000;
                $cleanSeconds = round($rawSeconds); // Converts the float to an integer
                $playedAt = date("m/d/Y H:i", $cleanSeconds);

                echo "<tr>";
                echo "<td>{$rank}</td><td>{$name}</td><td>{$score}</td>";
                echo "<td>{$kills}</td><td>{$bosses}</td><td>{$survived}s</td><td>{$playedAt}</td>";
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