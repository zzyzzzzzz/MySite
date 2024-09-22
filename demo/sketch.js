let myPicker;
let brushSizeSlider;
let brushOpacitySlider;
let brushStyle = "default"; // Default brush style
let presetColors = [
  '#fceae2', '#ddeff6', '#dfeeea', '#f2d3bf', '#e0c7e3', '#ee6a5b', //'#9e291e',
  '#e8c8c0', '#a8d8e2', '#ebe4d0', '#f39a8f', '#ae98b3', '#f6b654', //'#7b241e',
  '#c4a6a0', '#5b7288', '#d7af83', '#d95475', '#846e89', '#c7dbd5', //'#164346',
  '#383838', '#c5b8bf', '#9d8063', '#bbb1b1', '#c6d182', '#4ea59f'//, '#182b30'
]; // 24 colors
let buttons = [];
let sliders = [];
let colorPicker;

function setup() {
  textSize(14); // Set font size
  createCanvas(1280, 800);

  // Set tool area background color (light gray)
  fill(50);
  rect(0, 0, 480, 800); 

  // Initial color picker
  myPicker = color('deeppink');

  // Color picker button (click to open color picker)
  buttons.push(new Button(50, 50, 60, 30, myPicker, () => {
    openColorPicker();
  }, "Pick"));

  // Create three rows of preset color buttons
  for (let i = 0; i < presetColors.length; i++) {
    let x = 50 + (i % 6) * 50;
    let y = 110 + Math.floor(i / 6) * 50;
    buttons.push(new Button(x, y, 30, 30, color(presetColors[i]), () => {
      myPicker = color(presetColors[i]);
      updateColorPickerButton();
    }));
  }

  // Slider section
  sliders.push(new Slider(160, 370, 160, 10, 1, 100, 100, "Size"));
  sliders.push(new Slider(160, 440, 160, 10, 0, 255, 255, "Opacity"));

  // Brush style selection area
  buttons.push(new Button(50, 530, 100, 30, 'white', () => brushStyle = "default", "Default"));
  buttons.push(new Button(50, 580, 100, 30, 'white', () => brushStyle = "soft", "Soft"));
  buttons.push(new Button(50, 630, 100, 30, 'white', () => brushStyle = "pen", "Pen"));
  buttons.push(new Button(50, 680, 100, 30, 'white', () => brushStyle = "watercolor", "Watercolor"));
  buttons.push(new Button(50, 730, 100, 30, 'white', () => {
    brushStyle = "eraser";
    myPicker = color(255);
    updateColorPickerButton();
  }, "Eraser"));
  buttons.push(new Button(750, 765, 60, 30, 'white', clearCanvas, "Clear"));
  buttons.push(new Button(830, 765, 60, 30, 'white', saveCustomCanvas, "Save"));

  // Set drawing area background color (dark gray)
  fill(230);
  rect(380, 0, 900, 800); // Right drawing area (800x800)

  // Set canvas (white background 720x720) in the center of the drawing area
  noStroke(); // Disable border
  fill(255);
  rect(420, 40, 820, 720); // Canvas (720x720)
}

function draw() {
  // Draw buttons
  for (let button of buttons) {
    button.display();
  }

  // Draw sliders
  for (let slider of sliders) {
    slider.display();
  }

  let brushSize = sliders[0].value();
  let brushOpacity = sliders[1].value();

  // Limit drawing range
  let minX = 420 + brushSize / 2;
  let maxX = 1240 - brushSize / 2;
  let minY = 40 + brushSize / 2;
  let maxY = 760 - brushSize / 2;

  if (mouseIsPressed && mouseX > minX && mouseX < maxX && mouseY > minY && mouseY < maxY) {
    let c = myPicker;
    c.setAlpha(brushOpacity);

    if (brushStyle === "eraser") {
      c = color(255, 255, 255, brushOpacity);
      stroke(c);
      strokeWeight(brushSize);
      line(pmouseX, pmouseY, mouseX, mouseY);
    } else if (brushStyle === "default") {
      stroke(c);
      strokeWeight(brushSize);
      line(pmouseX, pmouseY, mouseX, mouseY);
    } else if (brushStyle === "soft") {
      brush_soft(c, brushSize);
    } else if (brushStyle === "pen") {
      pen(c, brushSize, pmouseX, pmouseY, mouseX, mouseY);
    } else if (brushStyle === "watercolor") {
      watercolor(c, brushSize);
    }
  }
}

