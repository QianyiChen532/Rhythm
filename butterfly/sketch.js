var myCanvas = null;

// Declare kinectron
var kinectron = null;

var both_hands;

let boids = [];
let hue = 200;
let saturation = 0;

let vector1;
let vector2;

function setup() {
  myCanvas = createCanvas(windowWidth, windowHeight);
  background(0);

  // Define and create an instance of kinectron
  var kinectronIpAddress = "10.209.8.234"; // FILL IN YOUR KINECTRON IP ADDRESS HERE
  kinectron = new Kinectron(kinectronIpAddress);

  // Connect with application over peer
  kinectron.makeConnection();

  // Request all tracked bodies and pass data to your callback
  kinectron.startTrackedBodies(bodyTracked);

  for (let i = 0; i < 50; i++) {
    boids.push(new Boid(random(0,width), random(0, height)));
  }

  noCursor();

}

function draw() {
  background(0, 90);
  push();
  translate(width, 0);
  scale(-1, 1);
  if(both_hands){
    if((both_hands.leftHandState == 'notTracked' || both_hands.leftHandState == 'unknown') && (both_hands.rightHandState == 'notTracked' || both_hands.rightHandState == 'unknown')){
      saturation = 0;
      // update and display the vehicles
      for (let i=0; i<boids.length; i++) {
        let b = boids[i];

        b.update();
        b.reappear();
        b.display();
      }
    }else{
      vector1 = createVector(both_hands.leftHand.depthX * myCanvas.width, both_hands.leftHand.depthY * myCanvas.height);
      vector2 = createVector(both_hands.rightHand.depthX * myCanvas.width, both_hands.rightHand.depthY * myCanvas.height);

      for (let i = 0; i < boids.length; i++) {
        let b = boids[i];

        b.separate(boids);

        if ((both_hands.leftHandState != 'notTracked' && both_hands.leftHandState != 'unknown') && (both_hands.rightHandState == 'notTracked' || both_hands.rightHandState == 'unknown')){
          vector1 = createVector(both_hands.leftHand.depthX * myCanvas.width, both_hands.leftHand.depthY * myCanvas.height);
          b.seek(vector1);
          saturation = 80;
          hue = 200;
        }else if ((both_hands.leftHandState == 'notTracked' || both_hands.leftHandState == 'unknown') && (both_hands.rightHandState != 'notTracked' && both_hands.rightHandState != 'unknown')){
          vector2 = createVector(both_hands.rightHand.depthX * myCanvas.width, both_hands.rightHand.depthY * myCanvas.height);
          b.seek(vector2);
          saturation = 80;
          hue = 7;
        }else{
          vector1 = createVector(both_hands.leftHand.depthX * myCanvas.width, both_hands.leftHand.depthY * myCanvas.height);
          vector2 = createVector(both_hands.rightHand.depthX * myCanvas.width, both_hands.rightHand.depthY * myCanvas.height);
          b.seek(vector1);
          b.seek(vector2);
          saturation = 80;
          hue = 263;
        }


        b.update();
        b.reappear();
        b.display();
      }
    }
  }else{
    saturation = 0;
    // update and display the boids
    for (let i=0; i<boids.length; i++) {
      let b = boids[i];
      b.update();
      b.reappear();
      b.display();
    }
  }
  pop();
}

function bodyTracked(body) {
  // Get the hands off the tracked body and do somethign with them
  kinectron.getHands(drawHands);
}

// Draw hands
function drawHands(hands) {
  //console.log(hands);
  both_hands = hands;
}

