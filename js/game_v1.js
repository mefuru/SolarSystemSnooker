/*jshint strict: false, devel: true, node:true*/

// Psychedellic snooker
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60); // 60 fps
    };
})();

// https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame
// http://www.html5canvastutorials.com/advanced/html5-canvas-animation-stage/

// Initialise variables
var canvas = document.createElement("canvas");
canvas.width = 888;
canvas.height = 500;
document.body.appendChild(canvas);
var ctx = canvas.getContext("2d"),
    ballSize = 20,
    cueBallSides = 3,
    colourBallSides = 5,
    orbitRadius = 142,
    outerLimit = 230,
    balls = {},
    cueBall = {
      xPos: canvas.width/2,
      yPos: canvas.height/2 - orbitRadius,
      fillStyle: "rgb(255,255,255)",
      a: Math.PI, // angle
      r: orbitRadius,
      da: 0.06 // angular speed
    },
    then = Date.now(),
    rotationAngle = 0,
    colourMap = {
      red: "rgb(200,0,0)",
      yellow: "rgb(255,255,0)",
      green: "rgb(0,128,0)",
      brown: "rgb(139,69,19)",
      blue: "rgb(0,0,205)",
      pink: "rgb(255,105,180)",
      black: "rgb(0,0,0)"
    },
    penalty = {
      red: 4,
      yellow: 4,
      green: 4,
      brown: 4,
      blue: 5,
      pink: 6,
      black: 7
    },
    // score tracking variables
    currentBreak = [],
    currentBreakScore = 0,
    rotationAngle2,
    rotationSpeed = 20000,
    totalScore = 0;

// constructor fn
var Ball = function (colour, pointsValue) {
  this.xPos = canvas.width*0.5;
  this.yPos = canvas.height*0.5;
  this.initialVel = [(Math.random() * (0.9 - 0.1) + 0.1) * (Math.random() < 0.5 ? -1 : 1), (Math.random() * (0.9 - 0.1) + 0.1) * (Math.random() < 0.5 ? -1 : 1)];
  this.currentVel = this.initialVel;
  this.ballSize = ballSize;
  this.colour = colour;
  this.fillStyle = colourMap[colour];
  this.pointsValue = pointsValue;
};

Ball.prototype.updateBallPosition = function () {
  // reverse velocity if call hits collides with outer circle
  if (Math.sqrt(Math.pow((this.xPos-canvas.width*0.5),2) + Math.pow((this.yPos-canvas.height*0.5),2)) > outerLimit) {
    this.initialVel[0] = -this.initialVel[0];
    this.initialVel[1] = -this.initialVel[1];
  }
  // randomise velocity if ball arrives at centre
  if (Math.abs(this.xPos-canvas.width*0.5)===0 || Math.abs(this.yPos-canvas.height*0.5)===0) {
    this.initialVel = [(Math.random() * (0.9 - 0.1) + 0.1) * (Math.random() < 0.5 ? -1 : 1), (Math.random() * (0.9 - 0.1) + 0.1) * (Math.random() < 0.5 ? -1 : 1)];
  }
  this.xPos = this.xPos + this.initialVel[0];
  this.yPos = this.yPos + this.initialVel[1];
};

Ball.prototype.drawBall = function() {
    drawPolygon(this.xPos - canvas.width/2, this.yPos - canvas.height/2, this.fillStyle, this.ballSize, colourBallSides, rotationAngle);
};

Ball.prototype.checkCollision = function() {
  if (Math.sqrt(Math.pow(this.xPos-cueBall.xPos, 2) + Math.pow(this.yPos-cueBall.yPos, 2)) < ballSize*2) return true;
};

Ball.prototype.resetPosition = function() {
  this.xPos = canvas.width/2;
  this.yPos = canvas.height/2;
};

var createBalls = function() {
  for (var i = 0; i < 15; i++) {
    balls["red"+i] = new Ball("red", 1);
  }
  balls.yellow = new Ball("yellow", 2);
  balls.green = new Ball("green", 3);
  balls.brown = new Ball("brown", 4);
  balls.blue = new Ball("blue", 5);
  balls.pink = new Ball("pink", 6);
  balls.black = new Ball("black", 7);
};

// check for collisions between cueball and coloured balls
var checkForCollisions = function() {
  for (var ball in balls) {
    if(balls[ball].checkCollision()) {
      if(checkValidity(ball)) {
        currentBreakScore = currentBreakScore + balls[ball].pointsValue;
        totalScore = totalScore + balls[ball].pointsValue;
        currentBreak.push(balls[ball]);
        if (balls[ball].colour == "red") {
          delete balls[ball];
        } else {
            if (Object.keys(balls).length > 6) {
                balls[ball].resetPosition();
            }
            if (Object.keys(balls).length == 6 && currentBreak.length > 1) {
                currentBreak.length = 0; // reset current break
                balls[ball].resetPosition();
            }
            if (Object.keys(balls).length == 6 && currentBreak.length == 1) {
                delete balls[ball];
            }
            if (Object.keys(balls).length < 6) {
                delete balls[ball];
            }
        }
      } else {
        currentBreakScore = 0;
        totalScore = totalScore - penalty[balls[ball].colour];
        currentBreak.length = 0; // reset current break
        balls[ball].resetPosition();
      }
    }
  }
};

