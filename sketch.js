// --- Global Variables ---
let circles = [];  // store circlepattern
let beads = [];  //  store the beads
let maxBead = 1200; // set max beads
let maxCircle = 2000 // set max circles
let selectedCircle = null; // tracks currently selected circle
let moving = false; // track if beads are moving

// --- Setup ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  initialisePatterns(); // call function for the circle and the beads
}

// --- Initialise big circles and beads from the classes ---

// Learned about while loop from the coding train example
//https://thecodingtrain.com/tracks/code-programming-with-p5-js/code/4-loops/1-while-for

// Learned about circlepacking from happy coding
//https://happycoding.io/tutorials/p5js/creating-classes/circle-packing

//chatgpt was used to help troubleshoot the circle packing formula, since it initially would not run properly

function initialisePatterns() {
  let attempts = 0; // starting point for generation
  
  // draw beads
  // changed order of initialisePatterns function so that the beads are drawn first and the placement of the circles don't affect the beads
  while (attempts < maxBead) { 
    let beadSize = random(width * 0.005, width * 0.02); //random bead size relative to canvas size
    let x = random(beadSize / 2, width - beadSize / 2); // random x position
    let y = random(beadSize / 2, height - beadSize / 2); //random y position

    // Check if bead overlaps with any main circles or other beads
    let overlapping = false;
    
    // removed check beads for overlap with circles
    for (let bead of beads) {
      let d = dist(x, y, bead.x, bead.y);
      if (d < (beadSize / 2 + bead.size / 2)) {
        overlapping = true;
        break;
      }
    }

    // Add bead to array if it doesnt overlap
    if (!overlapping) {
      beads.push(new Bead(x, y, beadSize));
    }

    attempts++;
  }

  attempts = 0;

  // draw circles
  // Use while loop to keep creating circles until it maxes out
  while (attempts < maxCircle) { 
    let size = random(width * 0.05, width * 0.15); // Set random size relative to canvas width
    let x = random(size / 2, width - size / 2); // Random x position
    let y = random(size / 2, height - size / 2); // Random y


    // Check for circle overlap
    let overlapping = false;
    for (let other of circles) {
      let d = dist(x, y, other.x, other.y); // calculates distance between the circles
      if (d < (size / 2 + other.size / 2)) { // checks for overlap based on combined radius
        overlapping = true;
        break;
      }
    }
    
    // keep adding circles until it overlaps!
    if (!overlapping) {
      circles.push(new CirclePattern(x, y, size));
    }
    
    attempts++;
  }
}

// --- Draw Function ---
function draw() {
  background(10, 10, 50); // set background to navy blue

  // update bead positions if moving
  if (moving) {
    for (let bead of beads) {
      bead.update(); // update bead positions
    }
  }

  // Draw each bead
  for (let bead of beads) {
    bead.display(); // display the beads
  }

  // Draw each circle
  for (let circle of circles) {
    circle.display(); //display the circles
  }
}

// --- user interaction ---

// to check if mouse is over a circle when pressed
function mousePressed() {
  for (let circle of circles) {
    if (circle.contains(mouseX, mouseY)) {
      selectedCircle = circle;
      circle.isDragging = true;

      // checks the distance between mouse position and the centre of the selected circle
      circle.offsetX = mouseX - circle.x;
      circle.offsetY = mouseY - circle.y;
      break;
    }
  }
}

// to update the circle position when dragging
function mouseDragged() {
  if (selectedCircle && selectedCircle.isDragging) {

    // to calculate the new position of the selected circle when dragged
    let newX = mouseX - selectedCircle.offsetX;
    let newY = mouseY - selectedCircle.offsetY;

    // add constrain to keep circles within the canvas
    let radius = selectedCircle.size / 2;
    selectedCircle.x = constrain(newX, radius, width - radius);
    selectedCircle.y = constrain(newY, radius, height - radius);

    repositionCircles(selectedCircle);

  // redraws canvas while dragging
  redraw();
  }
}

function repositionCircles() {
  // adjust the nearby circle positions so they avoid overlap
  // chatgpt was used to calculate the distance between the selected circle and other circles, and the repulsive force used to calculate the direction of how the surrounding circles move away from the selected circle
  // atan2() is used to calculate the angle from the selected circle to other circles - it applies the repulsive force in the correct direction
  for (let circle of circles) {
    if (circle !== selectedCircle) {
      let d = dist(selectedCircle.x, selectedCircle.y, circle.x, circle.y);
      let minDist = (selectedCircle.size + circle.size) / 2;

      if (d < minDist) {
        let angle = atan2(circle.y - selectedCircle.y, circle.x - selectedCircle.x);
        let overlap = minDist - d;

        // to push the circle away from the selected circle - calculate the angle to push it away from the selected circle
        // multiplier to make the animations look smoother when the circles are moving away
        circle.x += cos(angle) * overlap * 0.3;
        circle.y += sin(angle) * overlap * 0.3;
        
        // constrain to ensure circles stay inside the canvas
        let radius = circle.size / 2;
        circle.x = constrain(circle.x, radius, width - radius);
        circle.y = constrain(circle.y, radius, height - radius);
      }
    }
  }
}