class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector();
    this.angle = 0;

    this.maxSpeed = 5;
    this.maxSteerForce = 0.05;

    this.separateDistance = 100;
    this.neighborDistance = 200;

    //---for draw
    this.flapRate = 60;
    this.counter =0;

    this.rightWidth1 = 30;
    this.wingHeightUp=20;
    this.rightWidth2 = 30;
    this.wingHeightDown = 20;

    this.wingWidth1 = 30;
    this.wingWidth2 =20;

    this.randomr= random(100);

    this.detectRad = 10;

    this.scl = random(0.8,1.2);


  }
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();
    let c = noise(0, this.flapRate+frameCount*0.01+this.angle);
    this.counter = map(c,0,1,0,this.flapRate);


  }
  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }
  flock(others) {
    //
  }
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let distance = desired.mag();


    desired.normalize();
    if(distance > this.detectRad) {
      desired.mult(this.maxSpeed);
    } else {
      let speed = map(distance, 0, this.detectRad, 0, this.maxSpeed);
      desired.mult(speed);

    }

    let steerForce = p5.Vector.sub(desired, this.vel);
    steerForce.limit(this.maxSteerForce);
    this.applyForce( steerForce );

  }

  separate(others) {
    // avg direction (distance)
    let vector = createVector(); // sum
    let count = 0;
    for (let i = 0; i < others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.separateDistance) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(distance);
        // sum
        vector.add(diff);
        count++;
      }
    }
    if (count > 0) {

      vector.setMag(this.maxSpeed);
      // steerForce
      vector.sub(this.vel);
      vector.limit(this.maxSteerForce); // force
    }

    this.applyForce(vector);
  }

  cohesion(others) {
    // avg position
    let vector = createVector(); //sum, position
    let count = 0;
    for (let i = 0; i < others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.neighborDistance) {
        vector.add(other.pos); // sum
        count++;
      }
    }
    if (count > 0) {
      vector.div(count); // avg, position
      this.seek(vector);
    }
  }

  align(others) {

    let vector = createVector(); // sum, vel
    let count = 0;
    for (let i = 0; i < others.length; i++) {
      let other = others[i];
      let distance = this.pos.dist(other.pos);
      if (distance > 0 && distance < this.neighborDistance) {
        vector.add(other.vel); // sum
        count++;
      }
    }
    if (count > 0) {
      vector.div(count); // avg, vel
      vector.setMag(this.maxSpeed);
      let steerForce = p5.Vector.sub(vector, this.vel);
      steerForce.limit(this.maxSteerForce);
      this.applyForce(steerForce);
    }
  }
  reappear() {
    // x
    if (this.pos.x < 0) {
      this.pos.x = width;
    } else if (this.pos.x > width) {
      this.pos.x = 0;
    }
    // y
    if (this.pos.y < 0) {
      this.pos.y = height;
    } else if (this.pos.y > height) {
      this.pos.y = 0;
    }
  }
  display() {

    let flipAmount = 0.5;
    this.rightWidth1 = this.flapOffset(0, this.wingWidth1, false);
    this.rightWidth2 = this.flapOffset(0, this.wingWidth2, false);
    this.leftWidth1 = this.flapOffset(this.wingWidth1,0,true)
    this.leftWidth2 = this.flapOffset(this.wingWidth2,0,true)
    this.leftWidth2 = lerp(this.wingWidth2,this.flapOffset(this.wingWidth2,0,true),flipAmount);


    push();
    translate(this.pos.x, this.pos.y);

    rotate(this.angle-PI/2+10);
    colorMode(HSB);
    //blendMode(ADD);
    noStroke();
    fill(hue,saturation,this.randomr);//randomr:0-100
    // ellipse(0,0,this.leftWidth1*0.5,this.leftWidth1*1.5);//body

    scale(this.scl);
    triangle(0,0,this.rightWidth1, -this.wingHeightUp, this.rightWidth2, this.wingHeightDown);
    triangle(0,0,-this.leftWidth1, -this.wingHeightUp, -this.leftWidth2, this.wingHeightDown);

    pop();

  }

  flapOffset(start,end,leftside){

    let freq = this.counter * (2*PI)/this.flapRate;
    let amount = ((sin(freq)+1)/2);
    if(leftside) {
      amount = 1 - amount;
    }
    amount = amount * 0.9;
    return start + amount*(end-start);
  }
}
