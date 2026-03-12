<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Leaderboard - Snowman Showdown</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* A little bit of extra styling just for the table */
        table {
            margin: 0 auto; 
            border-collapse: collapse;
            width: 100%; /* Makes the table fill our frosted glass box */
            background-color: rgba(255, 255, 255, 0.9); /* Slightly solid so text is readable */
            color: black;
        }
        th, td {
            border: 2px solid #555; /* Darker borders to match the new look */
            padding: 10px;
            text-align: center;
        }
        th {
            background-color: #008CBA; /* Matches our Play button! */
            color: white;
        }
        .sort-form {
            margin-bottom: 20px;
        }
        select {
            padding: 5px;
            font-size: 16px;
            border-radius: 5px;
        }
        /* Make the leaderboard box a little wider than the main menu */
        .leaderboard-box {
            width: 90%;
            max-width: 1000px;
            max-height: 80vh; 
            overflow-y: auto; /* Adds a scrollbar inside the box if the list is long */
        }
    </style>
</head>
<body>
    
    <div class="menu-container leaderboard-box">
        
        <h1>High Scores</h1>

        <?php
        $sortKey = isset($_GET['sort']) ? $_GET['sort'] : 'score';
        $allowedKeys = ['score', 'totalKills', 'bossesKilled', 'survivedTime'];
        if (!in_array($sortKey, $allowedKeys)) {
            $sortKey = 'score';
        }
        ?>

        <form method="GET" action="leaderboard.php" class="sort-form">
            <label for="sort" style="font-size: 18px; font-weight: bold;">Sort by: </label>
            <select name="sort" id="sort" onchange="this.form.submit()">
                <option value="score" <?php if ($sortKey == 'score') echo 'selected'; ?>>Score</option>
                <option value="totalKills" <?php if ($sortKey == 'totalKills') echo 'selected'; ?>>Enemies Killed</option>
                <option value="bossesKilled" <?php if ($sortKey == 'bossesKilled') echo 'selected'; ?>>Bosses Defeated</option>
                <option value="survivedTime" <?php if ($sortKey == 'survivedTime') echo 'selected'; ?>>Time Survived</option>
            </select>
        </form>

        <?php
        $file = 'data/leaderboard.json';
        if (file_exists($file)) {
            $data = file_get_contents($file);
            $leaderboard = json_decode($data, true);

            if (!empty($leaderboard)) {
                usort($leaderboard, function($a, $b) use ($sortKey) {
                    return $b[$sortKey] <=> $a[$sortKey]; 
                });

                echo "<table>";
                echo "<tr><th>Rank</th><th>Player Name</th><th>Score</th><th>Kills</th><th>Bosses Defeated</th><th>Time Survived</th><th>Date Played</th></tr>";

                $rank = 1;
                foreach ($leaderboard as $entry) {
                    $name = htmlspecialchars($entry['name']);
                    $score = htmlspecialchars($entry['score']);
                    $kills = htmlspecialchars($entry['totalKills']); 
                    $bosses = htmlspecialchars($entry['bossesKilled']); 
                    $survived = htmlspecialchars($entry['survivedTime']); 

                    $rawSeconds = $entry['dateTime'] / 1000;
                    $cleanSeconds = round($rawSeconds); 
                    $playedAt = date("m/d/Y H:i", $cleanSeconds);

                    echo "<tr><td>{$rank}</td><td><strong>{$name}</strong></td><td>{$score}</td><td>{$kills}</td><td>{$bosses}</td><td>{$survived}s</td><td>{$playedAt}</td></tr>";
                    $rank++; 
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
        <a href="index.php" class="menu-btn" style="background-color: #008CBA;">Back to Main Menu</a>
    
    </div>
</body>
</html>