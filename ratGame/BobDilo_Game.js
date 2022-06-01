let pixelScale = 20,
  diloFigureHeight = 1.4 * pixelScale,
  diloFigureWidth = 30,
  diloFigureRadius = 15,
  diloSizeObj = { "x": 15, "y": 86 },
  diloMoveRate = 0.08,
  originaldiloMoveRate = 0.08,
  levelScrollRate = 0.01,
  redBlock = "#f75b4a",
  backgroundColors = {
    0: "black",
    1: "black",
    2: "black"
    /* 0: "#191038",
    1: "#346557",
    2: "#3c4e72" */
    
  },
  backgroundBlocks,
  diloColor = "#f07373",
  originalDiloColor = "#f07373",
  diloAcceleration = 0.01,
  originalDiloAcceleration = 0.01,
  diloDeceleration = 0.02,
  diloMaxSpeed = 0.3,
  coinsNeededToWin = 0,
  blockCollisionMax = 100,
  diloSpriteWidth = 30,
  diloSpriteHeight = 86,
  diloSprites = document.createElement("img");

diloSprites.src = "dilo_sprite.png"

var charKey = 0;

//Creates a randomized "sparkling" of circles drawn around a point
function sparkleEffect(
  cx,
  xPos,
  yPos,
  radius,
  fillStyle,
  shadowColor,
  shadowBlur,
) {

  for (let i = 0; i < 10; i++) {

    cx.shadowColor = shadowColor;
    cx.shadowBlur = shadowBlur;
    cx.fillStyle = fillStyle;

    if (fillStyle != "green") console.log(fillStyle)

    let signX = 1;
    let signY = 1;

    if (Math.random() > 0.5) signX = -1;
    if (Math.random() > 0.5) signY = -1

    cx.beginPath();

    cx.arc(
      xPos + pixelScale / 2 + signX * Math.random() * pixelScale,
      yPos + pixelScale / 2 + signY * Math.random() * pixelScale,
      radius,
      0,
      7
    );
    cx.fill();
  }
}

//Draws both circular and square background blocks
function drawBackgroundBlock(
  cx,
  xPos,
  yPos,
  fillStyle,
  shadowColor,
  shadowBlur,
  shape,
  radius
) {
  cx.fillStyle = fillStyle;
  cx.shadowColor = shadowColor;
  cx.shadowBlur = shadowBlur;

  cx.beginPath();

  if (shape == "square") {

    cx.fillRect(
      xPos * pixelScale + 0.5,
      yPos * pixelScale + 0.5,
      pixelScale - 1,
      pixelScale - 1,
    )
  } else if (shape == "circle") {

    cx.arc(
      xPos * pixelScale + pixelScale / 2,
      yPos * pixelScale + pixelScale / 2,
      radius,
      0,
      7
    )
    cx.fill();
  }
}

//Draws a circle on canvas
function drawCenteredCircle(
  cx,
  xPos,
  yPos,
  radius,
  fillStyle,
  shadowColor = "",
  shadowBlur = ""
) {
  cx.fillStyle = fillStyle;
  cx.shadowColor = shadowColor;
  cx.shadowBlur = shadowBlur;
  cx.arc(
    xPos,
    yPos,
    radius,
    0,
    7
  )
  cx.fill();
}

//Returns canvas y position converted from level string position
function yCanvasPos(levelY, levelScroll) {
  return (levelY - levelScroll + 30) * pixelScale;
}

//Returns level y position converted from canvas string position
function yLevelPos(canvasY, levelScroll) {
  return (canvasY / pixelScale) + levelScroll - 30
}


//Returns character objet with position values based on canvas (rather than on string level plan)
function characterCanvasConversion(characterObj, level, type) {
  let newX = characterObj.position.x * pixelScale;
  let newY = yCanvasPos(characterObj.position.y, level.height);
  let canvasCharacter = new charTypes[type]({ "x": newX, "y": newY }, characterObj.speed);
  return canvasCharacter
}


