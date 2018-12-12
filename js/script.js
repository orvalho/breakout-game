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
const brickOffsetTop = 25; // setting a top and left offset so bricks won't start being drawn right from the edge of the canvas
const brickOffsetLeft = 30;
const brickPadding = 10; // setting padding between the bricks so they won't touch each other
const brickHeight = 20;
const brickWidth = (canvas.width - 2 * brickOffsetLeft + brickPadding) / brickColumnCount - brickPadding;

// setting up array to hold the x and y position to paint each brick on the screen
let bricks = [];
for(let r = 0; r < brickRowCount; r++) {
  bricks[r] = [];
  for(let c = 0; c < brickColumnCount; c++) {
    bricks[r][c] = { x: '', y: '', status: 1 }; // status 1 - paint the brick
  }
}

// arrow keys variables
let leftArrowKeyPressed = false;
let rightArrowKeyPressed = false;

// score variables
let score = 0;
const scoreForOneBrickDestruction = 100;

let lives = 3;

// detect if ball has collided with any of the bricks
function collisionDetection() {
  for(let r = 0; r < brickRowCount; r++) {
    for(let c = 0; c < brickColumnCount; c++) {
      if(bricks[r][c].status === 1) {
        // check if the center of the ball is colliding with any of the given bricks
        if(ballX > bricks[r][c].x
           && ballX < bricks[r][c].x + brickWidth
           && ballY > bricks[r][c].y
           && ballY < bricks[r][c].y + brickHeight) {
          ballDY = -ballDY;
          bricks[r][c].status = 0; // status 0 - don't paint the brick
          score += scoreForOneBrickDestruction;
          if(score === brickRowCount * brickColumnCount * scoreForOneBrickDestruction) {
            alert(`You won! Congratulations! Your score: ${score}.`);
            document.location.reload();
          }
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = '25px fontOne';
  ctx.fillStyle = purple;
  ctx.fillText(`Score: ${score}`, 10, 18);
}

function drawLives() {
  ctx.font = '25px fontOne';
  ctx.fillStyle = purple;
  ctx.fillText(`Lives: ${lives}`, canvas.width - 70, 18);
}

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
      if(bricks[r][c].status === 1) {
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
  drawScore();
  drawLives();
  collisionDetection();

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
  // if the ball collides with the bottom edge of the canvas
  else if(ballY + ballDY + ballRadius > canvas.height) {
    lives--;
    // and there are no more lives - game over
    if(!lives) {
      alert('GAME OVER');
      document.location.reload();
    }
    // if there are still some lives left - reset the position of the ball and the paddle and the movement of the ball
    else {
      ballX = canvas.width / 2;
      ballY = canvas.height - 30;
      ballDX = 1;
      ballDY = -3;
      paddleX = (canvas.width - paddleWidth) / 2;
    }
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
document.addEventListener('mousemove', mouseMoveHandler);

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

function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if(relativeX > paddleWidth / 2 && relativeX < canvas.width - paddleWidth / 2) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

draw();
