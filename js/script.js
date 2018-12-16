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
      drawGameOverScene();
      return;
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

/******************************************************************************/
let scene;

// MAIN SCENE

function drawMainScene() {
  scene = 'main scene';
  drawBackground();
  // draw decorations
  drawLineOfCircles(20, true);
  drawLineOfCircles(380, true);
  drawLineOfCircles(15, false);
  drawLineOfCircles(585, false);
  // preload fonts and only then draw name of game and buttons
  document.fonts.load('10pt fontTwo').then(drawGameName);
  document.fonts.load('10pt fontOne').then(drawStartButton);
  document.fonts.load('10pt fontOne').then(drawHelpButton);
}

function drawBackground() {
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = purple;
  ctx.fill();
  ctx.closePath();
}

function drawGameName() {
  ctx.font = `80px fontTwo`;
  ctx.fillStyle = yellow;
  ctx.textAlign = 'center';
  ctx.fillText(`BREAKOUT`, canvas.width / 2, canvas.height / 5 * 2);
}

const startButtonX = canvas.width / 5 * 2;
const startButtonY = canvas.height / 20 * 11;
const startButtonWidth = canvas.width / 5;
const startButtonHeight = canvas.height / 10;

function drawStartButton() {
  ctx.beginPath();
  ctx.rect(startButtonX, startButtonY, startButtonWidth, startButtonHeight);
  ctx.fillStyle = yellow;
  ctx.fill();
  ctx.closePath();
  ctx.textAlign = 'center';
  ctx.fillStyle = purple;
  ctx.font = '50px fontOne';
  ctx.fillText('start', canvas.width / 2, startButtonY + 30);
}

const helpButtonX = startButtonX;
const helpButtonY = canvas.height / 10 * 7;
const helpButtonWidth = startButtonWidth;
const helpButtonHeight = startButtonHeight;

function drawHelpButton() {
  ctx.beginPath();
  ctx.rect(helpButtonX, helpButtonY, helpButtonWidth, helpButtonHeight);
  ctx.fillStyle = yellow;
  ctx.fill();
  ctx.closePath();
  ctx.textAlign = 'center';
  ctx.fillStyle = purple;
  ctx.font = '50px fontOne';
  ctx.fillText('help', canvas.width / 2, helpButtonY + 30);
}

function drawLineOfCircles(a, horizontal) {
  for(let i = 0;; i++) {
    ctx.beginPath();
    // case 1: draw horizontal line
    if(horizontal) {
      let x = 30 * i + 15;
      if(x > canvas.width) {
        break;
      }
      ctx.arc(x, a, 3, 0, Math.PI * 2);
    }
    // case 2: draw vertical line
    else {
      let y = 30 * i + 20;
      if(y > canvas.height) {
        break;
      }
      ctx.arc(a, y, 3, 0, Math.PI * 2);
    }
    ctx.fillStyle = yellow;
    ctx.fill();
    ctx.closePath();
  }
}

drawMainScene();

document.addEventListener('click', startButtonHandler);

function startButtonHandler(e) {
  if(e.clientX > startButtonX + canvas.offsetLeft
    && e.clientX < startButtonX + startButtonWidth + canvas.offsetLeft
    && e.clientY > startButtonY + canvas.offsetTop
    && e.clientY < startButtonY + startButtonHeight + canvas.offsetTop
    && scene === 'main scene') {
    draw();
  }
}

/******************************************************************************/
// HELP SCENE

function drawHelpScene() {
  drawHelpSceneBackground();
  // draw heading
  ctx.textAlign = 'center';
  ctx.fillStyle = purple;
  ctx.font = '50px fontOne';
  ctx.fillText('HOW TO PLAY:', canvas.width / 2, 80);
  // draw text
  ctx.font = '30px fontOne';
  wrapText(text, x, y, maxWidth, lineHeight);
  // draw back arrow
  ctx.beginPath();
  ctx.strokeStyle = purple;
  ctx.lineWidth = 10;
  // 1st line
  ctx.moveTo(backArrow1, backArrow2);
  ctx.lineTo(backArrow3, backArrow2);
  // 2nd line
  ctx.moveTo(backArrow2, backArrow1);
  ctx.lineTo(backArrow2, backArrow3);
  // 3rd line
  ctx.moveTo(backArrow2, backArrow2);
  ctx.lineTo(backArrow3, backArrow3);
  ctx.stroke();
  ctx.closePath();
}

