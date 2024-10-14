// Get the canvas element and its context
var canvas = document.getElementById("canvas1"); // Get the game canvas element
var ctx = canvas.getContext("2d"); // Get the 2D rendering context
var volumeInfo = document.getElementById("volume-Info");
// Sound variables
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var brickSoundBuffer = null;
var gameOverSoundBuffer = null;
var gameWinSoundBuffer = null;

// Set up initial ball properties
var x = canvas.width / 2; // Initial X position of the ball
var y = canvas.height - 30; // Initial Y position of the ball
var dx = 2; // X velocity of the ball
var dy = -2; // Y velocity of the ball
var ballRadius = 12; // Radius of the ball

// Set up initial paddle properties
var paddleHeight = 15; // Height of the paddle
var paddleWidth = 95; // Width of the paddle
var paddleX = (canvas.width - paddleWidth) / 2; // Initial X position of the paddle

// Set up keyboard control properties
var rightPressed = false; // Flag for right arrow key pressed
var leftPressed = false; // Flag for left arrow key pressed

// Set up brick properties
var brickRowCount = 5; // Number of rows of bricks
var brickColumnCount = 8; // Number of columns of bricks
var brickWidth = 75; // Width of each brick
var brickHeight = 20; // Height of each brick
var brickPadding = 10; // Padding between bricks
var brickOffsetTop = 30; // Top offset for the first row of bricks
var brickOffsetLeft = 30; // Left offset for the first column of bricks

// Set up game score and lives
var score = 0; // Player's score
var lives = 3; // Player's remaining lives

// Initialize the array to hold brick objects
var bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    // Create a new brick object with initial properties
    bricks[c][r] = { x: 0, y: 0, status: 1 }; // Brick position and status (1: active, 0: destroyed)
  }
}

// Event listeners for keyboard and mouse input
document.addEventListener("keydown", keyDownHandler); // Listen for keydown events
document.addEventListener("keyup", keyUpHandler); // Listen for keyup events
document.addEventListener("mousemove", mouseMoveHandler); // Listen for mousemove events

loadSound("GameSounds/brick_sound.mp3", function (buffer) {
  brickSoundBuffer = buffer;
});

loadSound("GameSounds/game_over_sound.mp3", function (buffer) {
  gameOverSoundBuffer = buffer;
});

loadSound("GameSounds/game_win_sound.mp3", function (buffer) {
  gameWinSoundBuffer = buffer;
});

function loadSound(url, callback) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    audioContext.decodeAudioData(request.response, function (buffer) {
      callback(buffer);
    });
  };

  request.send();
}

function playSound(buffer) {
  var source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}

// Handle mouse movement for paddle control
function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft; // Calculate the relative X-coordinate of the mouse within the canvas
  if (
    relativeX > 0 + paddleWidth / 2 &&
    relativeX < canvas.width - paddleWidth / 2
  ) {
    // Check if the relative X-coordinate is within the paddle's bounds
    paddleX = relativeX - paddleWidth / 2; // Set the paddle's X position based on the mouse position
  }
}

// Handle keydown events for paddle control
function keyDownHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = true; // Set the flag for right arrow key as pressed
  } else if (e.keyCode == 37) {
    leftPressed = true; // Set the flag for left arrow key as pressed
  }
}

// Handle keyup events for paddle control
function keyUpHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = false; // Set the flag for right arrow key as not pressed
  } else if (e.keyCode == 37) {
    leftPressed = false; // Set the flag for left arrow key as not pressed
  }
}

// Draw the bricks on the canvas
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        // Draw each brick
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#00095DD";
        ctx.fill();
        ctx.strokeStyle = "rgb(255,69,0)";
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}

// Draw the ball on the canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = " #F6BE00";
  ctx.fill();
  ctx.closePath();
}

// Draw the paddle on the canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#ff0000";
  ctx.fill();
  ctx.closePath();
}

// Detect collisions between the ball and bricks
function collisionDetection() {
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status == 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          ++score;
          playSound(brickSoundBuffer); // Play brick sound when collision occurs

          if (brickColumnCount * brickRowCount == score) {
            playSound(gameWinSoundBuffer);
            alert("YOU WIN");
            document.location.reload();
          }
        }
      }
    }
  }
}

// Draw the player's score on the canvas
function drawScore() {
  ctx.font = "18px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

// Draw the player's remaining lives on the canvas
function drawLives() {
  ctx.font = "18px Arial";
  ctx.fillStyle = "#ff0000";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

// Main draw function, called repeatedly to update the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  drawBricks(); // Draw the bricks
  drawLives(); // Draw the lives
  drawBall(); // Draw the ball
  drawPaddle(); // Draw the paddle
  drawScore(); // Draw the score

  collisionDetection(); // Check for collisions between the ball and bricks

  // Ball movement and collision logic
  if (y + dy < ballRadius) {
    dy = -dy; // Reverse the Y velocity if the ball hits the top wall
  } else if (y + dy > canvas.height - 2 * ballRadius) {
    // Check if the ball hits the bottom wall
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy; // Reverse the Y velocity if the ball hits the paddle
    } else {
      lives--; // Decrease the player's remaining lives

      if (lives === 0) {
        playSound(gameOverSoundBuffer);
        alert("GAME OVER"); // Display game over message if the player has no remaining lives
        document.location.reload(); // Reload the page to restart the game
      } else {
        lives > 0 && alert(`Dont worry you have ${lives} lives remain`);

        x = canvas.width / 2; // Reset the ball's X position to the center
        y = canvas.height - 30; // Reset the ball's Y position
        dx = 2; // Reset the ball's X velocity
        dy = -2; // Reset the ball's Y velocity
        paddleX = (canvas.width - paddleWidth) / 2; // Reset the paddle's X position to the center
      }
    }
  }

  // Ball direction logic
  if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
    dx = -dx; // Reverse the X velocity if the ball hits the side walls
  }

  // Paddle control logic
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7; // Move the paddle to the right if the right arrow key is pressed
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7; // Move the paddle to the left if the left arrow key is pressed
  }

  x += dx; // Update the ball's X position based on its velocity
  y += dy; // Update the ball's Y position based on its velocity
}

setInterval(draw, 10); // Call the draw function every 10 milliseconds to update the canvas