var checkValidity = function(ball) {
  if (Object.keys(balls).length > 6) {
    if (currentBreak.length % 2 === 0 && balls[ball].colour == "red") {
      return true;
    } else if (currentBreak.length % 2 == 1 && balls[ball].colour != "red") {
      return true;
    }
    return false;
  } else {
    if (Object.keys(balls).length == 6 && currentBreak.length > 0) return true; // return true if hit any colour if not a new break
    if (Object.keys(balls).length == 6) return (balls[ball].colour == "yellow");
    if (Object.keys(balls).length == 5) return (balls[ball].colour == "green");
    if (Object.keys(balls).length == 4) return (balls[ball].colour == "brown");
    if (Object.keys(balls).length == 3) return (balls[ball].colour == "blue");
    if (Object.keys(balls).length == 2) return (balls[ball].colour == "pink");
    if (Object.keys(balls).length == 1) return (balls[ball].colour == "black");
  }
};

var updateBallPositions = function() {
  for (var ball in balls) {
    balls[ball].updateBallPosition();
  }
};

var updateRotationAngles = function() {
  rotationAngle = (((Date.now() - then) % 1000)/500) * Math.PI; // rotation angle for polygons
  rotationAngle2 = (((Date.now() - then) % rotationSpeed)/(rotationSpeed/2)) * Math.PI;
};


var drawBalls = function() {
  for (var ball in balls) {
    balls[ball].drawBall();
  }
};

var drawCueBall = function() {
    drawPolygon(cueBall.xPos - canvas.width/2, cueBall.yPos - canvas.height/2, cueBall.fillStyle, ballSize, cueBallSides, rotationAngle);
};

var drawCueballPath = function () {
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, orbitRadius, 0, 2*Math.PI);
  ctx.stroke();
};

var drawBoundary = function () {
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, outerLimit, 0, 2*Math.PI);
  ctx.stroke();
};

var drawTips = function () {
  ctx.font = "bold 12px sans-serif";
  if (currentBreak.length % 2 === 0 && Object.keys(balls).length > 6) {
    ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillText("Hit a red ball", 50, 450);
  }
  if (currentBreak.length % 2 == 1 && Object.keys(balls).length > 6) {
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText("Hit a colour ball", 50, 450);
  }
  if (Object.keys(balls).length == 6) ctx.fillText("Hit a yellow ball", 50, 450);
  if (Object.keys(balls).length == 5) ctx.fillText("Hit a green ball", 50, 450);
  if (Object.keys(balls).length == 4) ctx.fillText("Hit a brown ball", 50, 450);
  if (Object.keys(balls).length == 3) ctx.fillText("Hit a blue ball", 50, 450);
  if (Object.keys(balls).length == 2) ctx.fillText("Hit a pink ball", 50, 450);
  if (Object.keys(balls).length == 1) ctx.fillText("Hit a black ball", 50, 450);
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillText("Red: 1pt, Yellow: 2pts, Green: 3pts, Brown: 4pts", 600, 450);
  ctx.fillText("Blue: 5pts: Pink: 6pts, Black: 7pts", 600, 475);
};

var drawScores = function() {
  ctx.fillStyle = "rgb(200,200,255)";
  ctx.beginPath();
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(Math.floor((Date.now() - then) / 1000) + " seconds", 50, 50);
  ctx.fillStyle = "rgb(100,100,100)";
  ctx.fillText("Score: " + totalScore, 50, 75);
  ctx.fillText("Current Break: " + currentBreakScore, 50, 100);
  ctx.fillText("Max pos score 147", 50, 125);
};

var drawPolygon = function(x, y, fillStyle, radius, sides, startAngle, anticlockwise) {
  ctx.beginPath();
  if (sides < 3) return;
  var a = (2*Math.PI)/sides;
  a = anticlockwise?-a:a;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(startAngle);
  ctx.moveTo(radius,0);
  for (var i = 0; i < sides; i++) {
    ctx.lineTo(radius*Math.cos(a*i),radius*Math.sin(a*i));
  }
  ctx.closePath();
  ctx.restore();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  if (fillStyle == "rgb(255,255,255)") {
    ctx.stroke();
  } // outline shape if colour is white. I.e. Cueball
  ctx.beginPath(); // outer circle
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
};

var drawBorder = function() {
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "black";
  ctx.stroke();
};

var draw = function() {
  drawScores();
  drawTips();
  drawCueballPath();
  drawBoundary();
  drawBorder();
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(rotationAngle2);
  drawBalls();
  drawCueBall();
  ctx.restore();
};

window.addEventListener("keydown", function (evt) {
  if (evt.keyCode==38) {
    cueBall.a += cueBall.da;
    cueBall.xPos = canvas.width/2 + orbitRadius*Math.sin(cueBall.a);
    cueBall.yPos = canvas.height/2 + orbitRadius*Math.cos(cueBall.a);
  }
  if (evt.keyCode==40) {
    cueBall.a -= cueBall.da;
    cueBall.xPos = canvas.width/2 + orbitRadius*Math.sin(cueBall.a);
    cueBall.yPos = canvas.height/2 + orbitRadius*Math.cos(cueBall.a);
  }
});

var animate = function () {
  updateBallPositions(); // Update
  updateRotationAngles();
  checkForCollisions();
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  draw(); // Draw
  window.requestAnimFrame(function() { // Request new frame
    animate();
  });
};

createBalls();
animate();