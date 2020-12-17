// center point
let centerX = 0.0, centerY = 0.0;

let radius = 45, rotAngle = -90;
let accelX = 0.0, accelY = 0.0;
let deltaX = 0.0, deltaY = 0.0;
let springing = 0.0009, damping = 0.98;

//corner nodes 
let nodes = 5;

//zero fill arrays
let nodeStartX = [];
let nodeStartY = [];
let nodeX = [];
let nodeY = [];
let angle = [];
let frequency = [];

// soft-body dynamics
let organicConstant = 1.0;
   



//Position of left hand side of floor
let base1;

//Position of right hand side of floor
let base2;
//Length of floor
//let baseLength;

// Variables related to moving ball
let position;
let velocity;
let r = 6;
let speed = 55;

function setup() {
  createCanvas(710, 400);

  fill(128);
  base1 = createVector(0, height - 150);
  base2 = createVector(width, height);
  //createGround();

  //start ellipse at middle top of screen
  position = createVector(width / 2, 0);

  //calculate initial random velocity
  velocity = p5.Vector.random2D();
  velocity.mult(speed);
  
  //center shape in window
  centerX = width / 2;
  centerY = height / 2;

  //initialize arrays to 0
  for (let i = 0; i < nodes; i++){
    nodeStartX[i] = 0;
    nodeStartY[i] = 0;
    nodeY[i] = 0;
    nodeY[i] = 0;
    angle[i] = 0;
  }

  // iniitalize frequencies for corner nodes
  for (let i = 0; i < nodes; i++){
    frequency[i] = random(5, 12);
  }

  noStroke();
  frameRate(30);
}

function draw() {
  //draw background
  fill(0, 12);
  noStroke();
  rect(0, 0, width, height);

  //draw base
  fill(200);
  quad(base1.x, base1.y, base2.x, base2.y, base2.x, height, 0, height);

  //calculate base top normal
  let baseDelta = p5.Vector.sub(base2, base1);
  baseDelta.normalize();
  let normal = createVector(-baseDelta.y, baseDelta.x);
  let intercept = p5.Vector.dot(base1, normal);

  //draw ellipse
  noStroke();
  fill(255);
  ellipse(position.x, position.y, r * 2, r * 2);

  //move ellipse
  position.add(velocity);

  //normalized incidence vector
  incidence = p5.Vector.mult(velocity, -1);
  incidence.normalize();

  // detect and handle collision with base
  if (p5.Vector.dot(normal, position) > intercept) {
    //calculate dot product of incident vector and base top
    let dot = incidence.dot(normal);

    //calculate reflection vector
    //assign reflection vector to direction vector
    velocity.set(
      2 * normal.x * dot - incidence.x,
      2 * normal.y * dot - incidence.y,
      0
    );
    velocity.mult(speed);

    // draw base top normal at collision point
    stroke(255, 128, 0);
    line(
      position.x,
      position.y,
      position.x - normal.x * 100,
      position.y - normal.y * 100
    );
  }
  //}

  // detect boundary collision
  // right
  if (position.x > width - r) {
    position.x = width - r;
    velocity.x *= -1;
  }
  // left
  if (position.x < r) {
    position.x = r;
    velocity.x *= -1;
  }
  // top
  if (position.y < r) {
    position.y = r;
    velocity.y *= -1;

    //randomize base top
    base1.y = random(height - 100, height);
    base2.y = random(height - 100, height);
  }
  
  //fade background
  fill(0, 100);
  rect(0, 0, width, height);
  drawShape();
  moveShape();
}

function drawShape() {
  //  calculate node  starting locations
  for (let i = 0; i < nodes; i++){
    nodeStartX[i] = centerX + cos(radians(rotAngle)) * radius;
    nodeStartY[i] = centerY + sin(radians(rotAngle)) * radius;
    rotAngle += 360.0 / nodes;
  }

  // draw polygon
  curveTightness(organicConstant);
  fill(255);
  beginShape();
  for (let i = 0; i < nodes; i++){
    curveVertex(nodeX[i], nodeY[i]);
  }
  for (let i = 0; i < nodes-1; i++){
    curveVertex(nodeX[i], nodeY[i]);
  }
  endShape(CLOSE);
}

function moveShape() {
  //move center point
  deltaX = mouseX - centerX;
  deltaY = mouseY - centerY;

  // create springing effect
  deltaX *= springing;
  deltaY *= springing;
  accelX += deltaX;
  accelY += deltaY;

  // move predator's center
  centerX += accelX;
  centerY += accelY;

  // slow down springing
  accelX *= damping;
  accelY *= damping;

  // change curve tightness
  organicConstant = 1 - ((abs(accelX) + abs(accelY)) * 0.1);

  //move nodes
  for (let i = 0; i < nodes; i++){
    nodeX[i] = nodeStartX[i] + sin(radians(angle[i])) * (accelX * 2);
    nodeY[i] = nodeStartY[i] + sin(radians(angle[i])) * (accelY * 2);
    angle[i] += frequency[i];
  }
}
