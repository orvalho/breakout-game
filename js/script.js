const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// canvas dimensions
canvas.width = 600;
canvas.height = 400;

// colors
const bodyStyles = window.getComputedStyle(document.body);
const yellow   = bodyStyles.getPropertyValue('--yellow');
const orange   = bodyStyles.getPropertyValue('--orange');
const red      = bodyStyles.getPropertyValue('--red');
const burgundy = bodyStyles.getPropertyValue('--burgundy');
const purple   = bodyStyles.getPropertyValue('--purple');

// ball variables
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 1;
let ballDY = -3;
const ballRadius = 10;

// paddle variables
const paddleWidth = 75;
const paddleHeight = 15;
let paddleX = (canvas.width - paddleWidth) / 2;

// brick variables
const brickRowCount = 3;
const brickColumnCount = 8;
const brickOffsetTop = 20; // setting a top and left offset so they won't start being drawn right from the edge of the canvas
const brickOffsetLeft = 30;
const brickPadding = 10; // setting padding between the bricks so they won't touch each other
const brickHeight = 20;
const brickWidth = (canvas.width - 2 * brickOffsetLeft + brickPadding) / brickColumnCount - brickPadding;

// setting up array to hold the x and y position to paint each brick on the screen
let bricks = [];
for(let r = 0; r < brickRowCount; r++) {
  bricks[r] = [];
  for(let c = 0; c < brickColumnCount; c++) {
    bricks[r][c] = { x: '', y: '' };
  }
}

// arrow keys variables
let leftArrowKeyPressed = false;
let rightArrowKeyPressed = false;

// game components
function drawBricks() {
  for(let r = 0; r < brickRowCount; r++) {
    // coloring brick rows
    switch(r) {
      case 0:
        ctx.fillStyle = purple;
        break;
      case 1:
        ctx.fillStyle = burgundy;
        break;
      case 2:
        ctx.fillStyle = red;
        break;
    }
    // drawing bricks
    for(let c = 0; c < brickColumnCount; c++) {
      let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
      let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
      bricks[r][c].x = brickX;
      bricks[r][c].y = brickY;
      ctx.beginPath();
      ctx.rect(brickX, brickY, brickWidth, brickHeight);
      ctx.fill();
      ctx.closePath();
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = purple;
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 5, paddleWidth, paddleHeight);
  ctx.fillStyle = red;
  ctx.fill();
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();

  // bounce off left and right
  if(ballX + ballDX + ballRadius > canvas.width || ballX + ballDX - ballRadius < 0) {
    ballDX = -ballDX;
  }

  // bounce off top
  if(ballY + ballDY - ballRadius < 0) {
    ballDY = -ballDY;
  }
  // bounce off paddle
  else if(ballX > paddleX && ballX < paddleX + paddleWidth && ballY + ballDY + ballRadius > canvas.height - paddleHeight) {
    ballDY = -ballDY;
  }
  // game over if the ball collides with the bottom edge of the canvas
  else if(ballY + ballDY + ballRadius > canvas.height) {
    alert('GAME OVER');
    document.location.reload();
  }

  // move ball
  ballX += ballDX;
  ballY += ballDY;

  // control paddle
  if(rightArrowKeyPressed && paddleX + paddleWidth < canvas.width) {
    paddleX += 7;
  } else if(leftArrowKeyPressed && paddleX > 0) {
    paddleX -= 7;
  }

  requestAnimationFrame(draw);
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if(e.keyCode === 39) {
      rightArrowKeyPressed = true;
    } else if(e.keyCode === 37) {
      leftArrowKeyPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.keyCode === 39) {
      rightArrowKeyPressed = false;
    } else if(e.keyCode === 37) {
      leftArrowKeyPressed = false;
    }
}

draw();
