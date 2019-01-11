'use strict';
const canvas = document.getElementById('gameCanvas'),
         ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 400;

const colors = {
  yellow: 'rgb(247, 189, 0)',
  orange: 'rgb(247, 84, 49)',
  red: 'rgb(193, 0, 55)',
  burgundy: 'rgb(139, 12, 60)',
  purple: 'rgb(84, 23, 67)'
};

function mainLoop() {
  game.background.draw();
  view.drawBricks();
  view.drawBall();
  view.drawPaddle();
  view.drawScore();
  view.drawLives();
  game.ball.move();
  game.ball.bounceOff();
  game.paddle.move();
  game.bricks.detectCollision();

  if(game.score.won()) {
    winScene.draw();
    return;
  }

  if(game.ball.hitBottom()) {
    game.lives.value--;
    if(game.lives.gameOver()) {
      gameOverScene.draw();
      return;
    } else {
      game.ball.reset();
      game.paddle.reset();
    }
  }
  requestAnimationFrame(mainLoop);
}


/*==============================================================================
SCENES - setup
==============================================================================*/

/*====================  background  ==========================================*/
const Background = function(config) {
  this.color = config.color || colors.red;
};

Background.prototype.draw = function() {
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = this.color;
  ctx.fill();
  ctx.closePath();
};


/*====================  one-liner  ===========================================*/
const OneLiner = function(config) {
  this.text = config.text || 'text';
  this.textX = config.textX || canvas.width / 2;
  this.textY = config.textY || canvas.height / 2.6;
  this.color = config.color || colors.yellow;
  this.textAlign = config.textAlign || 'center';
  this.fontSize = config.fontSize || '70px';
  this.fontFamily = config.fontFamily || 'fontTwo';
};

OneLiner.prototype.draw = function() {
  ctx.textAlign = this.textAlign;
  ctx.fillStyle = this.color;
  ctx.font = `${this.fontSize} ${this.fontFamily}`;
  ctx.fillText(this.text, this.textX, this.textY);
};


/*====================  button  ==============================================*/
const Button = function(config) {
  this.x = config.x || canvas.width / 10 * 3;
  this.y = config.y || canvas.height / 20 * 11;
  this.width = config.width || canvas.width / 5 * 2;
  this.height = config.height || canvas.height / 10;
  this.color = config.color || colors.yellow;
  this.label = config.label || 'click me!';
  this.labelX = config.labelX || canvas.width / 2;
  this.labelY = config.labelY || this.y + this.height / 4 * 3;
  this.labelAlign = config.labelAlign || 'center';
  this.labelFontSize = config.labelFontSize || '50px';
  this.labelFontFamily = config.labelFontFamily || 'fontOne';
  this.labelColor = config.labelColor || colors.red;
  this.onClick = config.onClick || function() {};
};

Button.prototype.draw = function() {
  ctx.beginPath();
  ctx.rect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = this.color;
  ctx.fill();
  ctx.closePath();
  ctx.textAlign = this.labelAlign;
  ctx.fillStyle = this.labelColor;
  ctx.font = `${this.labelFontSize} ${this.labelFontFamily}`;
  ctx.fillText(this.label, this.labelX, this.labelY);
};

Button.prototype.isMouseInside = function(e) {
  return (e.clientX > this.x + canvas.offsetLeft
       && e.clientX < this.x + this.width + canvas.offsetLeft
       && e.clientY > this.y + canvas.offsetTop
       && e.clientY < this.y + this.height + canvas.offsetTop);
};

Button.prototype.handleMouseClick = function(e) {
  if(this.isMouseInside(e)) {
    this.onClick();
  }
};


/*==============================================================================
SCENES
==============================================================================*/
let currentScene;

