var myCanvas = null;

// Declare kinectron
var kinectron = null;

var both_hands;

let vector;

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

  noCursor();

  distance = 10;
  spring = 0.5;
  friction = 0.5;
  size = 25;
  diff = size/8;
  x = y = ax = ay = a = a = r = f = 0;
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  oldR = r;
  if(both_hands){
    if((both_hands.leftHandState == 'notTracked' || both_hands.leftHandState == 'unknown') && (both_hands.rightHandState == 'notTracked' || both_hands.rightHandState == 'unknown')){
      vector = createVector(mouseX, mouseY);
    }else{
      vector = createVector(both_hands.rightHand.depthX * myCanvas.width, both_hands.rightHand.depthY * myCanvas.height);

      mX = vector.x;
      mY = vector.y;
      if(!f) {
        f = 1,f;
        x = mX;
        y = mY;
      }
      ax += ( mX - x ) * spring;
      ay += ( mY - y ) * spring;
      ax *= friction;
      ay *= friction;
      a += sqrt( ax*ax + ay*ay+a ) - a;
      a *= 0.6;
      r = size - a;

      for( i = 0; i < distance; ++i ) {
        oldX = x;
        oldY = y;
        x += ax / distance;
        y += ay / distance;
        oldR += ( r - oldR ) / distance;
        if(oldR < 1) oldR = 1;
        stroke(255)
        strokeWeight( oldR+diff );
        line( x, y, oldX, oldY );
        strokeWeight( oldR );
        line( x+diff*2, y+diff*2, oldX+diff*2, oldY+diff*2 );
        line( x-diff, y-diff, oldX-diff, oldY-diff );
      }
    }
  }else{
    vector = createVector(mouseX, mouseY);
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
