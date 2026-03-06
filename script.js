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

// This creates a loop that runs about 60 times per second
function gameLoop() {
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop(); // Starts the game