// Open color picker
function openColorPicker() {
  if (colorPicker) {
    colorPicker.remove(); // Remove existing color picker
  }
  
  colorPicker = createColorPicker(myPicker);
  colorPicker.position(100, 50); // Place below the button
  colorPicker.input(() => {
    myPicker = colorPicker.color();
    updateColorPickerButton();
  });
}

// Update color picker button color
function updateColorPickerButton() {
  for (let button of buttons) {
    if (button.label === "Pick") {
      button.color = myPicker;
    }
  }
}

// Clear canvas function
function clearCanvas() {
  noStroke(); // Ensure no border
  fill(255);
  rect(420, 40, 820, 720); // Redraw white canvas
}

// Save canvas image function
function saveCustomCanvas() {
  let canvasImage = get(420, 40, 720, 720); // Get canvas area content
  save(canvasImage, 'custom_canvas.png'); // Save image as custom_canvas.png
}

// Soft brush style function
function brush_soft(_color, _size) {
  noStroke();
  let baseAlpha = _color.levels[3];  // Get user-set opacity
  let alphaFactor = baseAlpha / 2;   // Reduce opacity to half of user input

  // Set base size to 1/3 of input size, so total drawing area is roughly equal to input size
  let baseSize = _size / 9;

  for (let i = 0; i < 10; i += 0.5) {
    let alpha = alphaFactor * (1 - i / 10); // Opacity decreases with radius
    fill(_color.levels[0], _color.levels[1], _color.levels[2], alpha);
    ellipse(mouseX, mouseY, baseSize + baseSize * i, baseSize + baseSize * i); // Increase blur area radius
  }
}

// Pen style function
function pen(_color, _size, penposx, penposy, penx, peny) {
  let dix = penx - penposx;
  let diy = peny - penposy;
  let randomSize = random(1, _size); // Randomly vary between 1 and user input size
  let randomAlpha = random(1, _color.levels[3]); // Randomly vary between 1 and user input opacity

  let c = color(_color.levels[0], _color.levels[1], _color.levels[2], randomAlpha); // Set random opacity
  stroke(c);
  strokeWeight(randomSize); // Set random size

  line(penposx, penposy, penx, peny); // Draw line
}