// Checks what background objects Dilo collides with and returns them in an array 
// canvasPosObj and sizePosObj are in format {x: .., y: ..} 
function backgroundCollision(canvasPosObj, sizeObj, state) {

  let levelPosX = canvasPosObj.x / pixelScale;
  let levelPosY = yLevelPos(canvasPosObj.y, state.viewport.levelScroll);
  let upperLimit = levelPosY;
  let lowerLimit = levelPosY + (sizeObj.y / pixelScale);
  let leftLimit = levelPosX;
  let rightLimit = levelPosX + sizeObj.x / pixelScale;
  let collisionBlocks = [];

  for (let y = Math.floor(upperLimit); y < Math.ceil(lowerLimit); y++) {

    for (let x = Math.floor(leftLimit); x < Math.ceil(rightLimit); x++) {

      if (state.level.rows[y]) {

        if (state.level.rows[y][x] != "empty"
        /*&& state.level.rows[y][x] != "D"*/) {

          collisionBlocks.push({ "row": y, "column": x, "color": state.level.rows[y][x] })
        }
      }
    }
  }
  return collisionBlocks;
}

//Tracks if keys are currently pressed
let pressedKeys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
}

let gameContainer = document.getElementById('ratGame-container');

class GameCanvas {
  constructor(
    level
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = level.width * pixelScale;
    this.canvas.height = 30 * pixelScale;
    this.scoreCanvas = document.createElement("canvas");
    this.scoreCanvas.width = level.width * pixelScale;
    this.scoreCanvas.height = 5 * pixelScale;
    this.cxCanvas = this.canvas.getContext("2d");
    this.cxScore = this.scoreCanvas.getContext("2d");
    //let gameContainer = document.getElementById('ratGame-container');
    //document.body.appendChild(this.scoreCanvas);
    game.appendChild(this.canvas);
    this.canvas.setAttribute("id", "canvas");
    this.scoreCanvas.setAttribute("id", "scoreCanvas")
  }
}

GameCanvas.prototype.syncCanvasToState = function (state) {

  //state.canvas.removeEventListener("click", clicker)

  this.clearCanvas(
    this.cxScore,
    this.scoreCanvas.width,
    this.scoreCanvas.height,
    "#2c1c63");

  this.drawScoreCanvas(state);

  //update viewport

  this.clearCanvas(
    this.cxCanvas,
    this.canvas.width,
    this.canvas.height,
    backgroundBlocks);

  if (state.status == "won") {

    if (state.gameData.gameWon) {
      this.drawGameWon();

    } else {
      this.drawLevelPassed(state);
    }
  } else {
    if (state.gameData.levelIntroDone) {

      //clickListener(this.canvas);

      this.drawBackground(state);

      for (let char of state.characters) {
        char.draw(this)
      }
    } else {
      this.drawLevelIntroCanvas(state)
    }
  }
}

GameCanvas.prototype.clearCanvas = function (
  cx,
  width,
  heigth,
  color) {

  cx.fillStyle = backgroundBlocks;
  cx.fillRect(0, 0, this.canvas.width, this.canvas.height)
}

GameCanvas.prototype.drawScoreCanvas = function (state) {

  this.cxScore.fillStyle = "#2c1c63";
  this.cxScore.fillRect(0, 0, this.scoreCanvas.width, this.scoreCanvas.height);
  this.cxScore.font = `bold 20px serif`;
  this.cxScore.fillStyle = "white"
  this.cxScore.fillText(`Level: ${state.gameData.level + 1}      Coins collected: ${state.gameData.coinsCollected}/${coinsNeededToWin}      Block collisions: ${state.gameData.blocksTouched}/${blockCollisionMax}`, 10, 50, this.scoreCanvas.width - 20);
}

