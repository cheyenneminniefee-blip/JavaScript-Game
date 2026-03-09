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
        // 1. Keep the player name we already had
        let currentPlayerName = "<?php echo $_POST['playerName']; ?>";

        // 2. Read the second JSON file using PHP, and echo it directly into a JavaScript variable!
        <?php
            $configFile = 'data/game_config.json';
            $configJson = file_exists($configFile) ? file_get_contents($configFile) : '{}';
        ?>
        // This creates a JS object we can use anywhere in our game
        let gameConfig = <?php echo $configJson; ?>;
    </script>
    
    <script src="script.js"></script>
</body>
</html>