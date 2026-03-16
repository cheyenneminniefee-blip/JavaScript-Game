<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Snowman Showdown</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="menu-container">

        <h1>Snow-Pocalypse</h1>

        <label for="playerName">Enter your name to play:</label>
        <input type="text" id="playerName">

        <button id="startGame" class="play-btn">Start Game</button>

        <div class="bottom-links">
            <a href="leaderboard.php" class="menu-btn">Leaderboard</a>
            <a href="about.php" class="menu-btn">About the Game</a>
        </div>

        </div>

        <script>
        // 1. Find the button and the text box
        const startBtn = document.getElementById('startGame');
        const nameInput = document.getElementById('playerName');

        // 2. Tell the button to listen for a 'click'
        startBtn.addEventListener('click', function() {

            // Grab the name the player typed in and remove any accidental spaces
            let playerName = nameInput.value.trim();

            // Optional: Don't let them play without entering a name!
            if (playerName === "") {
                alert("Please enter a name before starting!");
                return; // Stops the function here
            }

            // 3. Save the name to the browser's local storage
            // This way, your game.html and script.js can remember who is playing
            localStorage.setItem('currentPlayerName', playerName);

            // 4. Send them to the game page! 
            // NOTE: If your game file is named something else (like game.php), change it here!
            window.location.href = 'game.php'; 
        });
        </script>
        </body>
        </html>