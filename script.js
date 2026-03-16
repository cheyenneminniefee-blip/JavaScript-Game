// L1-ST-playerSetup-20260226
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Grab the name we saved on the home screen!
// If they somehow bypassed the home screen, default to 'Anonymous'
let currentPlayerName = localStorage.getItem('currentPlayerName') || 'Anonymous';

// Let's define our player object right in the middle of the canvas
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20, // Size of the player
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

// Screen Shake variables
let shakeTimer = 0;
let shakeIntensity = 0;

// Damage Markers list
let damageMarkers = [];

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

// --- LOAD ALL SOUNDS ---
const damageSfx = new Audio('sounds/damage.ogg');
const gameOverSfx = new Audio('sounds/game_over.ogg');
const snowballHitSfx = new Audio('sounds/snowball_hit.ogg');
const walkingSfx = new Audio('sounds/walking.ogg');

// --- SET UP THE WALKING LOOP ---
walkingSfx.loop = true; 
walkingSfx.volume = 0.4; // Keep footsteps a bit quieter so they aren't annoying!

let bossActive = false; // Acts as an on/off switch for the boss state
let enemySnowballs = []; // A separate list just for the boss's projectiles

let nextBossScore = 150;

// --- LOAD ALL SPRITES ---
const playerSprite = new Image(); playerSprite.src = 'sprites/player.png';
const snowmanSprite = new Image(); snowmanSprite.src = 'sprites/snowman.png';
const runnerSprite = new Image(); runnerSprite.src = 'sprites/runner.png';
const tankSprite = new Image(); tankSprite.src = 'sprites/tank.png';
const bossSprite = new Image(); bossSprite.src = 'sprites/boss.png';

const snowballSprite = new Image(); snowballSprite.src = 'sprites/snowball.png';
const bossSnowballSprite = new Image(); bossSnowballSprite.src = 'sprites/boss_snowball.png';

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

// L1-ST-audioHelper
function playSound(soundObject, randomizePitch = false) {
    let clone = soundObject.cloneNode();
    clone.volume = soundObject.volume;

    // --- NEW: Pitch Randomization! ---
    if (randomizePitch) {
        // Math.random() gives a number from 0 to 1. 
        // This math gives us a random speed/pitch between 0.85 and 1.15
        clone.playbackRate = 0.85 + (Math.random() * 0.3);
    }

    clone.play();
}

// L1-ST-drawPlayer-20260226
function drawPlayer() {
    // Clear the canvas so we don't leave "trails" when moving
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the angle between the player and the mouse cursor
    let dx = mouse.x - player.x;
    let dy = mouse.y - player.y;
    let angle = Math.atan2(dy, dx);

    // Save, translate, and rotate so the player faces the mouse
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(angle);

    // Draw the player sprite
    ctx.drawImage(
        playerSprite, 
        -player.radius, 
        -player.radius, 
        player.radius * 2, 
        player.radius * 2
    );

    ctx.restore();
}

// L2-ST-healthBar-20260227
function drawHealthBar() {
    let barX = 20;
    let barY = 20;
    let barWidth = 100;
    let barHeight = 20;

    // 1. Draw a thick black border behind the whole thing
    ctx.fillStyle = "black";
    ctx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);

    // 2. Draw the red background (missing health)
    ctx.fillStyle = "#aa0000"; // Darker red looks better
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 3. Draw the green current health
    ctx.fillStyle = "#00ff00"; // Bright neon green
    let currentHealthWidth = Math.max(0, player.health); 
    ctx.fillRect(barX, barY, currentHealthWidth, barHeight);
}

