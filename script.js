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
let lastPlayerShot = 0;
// L1-ST-particleSystem-20260304
let particles = [];

let boostActive = false;
let boostStartTime = 0;
let boostKillCount = 0; // Tracks the 30 normal kills specifically for the boost

let score = 0;
let enemiesKilled = 0;
let bossesKilled = 0;
let survivalTime = 0; // We will count this in seconds
let gameStartTime = Date.now(); // Records the exact millisecond the game started

// L1-ST-enemySpawn-20260227
let enemies = []; // This list holds all the active snowmen
// L1-ST-enemyTimer-20260227
let lastSpawnTime = Date.now();
let currentSpawnDelay = 2000; // Starts at 2 seconds

let bossActive = false; // Acts as an on/off switch for the boss state
let enemySnowballs = []; // A separate list just for the boss's projectiles

let nextBossScore = 150;

// 1. Update the mouse position whenever it moves over the canvas
canvas.addEventListener("mousemove", function(e) {
    mouse.x = e.offsetX; // offsetX/Y gets the coordinates relative to the canvas
    mouse.y = e.offsetY;
});

// 2. Listen for a mouse click to pull the trigger
canvas.addEventListener("mousedown", function(e) {
    // --- NEW: Cooldown Check ---
    // --- UPDATED: Dynamic Cooldown Check ---
      // 50ms is crazy fast (rapid fire!), 300ms is normal
      let currentCooldown = boostActive ? 50 : 300; 

      if (Date.now() - lastPlayerShot < currentCooldown) return; 

      lastPlayerShot = Date.now();
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

// L1-ST-advancedEnemySpawn-20260228
// L1-ST-enemyPointsSetup-20260301
function spawnEnemy() {
    // Stop spawning if the boss is here! (We will use this in the next step)
    if (typeof bossActive !== 'undefined' && bossActive) return;

    let roll = Math.random(); 

    // Add enemyPoints to our setup list
    let enemyRadius, enemyColor, enemySpeed, enemyHealth, enemyPoints; 

    if (roll < 0.60) {
        // Regular Snowman
        enemyRadius = 20;
        enemyColor = "white";
        enemySpeed = 2;
        enemyHealth = 3; 
        enemyPoints = 10;   // 10 points
    } else if (roll < 0.85) {
        // Runner
        enemyRadius = 15;
        enemyColor = "cyan"; 
        enemySpeed = 4.5;    
        enemyHealth = 1;     
        enemyPoints = 15;   // 15 points
    } else {
        // Tank
        enemyRadius = 35;
        enemyColor = "gray"; 
        enemySpeed = 0.8;    
        enemyHealth = 10;    
        enemyPoints = 30;   // 30 points for the big guys!
    }

    // --- NEW: Pick a random side to spawn from ---
        let spawnX, spawnY;
        let edge = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left

        if (edge === 0) { // Top
            spawnX = Math.random() * canvas.width;
            spawnY = -40;
        } else if (edge === 1) { // Right
            spawnX = canvas.width + 40;
            spawnY = Math.random() * canvas.height;
        } else if (edge === 2) { // Bottom
            spawnX = Math.random() * canvas.width;
            spawnY = canvas.height + 40;
        } else { // Left
            spawnX = -40;
            spawnY = Math.random() * canvas.height;
        }

        let snowman = {
            x: spawnX, // Use the new randomized X
            y: spawnY, // Use the new randomized Y
            radius: enemyRadius,
            color: enemyColor,
            speed: enemySpeed,
            health: enemyHealth,
            points: enemyPoints,
            isBoss: false // Make sure normal enemies are explicitly NOT bosses
        };

        enemies.push(snowman);
    }

// L1-ST-bossSpawner-20260301
function spawnBoss() {
    bossActive = true; // Turn on the boss state!

    let boss = {
        x: canvas.width / 2,
        y: -100, // Starts off-screen
        radius: 60, // MASSIVE
        color: "purple", // Give the boss a scary, unique color
        speed: 1, // Slow, menacing pace
        health: 50 + (bossesKilled * 10),
        points: 200, // Huge score payout
        isBoss: true, // A special flag so our code knows this is the boss
        lastShot: Date.now() // Tracks when it last fired a snowball
    };

    enemies.push(boss);
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

        // --- NEW: BOSS SHOOTING LOGIC ---
        if (enemies[i].isBoss) {
            // Check if 2000 milliseconds (2 seconds) have passed since the last shot
            if (Date.now() - enemies[i].lastShot > 2000) {
                let bossProjectileSpeed = 6;

                // Add a giant purple snowball to our new list!
                enemySnowballs.push({
                    x: enemies[i].x,
                    y: enemies[i].y,
                    radius: 10, // Bigger than player snowballs
                    color: "purple",
                    velocityX: Math.cos(angle) * bossProjectileSpeed,
                    velocityY: Math.sin(angle) * bossProjectileSpeed
                });

                enemies[i].lastShot = Date.now(); // Reset the boss's firing timer
            }
        }

        // 2. Draw the enemy
        ctx.beginPath();
        ctx.arc(enemies[i].x, enemies[i].y, enemies[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = enemies[i].color;
        ctx.fill();
        ctx.closePath();

        // 3. Player Collision (The logic you explained!)
        let distToPlayer = Math.hypot(dx, dy); // We can reuse dx and dy from movement!
        if (distToPlayer < enemies[i].radius + player.radius) {
            // --- NEW: Check if it's the boss! ---
            if (enemies[i].isBoss) {
                player.health = 0; // Instant death!
            } else {
                player.health -= 10; // Normal enemies only do 10 damage
            }
            enemies.splice(i, 1); // Enemy explodes on the player
            continue; // Skip the rest of the loop for this enemy since it's dead
        }

        // 4. Snowball Collision (Now with Enemy Health!)
        for (let j = snowballs.length - 1; j >= 0; j--) {
            let distX = enemies[i].x - snowballs[j].x;
            let distY = enemies[i].y - snowballs[j].y;
            let distance = Math.hypot(distX, distY); 

            if (distance < enemies[i].radius + snowballs[j].radius) {

                // --- NEW: Small white poof when the snowball hits! ---
                // L1-ST-hitEffect-20260304
                createExplosion(snowballs[j].x, snowballs[j].y, "white", 5);

                snowballs.splice(j, 1); // Snowball is always destroyed on impact
                enemies[i].health -= 1; // Enemy loses 1 health

                if (enemies[i].health <= 0) {
                    score += enemies[i].points; 
                    enemiesKilled += 1; 

                    // --- NEW: Massive explosion matching the enemy color! ---
                    // L1-ST-deathEffect-20260304
                    createExplosion(enemies[i].x, enemies[i].y, enemies[i].color, 25);

                    if (enemies[i].isBoss) {
                        bossesKilled += 1;
                        bossActive = false; 
                        nextBossScore = score + gameConfig.bossSpawnScore;
                    } else {
                        // Boost Kill Tracker...
                        if (!boostActive) {
                            boostKillCount += 1;
                            if (boostKillCount >= 30) {
                                boostActive = true;
                                boostStartTime = Date.now(); 
                                boostKillCount = 0; 
                            }
                        }
                    }

                    enemies.splice(i, 1); 
                    break; 
                } 
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

// L1-ST-updateParticles-20260304
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.alpha -= 0.05; // Fade out by 5% every frame

        // If the particle is fully transparent, remove it from the list
        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        // Draw the particle
        ctx.save(); // Save the canvas state
        ctx.globalAlpha = p.alpha; // Apply the fading effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore(); // Restore the canvas state so we don't accidentally fade everything else!
    }
}

// L1-ST-enemySnowballLogic-20260301
function updateEnemySnowballs() {
    for (let i = enemySnowballs.length - 1; i >= 0; i--) {
        enemySnowballs[i].x += enemySnowballs[i].velocityX;
        enemySnowballs[i].y += enemySnowballs[i].velocityY;

        // Draw the boss snowball
        ctx.beginPath();
        ctx.arc(enemySnowballs[i].x, enemySnowballs[i].y, enemySnowballs[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = enemySnowballs[i].color;
        ctx.fill();
        ctx.closePath();

        // Check if it hits the player
        let dx = player.x - enemySnowballs[i].x;
        let dy = player.y - enemySnowballs[i].y;
        let distance = Math.hypot(dx, dy);

        if (distance < player.radius + enemySnowballs[i].radius) {
            player.health -= 15; // Boss snowballs do heavy damage!
            enemySnowballs.splice(i, 1);
            continue;
        }

        // Clean up if it goes off-screen
        if (enemySnowballs[i].x < 0 || enemySnowballs[i].x > canvas.width || 
            enemySnowballs[i].y < 0 || enemySnowballs[i].y > canvas.height) {
            enemySnowballs.splice(i, 1);
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
// --- NEW: Keep player inside canvas bounds ---
    // Math.max and Math.min force the player's coordinates to stay within the canvas dimensions
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

// L1-ST-scoreDisplay-20260227
// L1-ST-drawHUD-20260301
function drawHUD() {
    ctx.fillStyle = "black"; 

    // --- CENTER: Score ---
    ctx.textAlign = "center";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, 50);

    // --- LEFT SIDE: Time & Kills ---
    // We place these below the health bar (which ends at y = 40)
    ctx.textAlign = "left";
    ctx.font = "20px Arial";
    ctx.fillText("Time: " + survivalTime + "s", 20, 70); 
    ctx.fillText("Kills: " + enemiesKilled, 20, 95);

    // --- RIGHT SIDE: Bosses Defeated ---
    ctx.textAlign = "right";
    ctx.fillText("Bosses Defeated: " + bossesKilled, canvas.width - 20, 40);
}

// L1-ST-saveScore-20260227
function saveGameData(playerName, finalScore) {
    // 1. Pack the data into a neat JavaScript object
    let dataToSend = {
        name: playerName,
        score: finalScore,
        totalKills: enemiesKilled,
        bossesKilled: bossesKilled,
        survivedTime: survivalTime,
        dateTime: Date.now() // Grabs the exact millisecond the game ended
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

// L1-ST-createExplosion-20260304
function createExplosion(x, y, color, particleCount) {
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            // Math.random() - 0.5 gives us random directions (both negative and positive)
            velocityX: (Math.random() - 0.5) * 10,
            velocityY: (Math.random() - 0.5) * 10,
            radius: Math.random() * 3 + 1, // Random size between 1 and 4
            color: color,
            alpha: 1 // Start fully opaque
        });
    }
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

    // Calculate survival time in seconds
    survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);

    // --- NEW: ESCALATING SPAWN RATE ---
    // The delay drops by 20 milliseconds for every second you survive.
    // Math.max ensures the delay never drops below 500ms (half a second) so it remains playable!
    currentSpawnDelay = Math.max(500, 2000 - (survivalTime * 20));

    // Check if it is time to spawn a new enemy
    if (Date.now() - lastSpawnTime > currentSpawnDelay) {
        spawnEnemy();
        lastSpawnTime = Date.now(); // Reset the timer
    }

    // --- NEW: Boost Timer Check ---
    // If boost is active AND 15,000 milliseconds (15s) have passed...
    if (boostActive && Date.now() - boostStartTime > 15000) {
        boostActive = false; // Turn the boost off!
    }

    // --- NEW BOSS CHECK ---
    // If the boss isn't already active AND our score is high enough...
    if (!bossActive && score >= nextBossScore) {
        spawnBoss();
    }

    // 3. Draw everything
    drawPlayer(); 
    updateSnowballs();
    updateEnemySnowballs(); 
    updateEnemies();
    updateParticles();
    drawHUD();
    drawHealthBar();

    // 4. Repeat
    requestAnimationFrame(gameLoop);
}

gameLoop(); // Starts the game