GameCanvas.prototype.drawLevelIntroCanvas = function (state) {
  this.cxCanvas.font = 'bold 100px serif';

  this.cxCanvas.lineWidth = 1.5;

  this.cxCanvas.textAlign = "center";

  this.cxCanvas.strokeStyle = "white";

  this.cxCanvas.fillStyle = charKey["#"];

  this.cxCanvas.strokeText(`Level ${state.gameData.level + 1}`, this.canvas.width / 2, this.canvas.height / 4);

  if (state.gameData.level == 0) {

    let ruleSpacer = 100;
    let gameRules = [
      `Move rat with arrows`,
      `Aim vicious attacks with mouse`,
      `Collect ${coinsNeededToWin} cheese coins`,
      `Limit block collisions to ${blockCollisionMax}`
    ]

    this.cxCanvas.font = 'bold 25px serif';
    this.cxCanvas.textAlign = "left";

    for (let rule of gameRules) {

      this.cxCanvas.fillText(rule, 10, this.canvas.height / 4 + ruleSpacer);

      ruleSpacer += 50;
    }

    ruleSpacer += 50;
  }
}

GameCanvas.prototype.drawBackground = function (state) {

  let level = state.level;


  let { levelScroll, height, width } = state.viewport;

  let rowPosition;

  let radius = pixelScale / 2;

  for (let y = height; y >= 0; y--) {

    rowPosition = (30 - y - (levelScroll % 1))

    let pixelRow;

    pixelRow = Math.floor(levelScroll - y)

    for (let x = 0; x < width; x++) {

      if (level.rows[pixelRow]) {

        let color = level.rows[pixelRow][x];

        let shape;

        if (color != "empty") {

          if (color == charKey["*"]) {

            shape = "circle";
            radius = pixelScale / 2;
          }

          if (color == charKey["#"]) {

            shape = "square";
            radius = pixelScale / 2;
          }

          if (color == "collided") {

            if (level.unparsedRows[pixelRow][x] == "#") {
              shape = "square";
              color = redBlock;
              radius = pixelScale / 2;
            }
          }
        }

        drawBackgroundBlock(
          this.cxCanvas,
          x,
          rowPosition,
          color,
          color,
          8,
          shape,
          radius);
      }
    }
  }
}

GameCanvas.prototype.drawLevelPassed = function (state) {
  this.cxCanvas.font = 'bold 80px serif';
  this.cxCanvas.textAlign = "center";
  this.cxCanvas.strokeStyle = charKey["#"]
  this.cxCanvas.strokeText(`Level ${state.gameData.level + 1}`, this.canvas.width / 2, this.canvas.height / 3, this.canvas.width);
  this.cxCanvas.lineWidth = 1.5;
  this.cxCanvas.fillStyle = "#f75b4a"
  this.cxCanvas.fillText(`PASSED`, this.canvas.width / 2, this.canvas.height / 3 + 80, this.canvas.width);
}

GameCanvas.prototype.drawGameWon = function () {
  this.cxCanvas.fillStyle = backgroundBlocks;
  this.cxCanvas.font = 'bold 80px serif';
  this.cxCanvas.textAlign = "center";
  this.cxCanvas.fillRect(0, 0, this.canvas.width, this.canvas.height)
  this.cxCanvas.fillStyle = "white";
  this.cxCanvas.fillText(`YOU WIN!`, this.canvas.width / 2, this.canvas.height / 3 + 80, this.canvas.width);
}


class Dilo {

  constructor(pos, speed) {
    this.position = pos;
    this.speed = speed;
  }

  static create({ x, y }) {
    return new Dilo({ "x": x, "y": y }, { "up": 0, "down": 0, "left": 0, "right": 0 })
  }

