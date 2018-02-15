class Player {
  constructor(name) {
    this.blobs = [];
    this.score = 0;
    this.name = name;
  }
}

class Blob {
  constructor(x, y, dx, dy, parentSpeed, player, blobRadius, parentBlob,
              colorFill, colorStroke, ejecting = false) {
    this.player = player;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.colorFill = colorFill;
    this.colorStroke = colorStroke;
    this.maxSpeed = parentSpeed + 1;
    this.status = 1;
    this.ejecting = ejecting;
    this.radius = blobRadius;
    this.reformable = false;
    this.blobIncr = 2;
    this.speedDcr = 1 / (blobRadius * 2);
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
  }

  eatOtherBlob(blob) {
    if (this.parentBlob) {
      this.parentBlob.radius += Math.round(blob.radius / 2);
      this.parentBlob.maxSpeed -= this.speedDcr;
    }
    this.player.score += Math.round(blob.radius / 2);
    this.radius += Math.round(blob.radius / 2);
    this.maxSpeed -= this.speedDcr;
  }

  split() {
    if (this.radius / 2 > 20) {
      this.status = 0;
      let normalizedDX = this.dx / Math.abs(this.dx);
      let normalizedDY = this.dy / Math.abs(this.dy);
      let displacementX = normalizedDX * this.radius * 2;
      let displacementY = normalizedDY * this.radius * 2;
      let speedMultiplierX = displacementX / 4;
      let speedMultiplierY = displacementY / 4;
      let originBlob = new Blob(this.x, this.y, this.dx, this.dy,
                                this.maxSpeed,this.player, this.radius / 2, this,
                                this.colorFill, this.colorStroke);
      let ejectBlob = new Blob(this.x + displacementX,
                               this.y + displacementY, speedMultiplierX, speedMultiplierY,
                               this.maxSpeed, this.player, this.radius / 2, this,
                               this.colorFill, this.colorStroke, true);
      this.player.blobs.push(originBlob);
      this.player.blobs.push(ejectBlob);
    }
  }

  slowToMaxSpeed() {
    debugger;
    if (Math.abs(this.dx) <=  Math.abs(this.maxSpeed) &&
        Math.abs(this.dy) <= Math.abs(this.maxSpeed)) {
      this.ejecting = false;
    } else {
      if (Math.abs(this.dx) > Math.abs(this.maxSpeed)) {
        this.slowX();
      }
      if (Math.abs(this.dy) > Math.abs(this.maxSpeed)) {
        this.slowY();
      }
    }
  }

  slowX() {
    if (this.dx > 0) {
      this.dx -= 2;
    } else {
      this.dx += 2;
    }
  }

  slowY() {
    if (this.dy > 0) {
      this.dy -= 2;
    } else {
      this.dy += 2;
    }
  }

  merge() {
    this.status = 0;
  }
}
