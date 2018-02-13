let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

// starting off with blob's x and y position

let relMouseX = 0;
let relMouseY = 0;
let startX = canvas.width / 2;
let startY = canvas.height / 2;
let blobRadius = 30;
let ballRadius = 10;
let inertia = 30;
let maxSpeed = 4;
let distX = 0;
let distY = 0;
let dx = 0;
let dy = 0;
let score = 0;
let numBalls = 10;
let balls = [];
let player = new Player("Wyatt");
let superBlob = new SuperBlob(maxSpeed, player);
let oneBlob = new Blob(startX, startY, dx, dy, maxSpeed, player, blobRadius, null);
let spaceScheduled = false; let lastSpaceEvent;
player.blobs.push(oneBlob);

debugger;

for (let i = 0; i < numBalls; i++) {
  makeBall();
}

// ############## INITIALIZE FUNCTIONS ###############

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function makeBall() {
  let ballX = getRandomInt(ballRadius, canvas.width - ballRadius - 1);
  let ballY = getRandomInt(ballRadius, canvas.height - ballRadius - 1);
  let newBall = { x: ballX, y: ballY, status: 1 };
  balls.push(newBall);
}

// ############### DEFINE CLASSES #####################

// function SuperBlob(speed, player) {
//   this.oneBlobSpeed = speed;
//   this.player = player;
//   this.maxRadius = blobRadius;
// }



// ################# DRAWING #####################


function drawBalls() {
  for (let i = 0; i < numBalls; i++) {
    let ball = balls[i];
    if (ball.status === 1) {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI*2);
      ctx.fillStyle = "#0095dd";
      ctx.fill();
      ctx.closePath();
    }
  }
}

function drawBlob(blob) {
  ctx.beginPath();
  ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI*2);
  ctx.fillStyle = "#3bcc3b";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#179e17";
  ctx.stroke();
  ctx.closePath();
}