  //Updates Dilo x and y position according to time elapsed and arrows pressed
  //Checks for Dilo collisions with background
  update(timeElapsed, state) {

    let newX = this.position.x;
    let newY = this.position.y;

    let canvasWidth = state.level.width * pixelScale;
    let canvasHeight = 30 * pixelScale;

    if (pressedKeys.ArrowRight == true) {
      if (this.speed.right < diloMaxSpeed) {
        this.speed.right += diloAcceleration;
      }
    } else if (this.speed.right > 0) {
      this.speed.right = Math.max(this.speed.right - diloDeceleration, 0);
    }

    if (pressedKeys.ArrowLeft == true) {
      if (this.speed.left < diloMaxSpeed) {
        this.speed.left += diloAcceleration;
      }
    } else if (this.speed.left > 0) {
      this.speed.left = Math.max(this.speed.left - diloDeceleration, 0);;
    }

    if (pressedKeys.ArrowUp == true) {
      if (this.speed.up < diloMaxSpeed) {
        this.speed.up += diloAcceleration;
      }
    } else if (this.speed.up > 0) {
      this.speed.up = Math.max(this.speed.up - diloDeceleration, 0);;
    }

    if (pressedKeys.ArrowDown == true) {
      if (this.speed.down < diloMaxSpeed) {
        this.speed.down += diloAcceleration;
      }
    } else if (this.speed.down > 0) {
      this.speed.down = Math.max(this.speed.down - diloDeceleration, 0);;
    }

    newX += timeElapsed * this.speed.right;
    newX -= timeElapsed * this.speed.left;
    newY -= timeElapsed * this.speed.up;
    newY += timeElapsed * this.speed.down;

    //Start of Dilo canvas boundary limits
    //Makes sure Dilo character positions don't move past canvas boundaries    
    if (newX < diloFigureRadius) {
      newX = diloFigureRadius;
    }
    if (newX > canvasWidth - diloFigureRadius) {
      newX = canvasWidth - diloFigureRadius;
    };
    if (newY < diloFigureRadius) {
      newY = diloFigureRadius;
    };
    if (newY > canvasHeight - diloFigureRadius) {
      newY = canvasHeight - diloFigureRadius
    };
    //End of Dilo canvas boundary limits

    //Collided value is array of background elements that Dilo collided with
    let collided = backgroundCollision(
      { "x": newX, "y": newY },
      diloSizeObj,
      state
    );

    //Updates gameData with how many coins and blocks have been collided with
    //Sets status to lost if blocks touched exceeds blockCollisionMax 
    for (let block of collided) {

      if (state.level.rows[block.row][block.column] != "collided") {

        if (state.level.unparsedRows[block.row][block.column] == "#") {
          state.gameData.blocksTouched++;

          if (state.gameData.blocksTouched > blockCollisionMax) {
            state.status = "lost";
          }
        }
        if (state.level.unparsedRows[block.row][block.column] == "*") {
          state.gameData.coinsCollected++;
        }

        state.level.rows[block.row][block.column] = "collided";
      }
    }

    return new Dilo({ "x": newX, "y": newY }, this.speed)
  }

  //Draws Dilo sprite on canvas
  draw(gameCanvas) {

    gameCanvas.cxCanvas.shadowColor = "#f07373";
    let spriteTile = Math.floor(Date.now() / 50) % 5;

    gameCanvas.cxCanvas.save();

    // tilt dilo sprite according to mouse position
    let clientRect = gameCanvas.canvas.getBoundingClientRect()

    let mouseX = mousePos.x - clientRect.left;
    let mouseY = mousePos.y - clientRect.y;
    
    /* drawCenteredCircle(
      gameCanvas.cxCanvas,
      mouseX,
      mouseY,
      5,
      "red"
    ) */

    if (mousePos) {
      let diloAngleRad = Math.atan2(
        mouseY - this.position.y,
        mouseX - this.position.x
      );

      gameCanvas.cxCanvas.translate(this.position.x, this.position.y)
      gameCanvas.cxCanvas.rotate(diloAngleRad += Math.PI / 2);
      gameCanvas.cxCanvas.translate(-this.position.x, -this.position.y)
    }
    //draw dilo sprite from png
    gameCanvas.cxCanvas.drawImage(
      diloSprites,
      spriteTile * diloSpriteWidth,
      0,
      diloSpriteWidth,
      diloSpriteHeight,
      this.position.x - diloSizeObj.x/2,
      this.position.y - diloSizeObj.y/2,
      diloSpriteWidth,
      diloSpriteHeight,
    )
    gameCanvas.cxCanvas.restore();

    /*   drawCenteredCircle(
        gameCanvas.cxCanvas,
        this.position.x,
        this.position.y,
        diloFigureRadius,
        diloColor,
        diloColor,
        10
      ) */
  }

  get type() {
    return "bobDilo"
  }
}