function drawBossHealthBar(boss) {
    // We only want to draw the bar if the boss is actually alive
    if (boss.health <= 0) return;

    // Set the size of the health bar
    let barWidth = 60; 
    let barHeight = 8;

    // Position it directly above the boss
    // Note: If you use boss.width/boss.height for your sprites instead of boss.radius, 
    // you might need to change 'boss.radius' to '(boss.height / 2)'
    let barX = boss.x - (barWidth / 2);
    let barY = boss.y - boss.radius - 20; 

    // 1. Draw the thick black border
    ctx.fillStyle = "black";
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // 2. Draw the dark red background (missing health)
    ctx.fillStyle = "#aa0000"; 
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 3. Draw the current health (Purple to match the boss!)
    // We use a percentage calculation so the bar shrinks smoothly
    let healthPercent = Math.max(0, boss.health / boss.maxHealth);
    let currentHealthWidth = barWidth * healthPercent;

    ctx.fillStyle = "#9b59b6"; // A cool, visible purple
    ctx.fillRect(barX, barY, currentHealthWidth, barHeight);
}

// L1-ST-advancedEnemySpawn-20260228
// L1-ST-enemyPointsSetup-20260301
function spawnEnemy() {
    // Stop spawning if the boss is here!
    if (typeof bossActive !== 'undefined' && bossActive) return;

    let roll = Math.random(); 

    // 1. DECLARE ALL VARIABLES (Make sure enemyDamage is in this list!)
    let enemyRadius, enemyColor, enemySpeed, enemyHealth, enemyPoints, enemyType, enemyLastShot, enemyDamage; 

    if (roll < 0.45) {
        // Regular Snowman (55% chance)
        enemyRadius = 20;
        enemyColor = "white";
        enemySpeed = 2;
        enemyHealth = 3; 
        enemyPoints = 10;   
        enemyDamage = 10; // <--- ADDED
    } else if (roll < 0.70) {
        // Runner (25% chance)
        enemyRadius = 15;
        enemyColor = "cyan"; 
        enemySpeed = 4.5;    
        enemyHealth = 1;     
        enemyPoints = 15;   
        enemyDamage = 5;  // <--- ADDED
    } else if (roll < 0.90) {
        // Tank (15% chance)
        enemyRadius = 35;
        enemyColor = "gray"; 
        enemySpeed = 0.8;    
        enemyHealth = 10;    
        enemyPoints = 30;   
        enemyDamage = 15; // <--- ADDED
    } else {
        // Spitter (5% chance)
        enemyRadius = 20;
        enemyColor = "white"; 
        enemySpeed = 0.5; 
        enemyHealth = 2; 
        enemyPoints = 40; 
        enemyType = "spitter"; 
        enemyLastShot = Date.now(); 
        enemyDamage = 10; // <--- ADDED
    }

    // 2. PICK A RANDOM SIDE (The "Edge Picking" logic)
    let spawnX, spawnY;
    let edge = Math.floor(Math.random() * 4); 

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

    // 3. CREATE THE OBJECT (Double check the commas here!)
    let snowman = {
        x: spawnX, 
        y: spawnY, 
        radius: enemyRadius,
        color: enemyColor,
        speed: enemySpeed,
        health: enemyHealth,
        points: enemyPoints,
        damage: enemyDamage, // <--- MAKE SURE THIS IS HERE
        isBoss: false,
        type: enemyType || "melee", 
        lastShot: enemyLastShot || 0 
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
        maxHealth: 50 + (bossesKilled * 10),
        points: 200, // Huge score payout
        isBoss: true, // A special flag so our code knows this is the boss
        lastShot: Date.now(), // Tracks when it last fired a snowball
        shotsFired: 0 // --- NEW: Keep track of how many snowballs it has thrown! ---
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

            // --- UPDATED: Dynamic Boss Cooldown ---
            let bossCooldown = 1500; // Normal attack speed (2 seconds)

            // If the boss has fired 10 or more times, enter BARRAGE MODE! (200ms delay)
            if (enemies[i].shotsFired >= 10) {
                bossCooldown = 200; 
            }

            // Check if enough time has passed based on our dynamic cooldown
            if (Date.now() - enemies[i].lastShot > bossCooldown) {
                let bossProjectileSpeed = 6;

                // --- NEW: SHOTGUN & BURST LOGIC ---
                // Only allow special attacks during the "normal" phase (shots 0-9)
                let isSpecialAttackPhase = (enemies[i].shotsFired < 10);

                // Roll a random decimal between 0 and 1 to decide the attack
                let attackRoll = Math.random();

                if (isSpecialAttackPhase && attackRoll < 0.15) {
                    // --- 15% CHANCE: MASSIVE 360 BURST ---
                    // Loop from -10 to 10 (21 total snowballs)
                    for (let spread = -10; spread <= 10; spread++) {
                        // Math.PI * 2 is a full circle in radians. 
                        // Dividing it by 21 spaces the snowballs out perfectly!
                        let spreadAngle = angle + (spread * ((Math.PI * 2) / 21)); 

                        enemySnowballs.push({
                            x: enemies[i].x,
                            y: enemies[i].y,
                            radius: 10,
                            color: "purple",
                            velocityX: Math.cos(spreadAngle) * bossProjectileSpeed,
                            velocityY: Math.sin(spreadAngle) * bossProjectileSpeed
                        });
                    }
                } else if (isSpecialAttackPhase && attackRoll < 0.45) {
                    // --- 30% CHANCE: NORMAL SHOTGUN ---
                    for (let spread = -2; spread <= 2; spread++) {
                        let spreadAngle = angle + (spread * 0.2); 

                        enemySnowballs.push({
                            x: enemies[i].x,
                            y: enemies[i].y,
                            radius: 10,
                            color: "purple",
                            velocityX: Math.cos(spreadAngle) * bossProjectileSpeed,
                            velocityY: Math.sin(spreadAngle) * bossProjectileSpeed
                        });
                    }
                } else {
                    // --- NORMAL / BARRAGE SHOT ---
                    // If no special attack triggered, just fire one snowball
                    enemySnowballs.push({
                        x: enemies[i].x,
                        y: enemies[i].y,
                        radius: 10, // Bigger than player snowballs
                        color: "purple",
                        velocityX: Math.cos(angle) * bossProjectileSpeed,
                        velocityY: Math.sin(angle) * bossProjectileSpeed
                    });
                }

                enemies[i].lastShot = Date.now(); // Reset the boss's firing timer
                enemies[i].shotsFired += 1; // Add 1 to the counter

                // Reset the attack pattern
                if (enemies[i].shotsFired >= 20) {
                    enemies[i].shotsFired = 0;
                }
            }
        }

        // --- NEW: SPITTER SHOOTING LOGIC ---
        if (enemies[i].type === "spitter") {
            // Check if 2500 milliseconds (2.5 seconds) have passed since its last shot
            if (Date.now() - enemies[i].lastShot > 2500) {
                let spitterProjectileSpeed = 5; // A bit slower than the player's 8 speed

                // Add a regular white snowball to the enemy snowballs list
                enemySnowballs.push({
                    x: enemies[i].x,
                    y: enemies[i].y,
                    radius: 5, // Exact same size as the player's snowballs
                    color: "white", // Exact same color
                    velocityX: Math.cos(angle) * spitterProjectileSpeed,
                    velocityY: Math.sin(angle) * spitterProjectileSpeed
                });

                enemies[i].lastShot = Date.now(); // Reset the firing timer
            }
        }

        // 2. Draw the enemy
        ctx.beginPath();
        // 2. Draw the enemy
        ctx.save();
        ctx.translate(enemies[i].x, enemies[i].y);
        ctx.rotate(angle); // All enemies use this angle to face the player!

                if (enemies[i].isBoss) {
                    // --- THE BOSS ---
                    ctx.drawImage(bossSprite, -enemies[i].radius, -enemies[i].radius, enemies[i].radius * 2, enemies[i].radius * 2);

                } else if (enemies[i].type === "spitter") {
                    // --- UPDATED: SPITTER USES SNOWMAN SPRITE ---
                    ctx.drawImage(snowmanSprite, -enemies[i].radius, -enemies[i].radius, enemies[i].radius * 2, enemies[i].radius * 2);

                } else if (enemies[i].color === "white") {
                    // --- REGULAR SNOWMAN ---
                    ctx.drawImage(snowmanSprite, -enemies[i].radius, -enemies[i].radius, enemies[i].radius * 2, enemies[i].radius * 2);

                } else if (enemies[i].color === "cyan") {
                    // --- RUNNER ---
                    ctx.drawImage(runnerSprite, -enemies[i].radius, -enemies[i].radius, enemies[i].radius * 2, enemies[i].radius * 2);

        } else if (enemies[i].color === "gray") {
            // --- TANK ---
            ctx.drawImage(tankSprite, -enemies[i].radius, -enemies[i].radius, enemies[i].radius * 2, enemies[i].radius * 2);
        }

        ctx.restore();
        ctx.closePath();

        if (enemies[i].isBoss) {
            drawBossHealthBar(enemies[i]);
        }

        // 3. Player Collision (The logic you explained!)
        let distToPlayer = Math.hypot(dx, dy); // We can reuse dx and dy from movement!
        // Inside updateEnemies() -> Player Collision section
        if (distToPlayer < enemies[i].radius + player.radius) {
            if (enemies[i].isBoss) {
                player.health = 0; 
                triggerShake(20, 30); // Massive shake for boss hit!
            } else {
                player.health -= enemies[i].damage; 

                // --- NEW ADDITIONS ---
                // Change this line in your Player Collision section:
                createDamageMarker(player.x, player.y - 20, enemies[i].damage, "red");
                triggerShake(enemies[i].damage * 2, 10); // Shake intensity based on damage!

                playSound(damageSfx, true);
            }
            enemies.splice(i, 1);
            continue;
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

                // --- NEW: Add a damage marker for the enemy! ---
                // We use "white" so it stands out but feels different from player damage
                createDamageMarker(enemies[i].x, enemies[i].y - 20, "1", "cornflowerblue");
                
                playSound(snowballHitSfx, true); // <--- Add this!

                if (enemies[i].health <= 0) {
                    score += enemies[i].points; 
                    enemiesKilled += 1; 

                    // --- NEW: Massive explosion matching the enemy color! ---
                    // L1-ST-deathEffect-20260304
                    createExplosion(enemies[i].x, enemies[i].y, enemies[i].color, 25);

                    if (enemies[i].isBoss) {
                        bossesKilled += 1;
                        bossActive = false; 
                        nextBossScore = score + 150;
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
        // Draw the player snowball sprite
        ctx.drawImage(
            snowballSprite,
            snowballs[i].x - snowballs[i].radius,
            snowballs[i].y - snowballs[i].radius,
            snowballs[i].radius * 2,
            snowballs[i].radius * 2
        );
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
        // Draw the boss snowball sprite
        ctx.drawImage(
            bossSnowballSprite,
            enemySnowballs[i].x - enemySnowballs[i].radius,
            enemySnowballs[i].y - enemySnowballs[i].radius,
            enemySnowballs[i].radius * 2,
            enemySnowballs[i].radius * 2
        );
        ctx.closePath();

        // Check if it hits the player
        let dx = player.x - enemySnowballs[i].x;
        let dy = player.y - enemySnowballs[i].y;
        let distance = Math.hypot(dx, dy);

        // Inside updateEnemySnowballs() -> Collision with Player
        if (distance < player.radius + enemySnowballs[i].radius) {
            // Visual explosion effect for the snowball breaking
            createExplosion(enemySnowballs[i].x, enemySnowballs[i].y, "white", 15);

            // Deduct health (we set this to 10 earlier)
            player.health -= 10; 

            // --- NEW ADDITIONS ---
            // 1. Pop up a red "10" above the player
            createDamageMarker(player.x, player.y - 20, 10, "red");

            // 2. Add a slight screen shake (10 damage * 0.8 = 8 intensity)
            triggerShake(8, 10); 

            playSound(damageSfx, true);

            // Remove the snowball
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
    let isMoving = false; // --- NEW: Track if we are moving this frame

    if (keys["w"] || keys["ArrowUp"]) { player.y -= speed; isMoving = true; }
    if (keys["s"] || keys["ArrowDown"]) { player.y += speed; isMoving = true; }
    if (keys["a"] || keys["ArrowLeft"]) { player.x -= speed; isMoving = true; }
    if (keys["d"] || keys["ArrowRight"]) { player.x += speed; isMoving = true; }

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // --- NEW: Handle the walking sound ---
    if (isMoving) {
        // Only call play() if the sound is currently paused to prevent glitching
        if (walkingSfx.paused) {
            walkingSfx.play();
        }
    } else {
        // If no keys are pressed, pause the audio immediately
        walkingSfx.pause();
    }
}

// L1-ST-scoreDisplay-20260227
// L1-ST-drawHUD-20260301
function drawHUD() {
    // --- NEW: Add a drop shadow for high readability ---
    ctx.shadowColor = "black";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = "white"; // White text pops against the game background

    // --- CENTER: Score ---
    ctx.textAlign = "center";
    ctx.font = "bold 30px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, 50);

    // --- LEFT SIDE: Time & Kills ---
    ctx.textAlign = "left";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Time: " + survivalTime + "s", 20, 70); 
    ctx.fillText("Kills: " + enemiesKilled, 20, 95);

    // --- RIGHT SIDE: Bosses Defeated ---
    ctx.textAlign = "right";
    ctx.fillText("Bosses Defeated: " + bossesKilled, canvas.width - 20, 40);

    // --- IMPORTANT: Reset shadows so they don't apply to the sprites! ---
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
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

// Creates a floating red number
// Add 'color' as a third piece of info
function createDamageMarker(x, y, amount, color) {
    damageMarkers.push({
        x: x,
        y: y,
        amount: amount,
        color: color, // Save the color here
        alpha: 1,       
        lifeSpan: 60    
    });
}

// Moves and draws the markers
function updateDamageMarkers() {
    for (let i = damageMarkers.length - 1; i >= 0; i--) {
        let dm = damageMarkers[i];

        dm.y -= 1;        
        dm.alpha -= 0.02; 
        dm.lifeSpan--;

        // The Fix: If alpha goes below 0, the marker is dead
        if (dm.alpha <= 0 || dm.lifeSpan <= 0) {
            damageMarkers.splice(i, 1);
            continue;
        }

        ctx.save();
        // The Fix: Math.max ensures alpha is never a weird negative number
        ctx.globalAlpha = Math.max(0, dm.alpha);
        ctx.fillStyle = dm.color; // Use the custom color
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(dm.amount, dm.x, dm.y);
        ctx.restore();
    }
}

// Trigger screen shake
function triggerShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTimer = duration;
}

// This creates a loop that runs about 60 times per second
// L2-ST-gameOver-20260227
function gameLoop() {
    // Check for Game Over FIRST!
    // Locate this inside your gameLoop() function
    if (player.health <= 0) {
        walkingSfx.pause(); 
        playSound(gameOverSfx, false);

        // Save data to the server
        saveGameData(currentPlayerName, score);

        // 1. Update the overlay text
        document.getElementById("finalScoreDisplay").innerText = "Final Score: " + score;

        // 2. Show the floating UI
        document.getElementById("gameOverUI").style.display = "block";

        // 3. Darken the game screen slightly so the UI pops
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Important: Stop the loop so it doesn't keep trying to draw
        return; 
    }

    // 1. Clear the canvas first so we don't leave trails!
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // --- SCREEN SHAKE START ---
    if (shakeTimer > 0) {
        let shakeX = (Math.random() - 0.5) * shakeIntensity;
        let shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.save();
        ctx.translate(shakeX, shakeY);
        shakeTimer--;
    }

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
    updateDamageMarkers();
    drawHUD();
    drawHealthBar();

    // --- SCREEN SHAKE END ---
    if (shakeIntensity > 0 && shakeTimer >= 0) {
        // Only restore if we actually saved!
        if (shakeTimer >= 0) ctx.restore(); 
    }

    // 4. Repeat
    requestAnimationFrame(gameLoop);
}

gameLoop(); // Starts the game