<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>About - Snowman Showdown</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* Removed all the background color code! */
        h1, h2 {
            color: #008CBA; /* Matches our theme */
            text-align: center;
            margin-top: 10px;
        }
        h2 {
            border-bottom: 2px solid #ccc;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        ul {
            line-height: 1.8;
            font-size: 18px;
            text-align: left; /* Keeps lists easy to read */
        }
        code {
            background-color: #ddd;
            padding: 2px 6px;
            border-radius: 4px;
            color: #e74c3c;
            font-weight: bold;
        }
        /* Custom tweaks for the about panel */
        .about-box {
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
        }
    </style>
</head>
<body>

    <div class="menu-container about-box">
        
        <h1>About Snowman Showdown</h1>

        <h2>How to Play (Rules)</h2>
        <ul>
            <li><strong>Movement:</strong> Use <code>W A S D</code> or the <code>Arrow Keys</code> to navigate the frozen battlefield.</li>
            <li><strong>Combat:</strong> Aim with your mouse and <code>Click</code> to throw snowballs.</li>
            <li><strong>The Enemies:</strong> 
                <ul>
                    <li><em>Standard Snowmen (White):</em> Your average winter grunts.</li>
                    <li><em>Runners (Cyan):</em> Fast but fragile. Don't let them swarm you!</li>
                    <li><em>Tanks (Gray):</em> Slow-moving giants that take multiple hits to bring down.</li>
                </ul>
            </li>
            <li><strong>Boss Fights:</strong> Watch out for the giant Purple Bosses! They spawn as your score increases, carry massive health pools, and shoot highly damaging snowballs back at you.</li>
            <li><strong>Boost Mode:</strong> Defeat 30 normal enemies to trigger a 15-second rapid-fire snowball boost!</li>
        </ul>

        <h2>Credits</h2>
        <ul>
            <li><strong>Lead Developer & Designer:</strong> Cheyenne Minniefee</li>
            <li><strong>Assets:</strong> HTML5 Canvas primitives & Custom Pixel Art</li>
        </ul>

        <h2>AI Documentation</h2>
        <p style="font-size: 18px; line-height: 1.6; text-align: left;">
            This project was developed with the assistance of Google's Gemini AI. The AI acted as a coding assistant and was utilized for the following tasks:
        </p>
        <ul>
            <li>Troubleshooting JavaScript logic, specifically fixing a "phasing" collision bug with the rapid-fire boost.</li>
            <li>Structuring PHP code and writing the JSON parsing logic for the dynamic, sortable leaderboard.</li>
            <li>Drafting the mathematical logic for the HTML Canvas particle system (explosions and hit effects).</li>
            <li>Providing best practices for code organization and security.</li>
        </ul>

        <a href="index.php" class="menu-btn" style="background-color: #008CBA; margin-top: 20px;">Back to Main Menu</a>

    </div>

</body>
</html>