//Poorly named blackhole character is a sparkling background element
class BlackHole {
  constructor(pos) {
    this.position = pos;
  }

  update(timeElapsed, state) {
    let newY = this.position.y += timeElapsed * state.scrollRate * pixelScale;
    return new BlackHole({ "x": this.position.x, "y": newY })
  }

  draw(gameCanvas) {

    sparkleEffect(
      gameCanvas.cxCanvas,
      this.position.x,
      this.position.y,
      5,
      "green",
      "#84FF6B",
      60
    )
  };

  static create({ x, y }) {
    return new BlackHole({ "x": x, "y": y }, { "x": 0, "y": 0 })
  }

  get type() {
    return "blackHole"
  }
}

//Charkeys contains objects with key to values of each type of character encountered in the level plan strings. Each object of charkeys corresponds to a level (with colors of background elements changing)
var charKeys = {
  0: {
    "#": "#409486",
    "*": "#ffd666",
    ".": "empty",
    "D": Dilo,
    "b": BlackHole
  },
  1: {
    "#": "#b375ff",
    "*": "#ffd666",
    "#": "#ffffcc",
    "*": "#ffd666",
    ".": "empty",
    "D": Dilo,
    "b": BlackHole
  }
  ,
  2: {
    "#": "#ffffcc",
    "*": "#ffd666",
    ".": "empty",
    "D": Dilo,
    "b": BlackHole
  }
}

//Helper object - might be possible to clean up later
var charTypes = {
  "bobDilo": Dilo,
  "blackHole": BlackHole
}


//Takes level plan string as input, and creates level object
var Level = class Level {

  constructor(levelString) {

    let rows = levelString.trim().split("\n").map(r => [...r]);
    this.unparsedRows = rows;
    this.startingCharacters = [];

    this.rows = rows.map((row, y) => {

      return row.map((char, x) => {

        if (typeof charKey[char] == "string") return charKey[char];

        else {
          this.startingCharacters.unshift(charKey[char].create({ "x": x, "y": y }));
          return "empty";
        }
      })
    })
    this.height = rows.length;
    this.width = rows[0].length;
  }
}


class State {

  constructor(
    level,
    characters,
    status,
    gameData,
    levelScroll,
    scrollRate,
    //pointerObj
  ) {
    this.level = level;

    this.characters = characters;

    //Tracks if current level is "playing", "won", or "lost"
    this.status = status;

    this.gameData = gameData;


    //Keeps track of game canvas edges relative to level plan scrolling across canvas
    this.viewport = {
      levelScroll: levelScroll,
      height: 30,
      width: level.width
    }

    this.scrollRate = scrollRate;

  }

  static start(level, levelsLength, levelIndex) {
    let canvasCharacters = []

    for (let character of level.startingCharacters) {
      let type = character.type;
      character = characterCanvasConversion(character, level, type)
      canvasCharacters.push(character);
    }

    return new State(
      level,
      canvasCharacters,
      "playing",
      {
        coinsCollected: 0,
        blocksTouched: 0,
        health: 100,
        level: levelIndex,
        levelsLength,
        gameWon: false,
        levelIntroDone: false
      },
      level.height,
      levelScrollRate
    )
  }

  update(timeElapsed, state) {

    if (counter % 300 == 0) {
      console.log(state);
    }

    this.viewport.levelScroll -= timeElapsed * state.scrollRate;

    let newCharacters = [];

    for (let i = 0; i < this.characters.length; i++) {

      let newChar = this.characters[i].update(timeElapsed, state);

      newCharacters[i] = newChar;
    }

    return new State(
      this.level,
      newCharacters,
      this.status,
      this.gameData,
      this.viewport.levelScroll,
      this.scrollRate
    );
  }

  //Uses elapsed time and state to draw game canvas and score canvas. Alternates between level start, level passed, game, and game won

  //Might use again if creating custom crosshair pointer
  /* drawPointer(x, y) {
    //if (counter % 100 == 0) console.log(mousePos)
    this.cx.fillStyle = "white";
    this.cx.arc(x, y, 5, 0, 7)
    this.cx.fill();
  } */

}


