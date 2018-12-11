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

// arrow keys variables
let leftArrowKeyPressed = false;
let rightArrowKeyPressed = false;

// game components
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
