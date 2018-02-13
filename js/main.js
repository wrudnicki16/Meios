let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

// starting off with blob's x and y position

let relMouseX = 0;
let relMouseY = 0;
let startX = canvas.width / 2;
let startY = canvas.height / 2;
let blobRadius = 20;
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
let oneBlob = new Blob(startX, startY, dx, dy, maxSpeed, player, blobRadius, null);
let spaceScheduled = false; let lastSpaceEvent;
let enemyDetectionEventScheduled = false;
player.blobs.push(oneBlob);
let enemyPlayer = new Player("Enemy");
let enemyBlob = new Blob(startX / 2, startY / 2, 0, 0, maxSpeed, enemyPlayer, blobRadius * 2, null);

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

function drawEnemyBlob(blob) {
  ctx.beginPath();
  ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI*2);
  ctx.fillStyle = "#d86363";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#c00a0a";
  ctx.stroke();
  ctx.closePath();
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
  if (enemyBlob.status === 1) {
    drawEnemyBlob(enemyBlob);
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
  enemyBallCollisionDetection();
  enemyBlobDetection(enemyBlob);

  for (let i = 0; i < player.blobs.length; i++) {
    let blob = player.blobs[i];
    distX = relMouseX - blob.x;
    distY = relMouseY - blob.y;
    if (blob.ejecting) {
      debugger;
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

// ################# COLLISION DETECTION ####################

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

// ################### CALCULATING AI MOVEMENT ################

// function setEnemySpeed(blob) {
//   let distXToPlayer =
//   if (condition) {
//
//   }
// }

// function findClosestBlob(enemyBlob) {
//   for (let i = 0; i < player.blobs.length; i++) {
//     let playerBlob =
//   }
// }

function findClosestBall() {

}

function enemyBallCollisionDetection() {
  for (let j = 0; j < balls.length; j++) {
    let ball = balls[j];
    if (ball.status === 1 && enemyBlob.status === 1) {
      if ((ball.x - ballRadius > enemyBlob.x - enemyBlob.radius && ball.x + ballRadius < enemyBlob.x + enemyBlob.radius) &&
          (ball.y - ballRadius > enemyBlob.y - enemyBlob.radius && ball.y + ballRadius < enemyBlob.y + enemyBlob.radius)) {
            ball.x = getRandomInt(ballRadius + 1, canvas.width - ballRadius - 1);
            ball.y = getRandomInt(ballRadius + 1, canvas.height - ballRadius - 1);
            enemyBlob.eat();
            if (enemyPlayer.score === 40) {
              alert("THE ENEMY OVERWHELMED YOU!");
              document.location.reload();
            }
          }
    }
  }
}

function enemyBlobDetection(blob) {
  if (blob.status === 1) {
    for (let i = 0; i < player.blobs.length; i++) {
      let playerBlob = player.blobs[i];
      if (playerBlob.status === 1) {
        let difX = blob.x - playerBlob.x;
        let difY = blob.y - playerBlob.y;
        let L = Math.sqrt(difX*difX + difY*difY);
        let step = blob.radius + playerBlob.radius - L;

        if (step > (playerBlob.radius * 1.2)) {
          if (blob.radius > playerBlob.radius) {
            alert("THE ENEMY OVERWHELMED YOU!");
            document.location.reload();
          } else {
            if (!enemyDetectionEventScheduled) {
              blob.status = 0;
              enemyDetectionEventScheduled = true;
              setTimeout(() => enemyDetectCallback(blob, playerBlob), 50);
            }
          }
        }
      }
    }
  }
}

function enemyDetectCallback(blob, playerBlob) {
  enemyDetectionEventScheduled = false;
  playerBlob.eatOtherBlob(blob);
}





// ############## ASYNCHRONICITY HELPER #################

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

// ################# ENEMY ASYNCHRONICITY ##################



// ################# PLAYER ASYNCHRONICITY #################

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
