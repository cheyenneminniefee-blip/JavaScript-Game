<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snowman Survival</title>
    <style>
        body {
            background-color: #2c3e50; /* Dark background for the webpage */
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        #gameCanvas {
            background-color: #ecf0f1; /* Light background for the snowy world */
            border: 4px solid #bdc3c7;
        }
    </style>
</head>
<body>

    <div id="game-container">
        <canvas id="gameCanvas" width="1500" height="1000"></canvas>
    </div>

    <script>
        // PHP grabs the name from index.php and prints it right here inside the quotes!
        let currentPlayerName = "<?php echo $_POST['playerName']; ?>";
    </script>
    
    <script>
        // 1. We only declare the name ONCE using 'let'
        let currentPlayerName = "<?php echo $_POST['playerName']; ?>";

        // 2. Read the game configuration JSON file
        <?php
            $configFile = 'data/game_config.json';
            // This check makes sure the file exists so the game doesn't crash if it's missing
            $configJson = file_exists($configFile) ? file_get_contents($configFile) : '{"bossSpawnScore": 500}';
        ?>

        // 3. Create the JS object from our PHP data
        let gameConfig = <?php echo $configJson; ?>;
    </script>

    <script src="script.js"></script>
</body>
</html>