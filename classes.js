class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.status = 1;
  }
}

class SuperBlob {
  constructor(speed, player) {
    this.oneBlobSpeed = speed;
    this.player = player;
  }
}

class Player {
  constructor(name) {
    this.blobs = [];
    this.score = 0;
    this.name = name;
  }
}

class Blob extends SuperBlob {
  constructor(x, y, dx, dy, parentSpeed, player, blobRadius, parentBlob, ejecting = false) {
    super(parentSpeed, player);
    // how to slow speed down for bigger blobs?
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.maxSpeed = parentSpeed + 1;
    this.status = 1;
    this.ejecting = ejecting;
    this.radius = blobRadius;
    this.reformable = false;
    this.blobIncr = 5;
    this.speedDcr = 1 / blobRadius;
    setTimeout(() => { this.reformable = true;}, 1000);
  }

  eat() {
    if (this.parentBlob) {
      this.parentBlob.radius += this.blobIncr;
      this.parentBlob.maxSpeed -= this.speedDcr;
    }
    this.player.score++;
    this.radius += this.blobIncr;
    this.maxSpeed -= this.speedDcr;
    debugger;
  }

  split() {
    if (this.radius / 2 > 30) {
      this.status = 0;
      let speedMultiplierX = this.dx / Math.abs(this.dx) * this.radius;
      let speedMultiplierY = this.dy / Math.abs(this.dy) * this.radius;
      if (this.dx > 0) {

      }
      let originBlob = new Blob(this.x, this.y, this.dx, this.dy, this.maxSpeed, this.player, this.radius / 2, this);
      let ejectBlob = new Blob(this.x + speedMultiplierX,
                               this.y + speedMultiplierY, speedMultiplierX, speedMultiplierY,
                               this.maxSpeed, this.player, this.radius / 2, this, true);
      // Do animation here before adding to
      this.player.blobs.push(originBlob);
      this.player.blobs.push(ejectBlob);
    }
  }

  slowToMaxSpeed() {
    if (Math.abs(this.dx) <= Math.abs(this.maxSpeed) &&
        Math.abs(this.dy <= Math.abs(this.maxSpeed))) {
      this.ejecting = false;
    } else {
      if (Math.abs(this.dx > Math.abs(this.maxSpeed))) {
        this.slowX();
      }
      if (Math.abs(this.dy > Math.abs(this.maxSpeed))) {
        this.slowY();
      }
    }
  }

  slowX() {
    if (this.dx > 0) {
      this.dx -= 5;
    } else {
      this.dx += 5;
    }
  }

  slowY() {
    if (this.dy > 0) {
      this.dy -= 5;
    } else {
      this.dy += 5;
    }
  }

  merge() {
    this.status = 0;
  }
}