function drawBlobs() {
  let blobs = player.blobs;
  for (let i = 0; i < blobs.length; i++) {
    let blob = blobs[i];
    if (blob.status === 1) {
      drawBlob(blob);
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#00aa44";
  ctx.fillText(`Score: ${player.score}`, 8, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBlobs();
  drawBalls();
  drawScore();
  ballCollisionDetection();

  for (let i = 0; i < player.blobs.length; i++) {
    let blob = player.blobs[i];
    distX = relMouseX - blob.x;
    distY = relMouseY - blob.y;
    if (blob.ejecting) {
      blob.slowToMaxSpeed();
      preventOutOfBounds(blob);

      blob.x += blob.dx;
      blob.y += blob.dy;
    } else {
      console.warn(blob.x);
      setSpeed(blob, i);
      blob.x += blob.dx;
      blob.y += blob.dy;
    }
  }


  requestAnimationFrame(draw);
}

// ############### RANDOM HELPERS ###################

function setSpeed(blob, index) {
  let L = Math.sqrt(distX*distX + distY*distY);
  if (distX > 120) {
    blob.dx = blob.maxSpeed;
  } else if (distX < -120) {
    blob.dx = -blob.maxSpeed;
  } else {
    blob.dx = distX / inertia;
  }
  if (distY > 120) {
    blob.dy = blob.maxSpeed;
  } else if (distY < -120) {
    blob.dy = -blob.maxSpeed;
  } else {
    blob.dy = distY / inertia;
  }
  preventBlobCollision(blob, index);
  preventOutOfBounds(blob);
}

function preventOutOfBounds(blob) {
  // Out of bounds
  if (blob.x + blob.dx > canvas.width || blob.x + blob.dx < 0) {
    blob.dx = 0;
  }
  if (blob.y + blob.dy > canvas.height || blob.y + blob.dy < 0) {
    blob.dy = 0;
  }

  let difX = blob.x - canvas.width;
  let difY = blob.y - canvas.height;
  let L = Math.sqrt(difX*difX + difY*difY);
  let step = blob.radius - L;

  if (step > 0) {
    difX /= L; difY /= L;
    blob.x += difX*step*2; blob.y += difY*step*2;
  }


}

function numBlobsShowing(curPlayer) {
  let count = 0;
  for (let i = 0; i < curPlayer.blobs.length; i++) {
    let blob = curPlayer.blobs[i];
    if (blob.status === 1) {
      count++;
    }
  }
  debugger;
  return count;
}

// function findOtherShowingBlobs(blobIndex, blobs) {
//   let otherShowingBlobs = [];
//   for (let i = 0; i < blobs.length; i++) {
//     let blob = blobs[i];
//     if (i !== blobIndex && blob.status === 1) {
//       otherShowingBlobs.push(blob);
//     }
//   }
//   return otherShowingBlobs;
//
// }

function preventBlobCollision(blob, blobIndex) {

  // let otherShowingBlobs = findOtherShowingBlobs(blobIndex, player.blobs);
  for (let i = 0; i < player.blobs.length; i++) {
    if (i !== blobIndex) {
      let compareBlob = player.blobs[i];
      if (blob.status === 1 && compareBlob.status === 1) {
        let difX = blob.x - compareBlob.x;
        let difY = blob.y - compareBlob.y;
        let L = Math.sqrt(difX*difX + difY*difY);
        let step = blob.radius + compareBlob.radius - L;

        if (step > 0) {
          difX /= L; difY /= L;
          if (compareBlob.x > 0 && compareBlob.x < canvas.width) {
            compareBlob.x -= difX*step/2;
          }
          if (compareBlob.y > 0 && compareBlob.y < canvas.height) {
            compareBlob.y -= difY*step/2;
          }
          if (blob.x > 0 && blob.x < canvas.width) {
            blob.x += difX*step/2;
          }
          if (blob.y > 0 && blob.y < canvas.height) {
            blob.y += difY*step/2;
          }
        }
      }
    }

  }
}

function ballCollisionDetection() {
  for (let i = 0; i < player.blobs.length; i++) {
    let blob = player.blobs[i];
    for (let j = 0; j < balls.length; j++) {
      let ball = balls[j];
      if (ball.status === 1 && blob.status === 1) {
        if ((ball.x - ballRadius > blob.x - blob.radius && ball.x + ballRadius < blob.x + blob.radius) &&
            (ball.y - ballRadius > blob.y - blob.radius && ball.y + ballRadius < blob.y + blob.radius)) {
              ball.x = getRandomInt(ballRadius + 1, canvas.width - ballRadius - 1);
              ball.y = getRandomInt(ballRadius + 1, canvas.height - ballRadius - 1);
              blob.eat();
              if (player.score === 40) {
                alert("CONGRATULATIONS, YOU'VE WON!");
                document.location.reload();
              }
            }
      }
    }
  }
}



function splitCells() {
  let splittable = true;
  for (let i = 0; i < player.blobs.length; i++) {
    let blob = player.blobs[i];
    if (blob.radius / 2 < 30) {
      splittable = false;
    }
  }
  if (splittable) {
    for (let i = 0; i < player.blobs.length; i++) {
      let blob = player.blobs[i];
      if (blob.status === 1) {
        blob.split();
      }
    }
  }
}

// ################# ASYNCHRONICITY #################

function handleMouseMove(e) {
  let mouseX = e.pageX;
  let mouseY = e.pageY;
  relMouseX = mouseX - canvas.offsetLeft;
  relMouseY = mouseY - canvas.offsetTop;
}

function handleKeyDown(e) {
  if (e.keyCode === 32) {
    e.preventDefault();
    lastSpaceEvent = e;
    if (!spaceScheduled) {
      spaceScheduled = true;
      setTimeout(function () {
        spaceScheduled = false;
        splitCells(lastSpaceEvent);
      }, 100);
    }
    splitCells();
  }
}

document.addEventListener("mousemove", handleMouseMove, false);
document.addEventListener("keydown", handleKeyDown, false);
draw();
