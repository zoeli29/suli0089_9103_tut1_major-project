// --- Global Variables ---
let circles = [];  // store circlepattern
let beads = [];  //  store the beads
let maxAttempts = 5000; // set max attempts to prevent overlap


// --- Setup ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  noLoop();// make design static unless refreshed
  initialisePatterns(); // call function for the circle and the beads
}


// --- Initialize big circles and beads from the classes ---

// Learned about while loop from the coding train example
//https://thecodingtrain.com/tracks/code-programming-with-p5-js/code/4-loops/1-while-for

// Learned about circlepacking from happy coding
//https://happycoding.io/tutorials/p5js/creating-classes/circle-packing

//chatgpt was used to help troubleshoot the circle packing formula, since it initially would not run properly

// big circles
function initialisePatterns() {
  let attempts = 0; // starting point for generation
  
  // Use while loop to keep creating circles until it maxes out
  while (attempts < 1000) { 
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

// Now for the beads!!!!

  // Create small beads that avoid the main circle and eachother
  attempts = 0;
  while (attempts < maxAttempts) { 
    let beadSize = random(width * 0.005, width * 0.02); //random bead size relative to canvas size
    let x = random(beadSize / 2, width - beadSize / 2); // random x position
    let y = random(beadSize / 2, height - beadSize / 2); //random y position

    // Check if bead overlaps with any main circles or other beads
    let overlapping = false;
    for (let circle of circles) {
      let d = dist(x, y, circle.x, circle.y); //distance between bead and each main circle
      if (d < (beadSize / 2 + circle.size / 2)) {
        overlapping = true;
        break;
      }
    }
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
}

// --- Draw Function ---
function draw() {
  background(10, 10, 50); //set background to navy blue

  // Draw each bead
  for (let bead of beads) {
    bead.display(); // display the beads
  }

  // Draw each circle
  for (let circle of circles) {
    circle.display(); //display the circles
  }
}

// --- CirclePattern Class ---
class CirclePattern {
  constructor(x, y, size) {
    this.x = x; // x-coordinate
    this.y = y; // y-coordinate
    this.size = size; // Diameter of the main circle
    this.numLayers = int(random(3, 6)); //random number of layers
  }

 //display the circles that alternate between lines and circles
  display() {
    push(); // Save transformation
    translate(this.x, this.y); // Move origin to centre of circle
    
    // Draw each layer from outside to in
    for (let i = this.numLayers; i > 0; i--) {
      let layerSize = (this.size / this.numLayers) * i; //decide layer diameter
      let col = color(random(255), random(255), random(255)); // assign random colour for each layer
      
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
      ellipse(x, y, dotRadius); // Draw the dot
    }
  }

  // method to draw lines from center of circle
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
    this.x = x; // x of bead center
    this.y = y; // y of bead center
    this.size = size; //diameter
    this.color = color(255, random(100, 200), 0); //determine bead color (oranges)
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
  circles = []; //clear circles
  beads = []; // clear beads
  initialisePatterns(); // regenerate patterns
}