/*====================  playing scene  =======================================*/
/*==============================================================================
game constants and settings
==============================================================================*/
const game = {
  background: new Background({ color: colors.yellow }),
  ball: {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 1,
    dy: -3,
    radius: 10,
    color: colors.purple,
    move: function() {
      this.x += this.dx;
      this.y += this.dy;
    },
    hitTop: function() {
      return this.y + this.dy - this.radius < 0;
    },
    hitBottom: function() {
      return this.y + this.dy + this.radius > canvas.height;
    },
    hitSideWall: function() {
      return (this.x + this.dx - this.radius < 0 ||
              this.x + this.dx + this.radius > canvas.width);
    },
    hitPaddle: function() {
      return (this.x > game.paddle.x &&
              this.x < game.paddle.x + game.paddle.width &&
              this.y + this.dy + this.radius > canvas.height - game.paddle.height);
    },
    bounceOffTop: function() {
      if (this.hitTop()) this.dy = -this.dy;
    },
    bounceOffSideWall: function() {
      if (this.hitSideWall()) this.dx = -this.dx;
    },
    bounceOffPaddle: function() {
      if (this.hitPaddle()) this.dy = -this.dy;
    },
    bounceOff: function() {
      this.bounceOffTop();
      this.bounceOffSideWall();
      this.bounceOffPaddle();
    },
    reset: function() {
      this.x = canvas.width / 2;
      this.y = canvas.height - 30;
      this.dx = 1;
      this.dy = -3;
    }
  },
  paddle: {
    x: (canvas.width - 75) / 2,
    y: canvas.height - 15 - 5, // 5 from bottom
    width: 75,
    height: 15,
    color: colors.purple,
    touchCanvasLeftEdge: function() {
      return this.x <= 0;
    },
    touchCanvasRightEdge: function() {
      return this.x + this.width >= canvas.width;
    },
    moveLeft: function() {
      if(game.keys.leftKey && !this.touchCanvasLeftEdge()) this.x -= 7;
    },
    moveRight: function() {
      if(game.keys.rightKey && !this.touchCanvasRightEdge()) this.x += 7;
    },
    move: function() {
      this.moveLeft();
      this.moveRight();
    },
    reset: function() {
      this.x = (canvas.width - 75) / 2;
    }
  },
  bricks: {
    rowCount: 3,
    columnCount: 8,
    offsetTop: 25, // setting a top and left offset so bricks won't start being drawn right from the edge of the canvas
    offsetLeft: 30,
    padding: 10, // setting padding between the bricks so they won't touch each other
    height: 20,
    getWidth: function() {
      return (canvas.width - 2 * this.offsetLeft + this.padding) / this.columnCount - this.padding;
    },
    brickList: [], // holds x, y positions, status and value of each brick
    getPosition: function() {
      for(let r = 0; r < this.rowCount; r++) {
        for(let c = 0; c < this.columnCount; c++) {
          this.brickList.push({
            x: c * (this.getWidth() + this.padding) + this.offsetLeft,
            y: r * (this.height + this.padding) + this.offsetTop,
            status: 1, // status 1 - paint the brick, status 0 - don't paint it
            value: 500 - r * 200 // upper row - 500 points for each brick, middle - 300, lowest - 100
          });
        }
      }
    },
    reset: function() {
      this.brickList.forEach(function(brick) {
        brick.status = 1;
      });
    },
    detectCollision: function() {
      this.brickList.forEach(function(brick) {
        if (!brick.status) return;

        let inBricksColumn = game.ball.x > brick.x && game.ball.x < brick.x + game.bricks.getWidth(),
            inBricksRow = game.ball.y > brick.y && game.ball.y < brick.y + game.bricks.height;

        if (inBricksColumn && inBricksRow) {
          game.ball.dy = -game.ball.dy;
          brick.status = 0; // status 0 - don't paint the brick
          game.score.value += brick.value;
        }
      });
    }
  },
  score: {
    value: 0,
    maxValue: function() {
      return ((game.bricks.brickList[0].value +
               game.bricks.brickList[game.bricks.columnCount].value +
               game.bricks.brickList[game.bricks.columnCount * 2].value) *
               game.bricks.columnCount);
    },
    reset: function() {
      this.value = 0;
    },
    won: function() {
      return this.value === this.maxValue();
    },
    color: colors.burgundy,
    fontSize: '25px',
    fontFamily: 'fontOne',
    x: 10,
    y: 18,
    text: 'Score:'
  },
  lives: {
    value: 3,
    reset: function() {
      this.value = 3;
    },
    gameOver: function() {
      return this.value === 0;
    },
    color: colors.burgundy,
    fontSize: '25px',
    fontFamily: 'fontOne',
    x: canvas.width - 70,
    y: 18,
    text: 'Lives:'
  },
  keys: {
    leftKey: false,
    rightKey: false,
    leftKeyPressed: function(e) {
      return e.key === 'ArrowLeft';
    },
    rightKeyPressed: function(e) {
      return e.key === 'ArrowRight';
    }
  },
  resetGame: function() {
    game.ball.reset();
    game.paddle.reset();
    game.score.reset();
    game.lives.reset();
    game.bricks.reset();
    mainLoop();
  }
};

game.bricks.getPosition();