window.addEventListener("keydown", event => {
  if (pressedKeys.hasOwnProperty(event.key)) {
    pressedKeys[event.key] = true;
    event.preventDefault();
  }
})


window.addEventListener("keyup", event => {
  if (pressedKeys.hasOwnProperty(event.key)) {
    pressedKeys[event.key] = false;
    event.preventDefault();
  }
})

let mousePos = { x: 0, y: 0 }

//track mouse
window.addEventListener("mousemove", event => {
  let activated;
  if (!activated) {
    mousePos = { x: event.pageX, y: event.pageY };

    activated = null;
  }
  scheduled = true;
})


function clicker(event) {

  console.log(`Clicked x: ${event.pageX}, y: ${event.pageY}`)
}

function clickListener(gameCanvas) {
  //let canvasElement = document.getElementById("canvas");
  //console.log(state.canvas)
  // calls bullet character class create method
  // remeber to convert event click with bounding rectangle thingamadoo
  window.addEventListener("click", clicker)
}


let counter = 0;

function runLevel(levelsArray, levelIndex) {
  charKey = charKeys[levelIndex];
  let levelObj = new Level(levelsArray[levelIndex]);

  let gameCanvas = new GameCanvas(levelObj);

  let state = State.start(levelObj, levelsArray.length, levelIndex);
  clickListener(gameCanvas)

  let startScreenTimer = 0;
  backgroundBlocks = backgroundColors[levelIndex]

  //endTimer used to implement pause to display level status between end of current level and start of next level (or "You Win!")
  let endTimer = 0;

  //gameWonTimer used to implement pause to display "You Win!"" screen before canvas is cleared
  let gameWonTimer = 0;
  return new Promise((resolve) => {
    function frameAnimation(
      timeCurrentFrame,
      timePreviousFrame,
      state
    ) {

      counter++;

      //Uses time elapsed between frames to make animation smooth
      let timeElapsed = timeCurrentFrame - timePreviousFrame;
      if (timeElapsed > 17) timeElapsed = 17;
      startScreenTimer += timeElapsed;

      if (state.gameData.levelIntroDone == true) {
        state = state.update(timeElapsed, state)

      }

      let startScreenCounter = 2000;
      if (
        state.gameData.levelIntroDone == false &&
        state.gameData.level == 0
      ) {
        startScreenCounter = 1000;
      }

      if (startScreenTimer > startScreenCounter) {
        state.gameData.levelIntroDone = true;
      }

      gameCanvas.syncCanvasToState(state);
      timePreviousFrame = timeCurrentFrame;

      if (state.viewport.levelScroll < 30) {

        if (state.gameData.coinsCollected < coinsNeededToWin) {
          state.status = "lost"

        } else {
          state.status = "won";
        }
      }

      let endTimerControl = 1;


      if (state.status == "playing") {
        requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))


      } else if (endTimer < endTimerControl) {

        if (state.status == "lost") {
          diloColor = "white"
        }

        state.scrollRate = 0;
        endTimer += 0.01;

        requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))

        //resolve(state.status);
      } else {

        if ((state.gameData.level == state.gameData.levelsLength - 1)
          && (state.status = "won")) {

          state.gameData.gameWon = true;

          if (gameWonTimer < 1) {
            gameWonTimer += 0.01;
            requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))

          } else {
            gameCanvas.canvas.remove();
            gameCanvas.scoreCanvas.remove();
            resolve(state.status);
          }
        } else {
          diloColor = originalDiloColor;
          gameCanvas.canvas.remove();
          gameCanvas.scoreCanvas.remove();
          resolve(state.status);
        }
      }
    }

    requestAnimationFrame(newTime => frameAnimation(newTime, oldTime = newTime, state))
  })
}


async function runGame(levelsArray) {
  for (let levelIndex = 0; levelIndex < levelsArray.length;) {
    let status = await runLevel(levelsArray, levelIndex);
    if (status == "won") {
      levelIndex++;
    }
  }

  console.log("YOU WIN!!")
}
