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

function spawnEnemy() {
    // Let's create a basic snowman object
    let snowman = {
        x: Math.random() * canvas.width, // Picks a random spot along the width
        y: -30, // Starts slightly above the screen so it drops in
        radius: 20, // Slightly larger than the player
        color: "white",
        speed: 2,
        health: 10
    };

    enemies.push(snowman);
}

// L1-ST-enemyMovement-20260227
// L2-ST-collisionDetection-20260227
function updateEnemies() {
    // We loop backwards because we might be removing enemies from the list!
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

        // 3. Check for collisions with ANY snowball on the screen
        for (let j = snowballs.length - 1; j >= 0; j--) {
            // Find the distance between this specific enemy and this specific snowball
            let distX = enemies[i].x - snowballs[j].x;
            let distY = enemies[i].y - snowballs[j].y;
            let distance = Math.hypot(distX, distY); 

            // If the distance is less than their combined radii, it's a hit!
            if (distance < enemies[i].radius + snowballs[j].radius) {

                // Remove the snowball
                snowballs.splice(j, 1);
                // Remove the enemy
                enemies.splice(i, 1);
                // Increase the score!
                score += 10;

                // Break out of the snowball loop so we don't try to check a dead enemy
                break; 
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

// This creates a loop that runs about 60 times per second
function gameLoop() {
    update(); // Check for movement first
    drawPlayer(); // Then draw the results
    drawScore();
    updateSnowballs();
    updateEnemies();
    requestAnimationFrame(gameLoop);
}

gameLoop(); // Starts the game