/*==============================================================================
CONTROLLER
==============================================================================*/
const controller = {
  keyDown: function(e) {
    if(game.keys.leftKeyPressed(e)) game.keys.leftKey = true;
    if(game.keys.rightKeyPressed(e)) game.keys.rightKey = true;
  },
  keyUp: function(e) {
    if(game.keys.leftKeyPressed(e)) game.keys.leftKey = false;
    if(game.keys.rightKeyPressed(e)) game.keys.rightKey = false;
  },
  mouseMove: function(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > game.paddle.width / 2 && relativeX < canvas.width - game.paddle.width / 2) {
      game.paddle.x = relativeX - game.paddle.width / 2;
    }
  }
};


/*==============================================================================
VIEW
==============================================================================*/
const view = {
  drawBall: function() {
    ctx.beginPath();
    ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = game.ball.color;
    ctx.fill();
    ctx.closePath();
  },
  drawPaddle: function() {
    ctx.beginPath();
    ctx.rect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);
    ctx.fillStyle = game.paddle.color;
    ctx.fill();
    ctx.closePath();
  },
  drawBricks: function() {
    game.bricks.brickList.forEach(function(brick, position) {
      // get row number
      let rowNum;
      if(position < game.bricks.columnCount) rowNum = 0;
      else if(position < 2 * game.bricks.columnCount) rowNum = 1;
      else rowNum = 2;
      // color brick rows
      switch(rowNum) {
        case 0: ctx.fillStyle = colors.purple; break;
        case 1: ctx.fillStyle = colors.burgundy; break;
        case 2: ctx.fillStyle = colors.red; break;
      }
      // draw bricks
      if(brick.status) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, game.bricks.getWidth(), game.bricks.height);
        ctx.fill();
        ctx.closePath();
      }
    });
  },
  drawScore: function() {
    ctx.font = `${game.score.fontSize} ${game.score.fontFamily}`;
    ctx.fillStyle = game.score.color;
    ctx.fillText(`${game.score.text} ${game.score.value}`, game.score.x, game.score.y);
  },
  drawLives: function() {
    ctx.font = `${game.lives.fontSize} ${game.lives.fontFamily}`;
    ctx.fillStyle = game.lives.color;
    ctx.fillText(`${game.lives.text} ${game.lives.value}`, game.lives.x, game.lives.y);
  },
  setUpEventListeners: function() {
    document.addEventListener('keydown', controller.keyDown);
    document.addEventListener('keyup', controller.keyUp);
    document.addEventListener('mousemove', controller.mouseMove);
  }
};

view.setUpEventListeners();


/*====================  game over scene  =====================================*/
const gameOverScene = {
  scene: 'gameOver',
  background: new Background({}),
  oneLiner: new OneLiner({ text: 'GAME OVER' }),
  button: new Button({
    label: 'play again',
    onClick: function() { if(currentScene === gameOverScene.scene) game.resetGame() }
  }),
  draw: function() {
    currentScene = this.scene;
    this.background.draw();
    this.oneLiner.draw();
    this.button.draw();
  }
};

document.addEventListener('click', gameOverScene.button.handleMouseClick.bind(gameOverScene.button));


