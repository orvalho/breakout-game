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
let ballY = canvas. height - 30;
const ballDX = 1;
const ballDY = -3;

// game components
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
  ctx.fillStyle = purple;
  ctx.fill();
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  ballX += ballDX;
  ballY += ballDY;
  requestAnimationFrame(draw);
}

draw();
