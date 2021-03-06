function main() {

  let canvas = document.getElementById("myCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";
  let ctx = canvas.getContext("2d");

  // starting off with blob's x and y position
  let myWinningModal = document.getElementById("myWinningModal");
  let myLosingModal = document.getElementById("myLosingModal");

  let myWinningBtn = document.getElementById("myWinningBtn");
  let myLosingBtn = document.getElementById("myLosingBtn");

  myWinningBtn.onclick = reset;
  myLosingBtn.onclick = reset;


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
  let enemyDecisionMade = [false, false, false, false];
  let gameOver = false;
  player.blobs.push(oneBlob);

  let enemyPlayer = new Player("Enemy");

  let enemyPlayer1 = new Player("Enemy");
  let enemyPlayer2 = new Player("Enemy");
  let enemyPlayer3 = new Player("Enemy");
  let enemyPlayer4 = new Player("Enemy");
  // let enemyBlob = new Blob(startX / 2, startY / 2, 0, 0, maxSpeed, enemyPlayer, blobRadius, null);

  let enemyBlobs = [];
  let enemyBlob1 = new Blob(startX / 2, startY / 2, 0, 0, maxSpeed, enemyPlayer1, blobRadius, null, "#d86363", "#c00a0a");
  let enemyBlob2 = new Blob(startX + (startX / 2), startY / 2, 0, 0, maxSpeed, enemyPlayer2, blobRadius, null, "#ad44d0", "#77079c");
  let enemyBlob3 = new Blob(startX / 2, startY + (startY / 2), 0, 0, maxSpeed, enemyPlayer3, blobRadius, null, "#0095dd", "#37689a");
  let enemyBlob4 = new Blob(startX + (startX / 2), startY + (startY / 2), 0, 0, maxSpeed, enemyPlayer4, blobRadius, null, "#d86363", "#c00a0a");
  enemyBlobs.push(enemyBlob1); enemyBlobs.push(enemyBlob2);
  enemyBlobs.push(enemyBlob3); enemyBlobs.push(enemyBlob4);

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
    let newBall = { x: ballX, y: ballY, status: 1, taken: null };
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

  function drawEnemyBlob(blob, colorFill, colorStroke) {
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI*2);
    ctx.fillStyle = colorFill;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = colorStroke;
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
    for (let i = 0; i < enemyBlobs.length; i++) {
      let enemyBlob = enemyBlobs[i];
      if (enemyBlob.status === 1) {
        drawEnemyBlob(enemyBlob, enemyBlob.colorFill, enemyBlob.colorStroke);
      }
    }
  }

  function drawScore() {
    ctx.fillStyle = "#00aa44";
    ctx.fillRect(25, 20, 140, 45);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Score: ${player.score}`, 40, 50);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlobs();
    drawBalls();
    drawScore();
    ballCollisionDetection();

    for (let i = 0; i < enemyBlobs.length; i++) {
      let enemyBlob = enemyBlobs[i];
      enemyBallCollisionDetection(enemyBlob);
      enemyBlobDetection(enemyBlob);
    }

    for (let i = 0; i < player.blobs.length; i++) {
      let blob = player.blobs[i];
      distX = relMouseX - blob.x;
      distY = relMouseY - blob.y;
      if (blob.ejecting) {
        blob.slowToMaxSpeed();
        preventOutOfBounds(blob);
      } else {
        setSpeed(blob, i);
      }
      blob.x += blob.dx;
      blob.y += blob.dy;
    }

    for (let i = 0; i < enemyBlobs.length; i++) {
      let enemyBlob = enemyBlobs[i];


      if (!enemyDecisionMade[i]) {
        enemyDecisionMade[i] = true;
        if (i === 0 || i === 3) {
          setTimeout(() => {
            enemyDecisionMade[i] = false;
            setSmarterEnemySpeed(enemyBlob);
          }, 150);
        } else if (i === 1) {
          setTimeout(() => {
            enemyDecisionMade[i] = false;
            setScaredEnemySpeed(enemyBlob);
          }, 175);
        } else if (i === 2) {
          setTimeout(() => {
            enemyDecisionMade[i] = false;
            setGreedyEnemySpeed(enemyBlob);
          }, 115);
        } else if (i === 3) {
          setTimeout(() => {
            enemyDecisionMade[i] = false;
            setDumbEnemySpeed(enemyBlob);
          }, 135);
        }
      }
      // preventOutOfBounds(enemyBlob); // unless blob is the dumb blob!*******************
      if (i !== 3) {
        preventOutOfBounds(enemyBlob);
      }


      enemyBlob.x += enemyBlob.dx;
      enemyBlob.y += enemyBlob.dy;
    }
    if (!gameOver) {
      window.myRequest = requestAnimationFrame(draw);
    }
  }

  // ############### RANDOM HELPERS ###################

  function setSpeed(blob, index) {
    setSpeedFromDistance(distX, distY, blob);
    preventBlobCollision(blob, index);
    preventOutOfBounds(blob);
  }

  function setSpeedFromDistance(distanceX, distanceY, blob) {
    if (distanceX > 120) {
      blob.dx = blob.maxSpeed;
    } else if (distanceX < -120) {
      blob.dx = -blob.maxSpeed;
    } else {
      blob.dx = distanceX / inertia;
    }
    if (distanceY > 120) {
      blob.dy = blob.maxSpeed;
    } else if (distanceY < -120) {
      blob.dy = -blob.maxSpeed;
    } else {
      blob.dy = distanceY / inertia;
    }
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
            if (player.score >= 200 && !gameOver) {
              gameOver = true;
              myWinningModal.style.display = "block";
            }
          }
        }
      }
    }
  }

  // ################### CALCULATING AI MOVEMENT ################

  // Need to check ^
  function setSmarterEnemySpeed(blob) {
    let playerBlob = findClosestPlayerBlob(blob);
    let difX = playerBlob.x - blob.x;
    let difY = playerBlob.y - blob.y;
    let L = Math.sqrt(difX*difX + difY*difY);
    let { food, foodDistance } = findClosestFoodAndDistance(blob);

    if (L > 50 + blob.radius * 3) {
      let foodDifX = food.x - blob.x;
      let foodDifY = food.y - blob.y;
      setSpeedFromDistance(foodDifX, foodDifY, blob);
      // If smaller, be greedy, otherwise,
      // if a quarter of the distance to player, go for food.

      if (blob.radius > playerBlob.radius) {
        if (foodDistance > L) {
          setSpeedFromDistance(difX, difY, blob);
        }
      }
    } else {
      // attack player if smaller, otherwise increase distance from player.
      if (blob.radius > playerBlob.radius) {
        setSpeedFromDistance(difX, difY, blob);
      } else {
        setSpeedFromDistance(blob.x - playerBlob.x, blob.y - playerBlob.y, blob);
      }
    }
    preventOutOfBounds(blob);
  }

  function setGreedyEnemySpeed(blob) {
    let playerBlob = findClosestPlayerBlob(blob);
    let difX = playerBlob.x - blob.x;
    let difY = playerBlob.y - blob.y;
    let L = Math.sqrt(difX*difX + difY*difY);
    let food = findClosestFoodAndDistance(blob).food;
    let foodDifX = food.x - blob.x;
    let foodDifY = food.y - blob.y;
    // always go for food
    setSpeedFromDistance(foodDifX, foodDifY, blob);
    preventOutOfBounds(blob);
  }

  function setScaredEnemySpeed(blob) {
    let playerBlob = findClosestPlayerBlob(blob);
    let difX = playerBlob.x - blob.x;
    let difY = playerBlob.y - blob.y;
    let L = Math.sqrt(difX*difX + difY*difY);
    let { food, foodDistance } = findClosestFoodAndDistance(blob);
    let foodDifX = food.x - blob.x;
    let foodDifY = food.y - blob.y;

    if (L > 100 + blob.radius * 2) {
      setSpeedFromDistance(foodDifX, foodDifY, blob);
    } else {
      // RUN AWAY!
      setSpeedFromDistance(blob.x - playerBlob.x, blob.y - playerBlob.y, blob);
    }
    preventOutOfBounds(blob);
  }

  function setDumbEnemySpeed(blob) {
    if (blob.dx === 0) {
      blob.dx = 4;
      blob.dy = 4;
    }
    if (blob.x + blob.radius > canvas.width || blob.x - blob.radius < 0) {
      blob.dx = -blob.dx;
    }
    if (blob.y + blob.radius > canvas.height || blob.y - blob.radius < 0) {
      blob.dy = -blob.dy;
    }
  }

  function findClosestPlayerBlob(blob) {
    let closestBlob = player.blobs[0];
    let minBlobDist;
    for (let i = 0; i < player.blobs.length; i++) {
      let playerBlob = player.blobs[i];
      if (playerBlob.status === 1) {
        let difX = blob.x - playerBlob.x;
        let difY = blob.y - playerBlob.y;
        let L = Math.sqrt(difX*difX + difY*difY);

        if (L < minBlobDist || minBlobDist === undefined) {
          closestBlob = playerBlob;
          minBlobDist = L;
        }
      }
    }
    return closestBlob;
  }

  function findClosestFoodAndDistance(blob) {
    if (balls.length > 0) {
      let closestBall = balls[0];
      let minBallDist;
      for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        if (ball.taken === null || ball.taken === blob) {
          let difX = blob.x - ball.x;
          let difY = blob.y - ball.y;
          let L = Math.sqrt(difX*difX + difY*difY);

          if (L < minBallDist || minBallDist === undefined) {
            closestBall = ball;
            minBallDist = L;
          }
        }
      }
      closestBall.taken = blob;
      return { food: closestBall, foodDistance: minBallDist };
    }
  }


  // Collision detection working.
  function enemyBallCollisionDetection(blob) {
    for (let j = 0; j < balls.length; j++) {
      let ball = balls[j];
      if (ball.status === 1 && blob.status === 1) {
        if ((ball.x - ballRadius > blob.x - blob.radius && ball.x + ballRadius < blob.x + blob.radius) &&
        (ball.y - ballRadius > blob.y - blob.radius && ball.y + ballRadius < blob.y + blob.radius)) {
          ball.x = getRandomInt(ballRadius + 1, canvas.width - ballRadius - 1);
          ball.y = getRandomInt(ballRadius + 1, canvas.height - ballRadius - 1);
          ball.taken = null;
          blob.eat();
          if (blob.player.score >= 120 && !gameOver) {
            myLosingModal.style.display = "block";
            gameOver = true;
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

          if (step > (playerBlob.radius * 0.9) || step > (blob.radius * 0.9)) {
            if (blob.radius > playerBlob.radius && !gameOver) {
              myLosingModal.style.display = "block";
              gameOver = true;
            } else {
              if (!enemyDetectionEventScheduled) {
                blob.status = 0;
                if (numEnemiesAlive() === 0 && !gameOver) {
                  gameOver = true;
                  myWinningModal.style.display = "block";
                }
                for (let j = 0; j < enemyBlobs.length; j++) {
                  let enemyBlob = enemyBlobs[j];
                  if (enemyBlob.status === 1) {
                    enemyBlob.radius += Math.ceil(enemyBlob.radius / 4);
                    enemyBlob.maxSpeed -= enemyBlob.speedDcr;
                  }
                }
                enemyDetectionEventScheduled = true;
                setTimeout(() => enemyDetectCallback(blob, playerBlob), 50);
              }
            }
          }
        }
      }
    }
  }

  // ################## BLOB DETECTION HELPERS ##################

  function enemyDetectCallback(blob, playerBlob) {
    enemyDetectionEventScheduled = false;
    playerBlob.eatOtherBlob(blob);
  }

  function enemyPlayerOverlapping(blob) {
    if (blob.status === 1) {
      for (let i = 0; i < player.blobs.length; i++) {
        let playerBlob = player.blobs[i];
        if (playerBlob.status === 1) {
          let difX = blob.x - playerBlob.x;
          let difY = blob.y - playerBlob.y;
          let L = Math.sqrt(difX*difX + difY*difY);
          let step = blob.radius + playerBlob.radius - L;
          if (step > (playerBlob.radius * 0.9) || step > (blob.radius * 0.9)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function numEnemiesAlive() {
    let count = 0;
    for (let i = 0; i < enemyBlobs.length; i++) {
      if (enemyBlobs[i].status === 1) {
        count++;
      }
    }
    return count;
  }


  // ############## ASYNCHRONICITY HELPER #################

  function splitCells() {
    let splittable = true;
    for (let i = 0; i < player.blobs.length; i++) {
      let blob = player.blobs[i];
      if (blob.radius / 2 < 20) {
        splittable = false;
      }
    }
    if (splittable) {
      let totalCurrentBlobs = player.blobs.length;
      for (let i = 0; i < totalCurrentBlobs; i++) {
        let blob = player.blobs[i];
        if (blob.status === 1) {
          blob.split();
        }
      }
    }
  }

  // ################# ENEMY ASYNCHRONICITY ##################



  // ################# PLAYER ASYNCHRONICITY #################
  function reset() {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("keydown", handleKeyDown);
    myWinningModal.style.display = "none";
    myLosingModal.style.display = "none";
    main();
  }

  function handleMouseMove(e) {
    let mouseX = e.pageX;
    let mouseY = e.pageY;
    relMouseX = mouseX - canvas.offsetLeft;
    relMouseY = mouseY - canvas.offsetTop;
  }

  function handleTouch(e) {
    let mouseX = e.changedTouches[0].pageX;
    let mouseY = e.changedTouches[0].pageY;
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
  document.addEventListener("touchstart", handleTouch, false);
  document.addEventListener("touchmove", handleTouch, false);
  document.addEventListener("touchend", handleTouch, false);
  document.addEventListener("keydown", handleKeyDown, false);
  window.myRequest = draw();
}