/*====================  win scene  ===========================================*/
const winScene = {
  scene: 'win',
  background: new Background({ color: colors.burgundy }),
  oneLiner1: new OneLiner({
    text: 'You won!',
    fontSize: '80px'
  }),
  oneLiner2: new OneLiner({
    text: 'Congratulations!',
    textY: canvas.height / 1.9,
    fontSize: '40px'
  }),
  oneLiner3: new OneLiner({
    text: `Your score: ${game.score.maxValue()}.`,
    textY: canvas.height / 1.6,
    fontSize: '20px'
  }),
  button: new Button({
      y: canvas.height / 4 * 3,
      label: 'play again',
      labelColor: colors.burgundy,
      onClick: function() { if(currentScene === winScene.scene) game.resetGame() }
  }),
  draw: function() {
    currentScene = this.scene;
    this.background.draw();
    this.drawCirclesAtRandomPos();
    this.oneLiner1.draw();
    this.oneLiner2.draw();
    this.oneLiner3.draw();
    this.button.draw();
  },
  // for decorative purposes
  drawCirclesAtRandomPos: function () {
    for(let i = 0; i < 200; i++) {
      let randomX = Math.floor(Math.random() * canvas.width + 1);
      let randomY = Math.floor(Math.random() * canvas.height + 1);

      ctx.beginPath();
      ctx.arc(randomX, randomY, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.yellow;
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(randomX, randomY, 2, 0, Math.PI * 2);
      ctx.fillStyle = colors.burgundy;
      ctx.fill();
      ctx.closePath();
    }
  }
};

document.addEventListener('click', winScene.button.handleMouseClick.bind(winScene.button));


/*====================  main scene  ==========================================*/
const mainScene = {
  scene: 'main',
  background: new Background({ color: colors.purple }),
  oneLiner: new OneLiner({
    text: 'BREAKOUT',
    fontSize: '80px'
  }),
  startButton: new Button({
    x: canvas.width / 5 * 2,
    width: canvas.width / 5,
    label: 'start',
    labelColor: colors.purple,
    onClick: function() { if(currentScene === mainScene.scene) game.resetGame() }
  }),
  helpButton: new Button({
    x: canvas.width / 5 * 2,
    y: canvas.height / 10 * 7,
    width: canvas.width / 5,
    label: 'help',
    labelColor: colors.purple,
    onClick: function() { if(currentScene === mainScene.scene) helpScene.draw() }   // helpScene.draw
  }),
  draw: function() {
    currentScene = this.scene;
    this.background.draw();
    this.oneLiner.draw();
    this.startButton.draw();
    this.helpButton.draw();
    this.drawLineOfCircles(20, true);
    this.drawLineOfCircles(canvas.height - 20, true);
    this.drawLineOfCircles(15, false);
    this.drawLineOfCircles(canvas.width - 15, false);
  },
  // for decorative purposes
  drawLineOfCircles: function(a, horizontal) {
    for(let i = 0; ; i++) {
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
      ctx.fillStyle = colors.yellow;
      ctx.fill();
      ctx.closePath();
    }
  }
};

document.addEventListener('click', mainScene.startButton.handleMouseClick.bind(mainScene.startButton));
document.addEventListener('click', mainScene.helpButton.handleMouseClick.bind(mainScene.helpButton));

/*====================  help scene  ==========================================*/
const helpScene = {
  scene: 'help',
  background: new Background({ color: colors.orange }),
  oneLiner: new OneLiner({
    text: 'HOW TO PLAY:',
    textY: canvas.height / 5,
    color: colors.purple,
    fontSize: '50px',
    fontFamily: 'fontOne'
  }),
  multiLiner: {
    text: "Breakout begins with 3 rows of bricks. Using a single ball, you must knock down as many bricks as possible by using the walls and/or the paddle below to ricochet the ball against the bricks and eliminate them. If your paddle misses the ball's rebound, you will lose a life. You have three lives. Let the game begin!",
    x: canvas.width / 2,
    y: canvas.height / 2.6,
    maxWidth: 0.8 * canvas.width,
    lineHeight: 25
  },
  drawMultiLiner: function(text, x, y, maxWidth, lineHeight) {
    ctx.font = '30px fontOne';
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
  },
  backArrow: {
    backArrow1: 40,
    backArrow2: 45,
    backArrow3: 80
  },
  drawBackArrow: function() {
    ctx.beginPath();
    ctx.strokeStyle = colors.purple;
    ctx.lineWidth = 10;
    ctx.moveTo(this.backArrow.backArrow1, this.backArrow.backArrow2);
    ctx.lineTo(this.backArrow.backArrow3, this.backArrow.backArrow2);
    // 2nd line
    ctx.moveTo(this.backArrow.backArrow2, this.backArrow.backArrow1);
    ctx.lineTo(this.backArrow.backArrow2, this.backArrow.backArrow3);
    // 3rd line
    ctx.moveTo(this.backArrow.backArrow2, this.backArrow.backArrow2);
    ctx.lineTo(this.backArrow.backArrow3, this.backArrow.backArrow3);
    ctx.stroke();
    ctx.closePath();
  },
  button: new Button({
    x: 40, // backArrow1
    y: 40, // backArrow1
    width: 45, // backArrow2
    height: 45, // backArrow2
    onClick: function() { if(currentScene === helpScene.scene) mainScene.draw() }
  }),
  draw: function() {
    currentScene = this.scene;
    this.background.draw();
    this.oneLiner.draw();
    this.drawMultiLiner(this.multiLiner.text, this.multiLiner.x, this.multiLiner.y, this.multiLiner.maxWidth, this.multiLiner.lineHeight);
    this.drawBackArrow();
  }
};

document.addEventListener('click', helpScene.button.handleMouseClick.bind(helpScene.button));

// preload fonts and only then draw main scene
document.fonts.load('10pt fontTwo').then(mainScene.draw.bind(mainScene));
document.fonts.load('10pt fontOne').then(mainScene.draw.bind(mainScene));