// Watercolor effect function
function watercolor(_color, _size) {
  // Set base size to 1/2 of input size, so total drawing area is roughly equal to input size
  let baseSize = _size / 2;

  fill(
    _color.levels[0] + random(-25, 25),
    _color.levels[1] + random(-25, 25),
    _color.levels[2] + random(-25, 25),
    _color.levels[3] / 20
  );
  noStroke();
  for (let i = 0; i < 3; i++) {
    push();
    translate(mouseX, mouseY);
    rotate(random(PI * 2));
    beginShape();
    for (let m = 0; TWO_PI > m; m += 1) {
      let r = random(baseSize * 0.8, baseSize * 1.2);
      let x = cos(m) * r;
      let y = sin(m) * r;
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}

// Custom Button class
class Button {
  constructor(x, y, w, h, color, onClick, label = '') {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.onClick = onClick;
    this.label = label;
    this.hover = false;
    this.clicked = false;
  }

  // Add the following code to the display() method of the Button class to draw the brush shape
  display() {
    noStroke();

    // Check if the mouse is over the button or graphic area
    this.hover = this.contains(mouseX, mouseY);

    // Change color or add border based on state
    if (this.clicked) {
      fill(100, 100, 100); // Clicked state color
    } else if (this.hover) {
      fill(150, 150, 150); // Hover state color
    } else {
      fill(this.color); // Default color
    }

    // Draw button
    rect(this.x, this.y, this.w, this.h, 5);

    // Draw text label on button
    if (this.label) {
      fill(0);
      textAlign(CENTER, CENTER);
      text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    }

    // Draw brush graphic
    let brushX = this.x + this.w + 20; // Position graphic to the right of the button
    let brushY = this.y + this.h / 2;

    if (this.label === "Default") {
      // Draw horizontal marker pen tip
      fill(10);
      rect(brushX, brushY - 10, 90, 20);

      fill(120); // Gray
      beginShape();
      vertex(brushX + 90, brushY + 10); // Bottom left
      vertex(brushX + 110, brushY + 5); // Bottom right
      vertex(brushX + 110, brushY - 5); // Top right
      vertex(brushX + 90, brushY - 10); // Top left
      endShape(CLOSE);

      fill(255); // White
      rect(brushX + 110, brushY - 5, 15, 10);

    } else if (this.label === "Soft") {
      // Draw horizontal water pen tip
      fill(30);
      rect(brushX, brushY - 15, 100, 30);
      fill(120); // Gray
      beginShape();
      vertex(brushX + 100, brushY + 15); // Bottom left
      vertex(brushX + 130, brushY + 5); // Bottom right
      vertex(brushX + 130, brushY - 5); // Top right
      vertex(brushX + 100, brushY - 15); // Top left
      endShape(CLOSE);
      fill(255); // White
      arc(brushX + 130, brushY, 10, 10, -PI / 2, PI / 2);

    } else if (this.label === "Pen") {
      // Draw horizontal pen tip
      fill(20);
      rect(brushX, brushY - 7.5, 150, 15);
      fill(120); // Gray
      beginShape();
      vertex(brushX + 150, brushY + 7.5); // Bottom left
      vertex(brushX + 170, brushY + 2.5); // Bottom right
      vertex(brushX + 170, brushY - 2.5); // Top right
      vertex(brushX + 150, brushY - 7.5); // Top left
      endShape(CLOSE);

      fill(255); // White
      rect(brushX + 170, brushY - 2.5, 6, 5);

    } else if (this.label === "Watercolor") {
      // Draw horizontal flat brush tip
      fill(30);
      rect(brushX, brushY - 10, 100, 20);
      fill(120); // Gray
      rect(brushX + 100, brushY - 9, 12, 16);
      fill(255); // White
      rect(brushX + 112, brushY - 9, 20, 16);
      fill(120);
      rect(brushX + 117, brushY - 6, 15, 1);
      fill(120);
      rect(brushX + 116, brushY - 3, 16, 1);
      fill(120);
      rect(brushX + 117, brushY + 3, 15, 1);

    } else if (this.label === "Eraser") {
      // Draw horizontal eraser
      fill(120); // Gray
      rect(brushX, brushY - 15, 50, 30);
      fill(240); // White
      rect(brushX + 50, brushY - 15, 20, 30);
    }

    // Reset clicked state after drawing
    this.clicked = false;
  }

  // Modify the contains method of the Button class to detect the button and graphic area
  contains(mx, my) {
    let inButtonArea = mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;

    let brushX = this.x + this.w + 20; // Position graphic to the right of the button
    let inBrushArea = false;

    if (this.label === "Default") {
      inBrushArea = mx > brushX && mx < brushX + 110 && my > this.y && my < this.y + this.h;
    } else if (this.label === "Soft") {
      inBrushArea = mx > brushX && mx < brushX + 130 && my > this.y && my < this.y + this.h;
    } else if (this.label === "Pen") {
      inBrushArea = mx > brushX && mx < brushX + 170 && my > this.y && my < this.y + this.h;
    } else if (this.label === "Watercolor") {
      inBrushArea = mx > brushX && mx < brushX + 132 && my > this.y && my < this.y + this.h;
    } else if (this.label === "Eraser") {
      inBrushArea = mx > brushX && mx < brushX + 70 && my > this.y && my < this.y + this.h;
    }

    return inButtonArea || inBrushArea;
  }
}

// Custom Slider class
class Slider {
  constructor(x, y, w, h, minVal, maxVal, initialValue, label = '') {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.val = initialValue;
    this.dragging = false;
    this.label = label;
  }

  display() {
    noStroke();

    // Draw the slider bar
    fill(255);
    rect(this.x-8, this.y-5, this.w+18, this.h+10);
    fill(150);
    rect(this.x, this.y, this.w, this.h);
    
    // Draw the slider knob
    let sliderX = map(this.val, this.minVal, this.maxVal, this.x, this.x + this.w);
    fill(255);
    ellipse(sliderX, this.y + this.h / 2, this.h * 2);

    // Draw the slider label
    if (this.label) {
      fill(255);
      textAlign(LEFT, CENTER); // Align the text to the right side of the slider
      text(this.label, this.x - 110, this.y + this.h / 2); // Position the label to the left of the slider
    }
  }

  contains(mx, my) {
    return mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
  }

  value() {
    return this.val;
  }
}

function mousePressed() {
  for (let button of buttons) {
    if (button.contains(mouseX, mouseY)) {
      button.clicked = true;
      button.onClick();
    }
  }

  for (let slider of sliders) {
    if (slider.contains(mouseX, mouseY)) {
      slider.dragging = true;
    }
  }
}

function mouseDragged() {
  for (let slider of sliders) {
    if (slider.dragging) {
      slider.val = map(mouseX, slider.x, slider.x + slider.w, slider.minVal, slider.maxVal);
      slider.val = constrain(slider.val, slider.minVal, slider.maxVal);
    }
  }
}

function mouseReleased() {
  for (let slider of sliders) {
    slider.dragging = false;
  }
}

// When you press the spacebar, the current content on the canvas will be saved as a "thumbnail.png" file to your download folder
function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  }
}