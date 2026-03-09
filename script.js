// L1-ST-playerSetup-20260226
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Let's define our player object right in the middle of the canvas
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15, // Size of the player
    color: "blue",
    health: 100 
};

// L1-ST-keyTracking-20260226
let keys = {};

// L1-ST-mouseTracking-20260226
let snowballs = []; // This empty list will hold all the snowballs we fire
let mouse = { x: 0, y: 0 }; // Keeps track of the cursor

let score = 0;

// L1-ST-enemySpawn-20260227
let enemies = []; // This list holds all the active snowmen
// L1-ST-enemyTimer-20260227
setInterval(spawnEnemy, 2000); // This rings the "alarm" every 2000 milliseconds (2 seconds)

// 1. Update the mouse position whenever it moves over the canvas
canvas.addEventListener("mousemove", function(e) {
    mouse.x = e.offsetX; // offsetX/Y gets the coordinates relative to the canvas
    mouse.y = e.offsetY;
});

// 2. Listen for a mouse click to pull the trigger
canvas.addEventListener("mousedown", function(e) {
    // 1. Find the distance between the player and the mouse click
    let dx = mouse.x - player.x;
    let dy = mouse.y - player.y;

    // 2. Calculate the angle 
    let angle = Math.atan2(dy, dx);

    // 3. Set how fast the snowball should fly
    let snowballSpeed = 8;

    // 4. Create the snowball object and add it to our list
    snowballs.push({
        x: player.x,
        y: player.y,
        radius: 5,
        color: "white",
        velocityX: Math.cos(angle) * snowballSpeed,
        velocityY: Math.sin(angle) * snowballSpeed
    });
});

// This listens for when a key is pushed down
window.addEventListener("keydown", function(e) {
    keys[e.key] = true;
});

// This listens for when you let go of the key
window.addEventListener("keyup", function(e) {
    keys[e.key] = false;
});

// L1-ST-drawPlayer-20260226
function drawPlayer() {
    // This clears the canvas so we don't leave "trails" when moving
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
}

// L2-ST-healthBar-20260227
function drawHealthBar() {
    // 1. Draw a red background rectangle to represent missing health
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 100, 20); // x: 20, y: 20, width: 100, height: 20

    // 2. Draw a green rectangle on top to represent current health
    ctx.fillStyle = "green";

    // We use Math.max to ensure the width never drops below 0 if you take extra damage
    let currentHealthWidth = Math.max(0, player.health); 

    // Because your max health is 100, it perfectly matches the 100 pixel width!
    ctx.fillRect(20, 20, currentHealthWidth, 20);
}

function spawnEnemy() {
    // Let's create a basic snowman object
    // Inside your spawnEnemy function:
    let snowman = {
        x: Math.random() * canvas.width,
        y: -30,
        radius: 20,
        color: "white",
        speed: 2,
        health: 3 // Changed from 10 to 3 for three hits
    };

    enemies.push(snowman);
}

// L1-ST-enemyMovement-20260227
// L2-ST-collisionDetection-20260227
// L3-ST-enemyHealth-20260227
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {

        // 1. Move the enemy toward the player
        let dx = player.x - enemies[i].x;
        let dy = player.y - enemies[i].y;
        let angle = Math.atan2(dy, dx);

        enemies[i].x += Math.cos(angle) * enemies[i].speed;
        enemies[i].y += Math.sin(angle) * enemies[i].speed;

        // 2. Draw the enemy
        ctx.beginPath();
        ctx.arc(enemies[i].x, enemies[i].y, enemies[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = "red"; 
        ctx.fill();
        ctx.closePath();

        // 3. Player Collision (The logic you explained!)
        let distToPlayer = Math.hypot(dx, dy); // We can reuse dx and dy from movement!
        if (distToPlayer < enemies[i].radius + player.radius) {
            player.health -= 10; // Player takes 10 damage
            enemies.splice(i, 1); // Enemy explodes on the player
            continue; // Skip the rest of the loop for this enemy since it's dead
        }

        // 4. Snowball Collision (Now with Enemy Health!)
        for (let j = snowballs.length - 1; j >= 0; j--) {
            let distX = enemies[i].x - snowballs[j].x;
            let distY = enemies[i].y - snowballs[j].y;
            let distance = Math.hypot(distX, distY); 

            if (distance < enemies[i].radius + snowballs[j].radius) {

                snowballs.splice(j, 1); // Snowball is always destroyed on impact
                enemies[i].health -= 1; // Enemy loses 1 health

                // Only destroy the enemy and give score IF health is 0
                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1); 
                    score += 10; 
                }

                break; // Stop checking this specific enemy against other snowballs this frame
            }
        }
    }
}

// Add this new function to handle moving and drawing the snowballs:
// L1-ST-snowballCleanup-20260227
function updateSnowballs() {
    for (let i = snowballs.length - 1; i >= 0; i--) {
        snowballs[i].x += snowballs[i].velocityX;
        snowballs[i].y += snowballs[i].velocityY;

        // Draw the snowball
        ctx.beginPath();
        ctx.arc(snowballs[i].x, snowballs[i].y, snowballs[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();

        // Check if snowball is off-screen
        if (snowballs[i].x < 0 || snowballs[i].x > canvas.width || 
            snowballs[i].y < 0 || snowballs[i].y > canvas.height) {

            // Remove 1 item at index i
            snowballs.splice(i, 1);
        }
    }
}

// L1-ST-playerMovement-20260226
function update() {
    let speed = 5;
    if (keys["w"] || keys["ArrowUp"]) player.y -= speed;
    if (keys["s"] || keys["ArrowDown"]) player.y += speed;
    if (keys["a"] || keys["ArrowLeft"]) player.x -= speed;
    if (keys["d"] || keys["ArrowRight"]) player.x += speed;
}

// L1-ST-scoreDisplay-20260227
function drawScore() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black"; // Feel free to change this color!
    ctx.textAlign = "center"; // This perfectly centers the text at our X coordinate

    // canvas.width / 2 will always find the exact center (600 in your case)
    // 50 is our Y coordinate near the top
    ctx.fillText("Score: " + score, canvas.width / 2, 50); 
}

// L1-ST-saveScore-20260227
function saveGameData(playerName, finalScore) {
    // 1. Pack the data into a neat JavaScript object
    let dataToSend = {
        name: playerName,
        score: finalScore
    };

    // 2. Hand it to the mail carrier (fetch)
    fetch('save_score.php', {
        method: 'POST', // We are "posting" mail to the server
        headers: {
            'Content-Type': 'application/json' // Telling PHP what kind of package this is
        },
        body: JSON.stringify(dataToSend) // The actual package
    })
    .then(response => response.text())
    .then(result => {
        console.log("The server says: ", result);
    });
}

// This creates a loop that runs about 60 times per second
// L2-ST-gameOver-20260227
function gameLoop() {
    // Check for Game Over FIRST!
    if (player.health <= 0) {
        ctx.fillStyle = "black";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        ctx.font = "30px Arial";
        ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 + 50);
        saveGameData(currentPlayerName, score);
        return; // This completely stops the loop! No more movement or drawing.
    }

    // 1. Clear the canvas first so we don't leave trails!
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // 2. Do all the math for movement
    update(); 

    // 3. Draw everything
    drawPlayer(); 
    updateSnowballs();
    updateEnemies();
    drawScore();
    drawHealthBar(); // Add your new health bar here!

    // 4. Repeat
    requestAnimationFrame(gameLoop);
}

gameLoop(); // Starts the game