<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Snowman Showdown</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Snowman Showdown</h1>
    <form action="game.php" method="POST">
        <label for="playerName">Enter your name to play:</label>
        <input type="text" id="playerName" name="playerName" required>
        <button type="submit">Start Game</button>
    </form>
    <nav>
        <a href="leaderboard.php">Leaderboard</a> | 
        <a href="about.php">About the Game</a>
    </nav>
</body>
</html>