// stop dragging when mouse is released
function mouseReleased() {
  if (selectedCircle) {
    selectedCircle.isDragging = false;
    selectedCircle = null;
  }
}

// user input to move the beads by pressing "1"
function keyPressed() {
  if (key === '1') {
    moving = !moving;
  }
}

// --- CirclePattern Class ---
class CirclePattern {
  constructor(x, y, size) {
    this.x = x; // x-coordinate
    this.y = y; // y-coordinate
    this.size = size; // Diameter of the main circle
    this.numLayers = int(random(3, 6)); // random number of layers
    this.isDragging = false; // tracks if the mouse is dragging the circle
    this.offsetX = 0; // keeps track of mouse offset when dragging
    this.offsetY = 0;

    // array to store colours for each layer
    this.layerColors = [];
    for (let i = this.numLayers; i > 0; i--) {
      let col = color(random(255), random(255), random(255)); // random colour for each layer
      this.layerColors.push(col);
    }
  }

  // to check if the mouse is over the circle
  contains(px, py) {
    let d = dist(px, py, this.x, this.y);
    return d < this.size / 2;
  }

 // display the circles that alternate between lines and circles
  display() {
    push(); // Save transformation
    translate(this.x, this.y); // Move origin to centre of circle
    
    // Draw each layer from outside to in
    for (let i = this.numLayers; i > 0; i--) {
      let layerSize = (this.size / this.numLayers) * i; // decide layer diameter
      let col = this.layerColors[this.numLayers - i]; // assign random colour for each layer from array
      
      // between lines and dots
      if (i % 2 == 0) {
        this.drawDots(layerSize, col); // Even layers: draw dots
      } else {
        this.drawLines(layerSize, col); // Odd layers: draw lines
      }
    }
    
    pop(); // Restore transformation
  }

// Chatgpt was used to calculate the distribution of lines and dots inside each layer using methods

  // method to draw dots around the circumference of each layer
  drawDots(size, col) {
    fill(col); // Set fill color for base circle
    noStroke();
    ellipse(0, 0, size); // Draw the base circle

    let numDots = int(size / 5); // Number of dots based on layer size
    let dotRadius = size / 20; // Radius of each dot

    fill(255); // Set dot colour to white
    for (let i = 0; i < numDots; i++) {
      let angle = map(i, 0, numDots, 0, 360); // Distribute dots evenly in a circle
      let x = cos(angle) * size / 2.5; // x-coordinate for each dot
      let y = sin(angle) * size / 2.5; // y-coordinate for each dot
      ellipse(x, y, dotRadius); // draw the dot
    }
  }

  // method to draw lines from centre of circle
  drawLines(size, col) {
    stroke(col); // Set stroke colour
    strokeWeight(2);
    noFill();
    ellipse(0, 0, size); // Draw the base circle

    let numLines = int(size / 5); // Number of lines based on layer size
    for (let i = 0; i < numLines; i++) {
      let angle = map(i, 0, numLines, 0, 360); // use map to distribute lines evenly
      let x = cos(angle) * size / 2.5; // x coordinate endpoints
      let y = sin(angle) * size / 2.5; // y coordinate endpoints
      line(0, 0, x, y); // Draw line from centre to edge
    }
  }
}

// --- Bead Class ---
class Bead {
  constructor(x, y, size) {
    this.x = x; // x of bead centre
    this.y = y; // y of bead centre
    this.size = size; // diameter
    this.color = color(random(100, 255), 0, random(100, 255)); // determine bead colour (purple and pink)
    this.xSpeed = random(0.1, 0.5) * (random() < 0.5 ? 1 : -1); // random speed and direction for x
    this.ySpeed = random(0.1, 0.5) * (random() < 0.5 ? 1 : -1); // random speed and direction for y
  }

  // to move the beads
  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    // check when beads are at the edge of the canvas to reverse direction
    if (this.x < this.size / 2 || this.x > width - this.size / 2) {
      this.xSpeed *= -1; // reverse direction
    }
    if (this.y < this.size / 2 || this.y > height - this.size / 2) {
      this.ySpeed *= -1; // reverse direction
    }
  }

  // Display the bead as a filled circle
  display() {
    fill(this.color); // Set fill
    noStroke();
    ellipse(this.x, this.y, this.size); // draw the bead
  }
}

// make the whole thing resizable and scalable
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circles = []; // clear circles
  beads = []; // clear beads
  initialisePatterns(); // regenerate patterns
}