function drawHelpSceneBackground() {
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = orange;
  ctx.fill();
  ctx.closePath();
}

const backArrow1 = 40;
const backArrow2 = 45;
const backArrow3 = 80;

function wrapText(text, x, y, maxWidth, lineHeight) {
  let words = text.split(' ');
  let line = '';
  for(let i = 0; i < words.length; i++) {
    let testLine = `${line} ${words[i]} `;
    let testWidth = ctx.measureText(testLine).width;
    if(testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = `${words[i]} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

const maxWidth = 0.8 * canvas.width;
const lineHeight = 25;
let x = canvas.width / 2;
let y = 150;
const text = "Breakout begins with 3 rows of bricks. Using a single ball, you must knock down as many bricks as possible by using the walls and/or the paddle below to ricochet the ball against the bricks and eliminate them. If your paddle misses the ball's rebound, you will lose a life. You have three lives. Let the game begin!";

document.addEventListener('click', helpButtonHandler);
document.addEventListener('click', backButtonHandler);

function helpButtonHandler(e) {
  if(e.clientX > helpButtonX + canvas.offsetLeft
    && e.clientX < helpButtonX + helpButtonWidth + canvas.offsetLeft
    && e.clientY > helpButtonY + canvas.offsetTop
    && e.clientY < helpButtonY + helpButtonHeight + canvas.offsetTop) {
    drawHelpScene();
  }
}

function backButtonHandler(e) {
  if(e.clientX > backArrow1 + canvas.offsetLeft
    && e.clientX < backArrow1 + backArrow2 + canvas.offsetLeft
    && e.clientY > backArrow1 + canvas.offsetTop
    && e.clientY < backArrow1 + backArrow2 + canvas.offsetTop) {
    drawMainScene();
  }
}

/******************************************************************************/
// GAME OVER SCENE

function drawGameOverScene() {
  scene = 'game over scene';
  drawGameOverSceneBackground();
  // draw heading
  ctx.textAlign = 'center';
  ctx.fillStyle = yellow;
  ctx.font = '70px fontTwo';
  ctx.fillText('GAME OVER', canvas.width / 2, 150);
  drawPlayAgainButton();
}

function drawGameOverSceneBackground() {
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = red;
  ctx.fill();
  ctx.closePath();
}

function drawPlayAgainButton() {
  ctx.beginPath();
  ctx.rect(playAgainButtonX, playAgainButtonY, playAgainButtonWidth, playAgainButtonHeight);
  ctx.fillStyle = yellow;
  ctx.fill();
  ctx.closePath();
  ctx.textAlign = 'center';
  ctx.fillStyle = red;
  ctx.font = '50px fontOne';
  ctx.fillText('play again', canvas.width / 2, playAgainButtonY + 30);
}

const playAgainButtonX = canvas.width / 10 * 3;
const playAgainButtonY = canvas.height / 20 * 11;
const playAgainButtonWidth = canvas.width / 5 * 2;
const playAgainButtonHeight = canvas.height / 10;

document.addEventListener('click', playAgainButtonHandler);

function playAgainButtonHandler(e) {
  if(e.clientX > playAgainButtonX + canvas.offsetLeft
    && e.clientX < playAgainButtonX + playAgainButtonWidth + canvas.offsetLeft
    && e.clientY > playAgainButtonY + canvas.offsetTop
    && e.clientY < playAgainButtonY + playAgainButtonHeight + canvas.offsetTop
    && scene === 'game over scene') {
      // reset
      ballX = canvas.width / 2;
      ballY = canvas.height - 30;
      ballDX = 1;
      ballDY = -3;
      paddleX = (canvas.width - paddleWidth) / 2;
      lives = 3;
      score = 0;
      for(let r = 0; r < brickRowCount; r++) {
        for(let c = 0; c < brickColumnCount; c++) {
          bricks[r][c].status = 1; // status 1 - paint the brick
        }
      }
    draw();
  }
}
