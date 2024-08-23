let myPicker;
let brushSizeSlider;
let brushOpacitySlider;
let brushStyle = "default"; // 默认画笔风格
let presetColors = [
  '#fceae2', '#ddeff6', '#dfeeea', '#f2d3bf', '#e0c7e3', '#ee6a5b', '#9e291e',
  '#e8c8c0', '#a8d8e2', '#ebe4d0', '#f39a8f', '#ae98b3', '#f6b654', '#7b241e',
  '#c4a6a0', '#5b7288', '#d7af83', '#d95475', '#846e89', '#c7dbd5', '#164346',
  '#383838', '#c5b8bf', '#9d8063', '#bbb1b1', '#c6d182', '#4ea59f', '#182b30'
]; // 24个颜色
let buttons = [];
let sliders = [];
let colorPicker;


function setup() {
  textSize(14); // 设置字体大小
  createCanvas(1280, 800);

  // 设置工具区背景颜色 (浅灰色)
  fill(50);
  rect(0, 0, 480, 800); // 左侧工具区 (400x800)

  // 初始颜色选择器
  myPicker = color('deeppink');

  // 颜色选择按钮 (点击后打开颜色选择器)
  buttons.push(new Button(50, 50, 60, 30, myPicker, () => {
    openColorPicker();
  }, "Pick"));

  // 创建三排预设颜色按钮
  for (let i = 0; i < presetColors.length; i++) {
    let x = 50 + (i % 7) * 50;
    let y = 110 + Math.floor(i / 7) * 50;
    buttons.push(new Button(x, y, 30, 30, color(presetColors[i]), () => {
      myPicker = color(presetColors[i]);
      updateColorPickerButton();
    }));
  }

  // 滑动条部分
  sliders.push(new Slider(160, 370, 160, 10, 1, 100, 100, "Size"));
  sliders.push(new Slider(160, 440, 160, 10, 0, 255, 255, "Opacity"));

  // 画笔风格选择区域
  buttons.push(new Button(50, 530, 100, 30, 'white', () => brushStyle = "default", "Default"));
  buttons.push(new Button(50, 580, 100, 30, 'white', () => brushStyle = "soft", "Soft"));
  buttons.push(new Button(50, 630, 100, 30, 'white', () => brushStyle = "pen", "Pen"));
  buttons.push(new Button(50, 680, 100, 30, 'white', () => brushStyle = "watercolor", "Watercolor"));
  buttons.push(new Button(50, 730, 100, 30, 'white', () => {
    brushStyle = "eraser";
    myPicker = color(255);
    updateColorPickerButton();
  }, "Eraser"));
  buttons.push(new Button(800, 765, 60, 30, 'white', clearCanvas, "Clear"));
  buttons.push(new Button(880, 765, 60, 30, 'white', saveCustomCanvas, "Save"));

  // 设置绘图区背景颜色 (深灰色)
  fill(230);
  rect(480, 0, 800, 800); // 右侧绘图区 (800x800)

  // 设置画布 (白色底色的720x720) 位于绘图区中心
  noStroke(); // 禁用边框
  fill(255);
  rect(520, 40, 720, 720); // 画布 (720x720)
}

function draw() {
  // 绘制按钮
  for (let button of buttons) {
    button.display();
  }

  // 绘制滑动条
  for (let slider of sliders) {
    slider.display();
  }

  let brushSize = sliders[0].value();
  let brushOpacity = sliders[1].value();

  // 限制绘制范围
  let minX = 520 + brushSize / 2;
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

// 打开颜色选择器
function openColorPicker() {
  if (colorPicker) {
    colorPicker.remove(); // 移除现有的颜色选择器
  }
  
  colorPicker = createColorPicker(myPicker);
  colorPicker.position(100, 50); // 放置在按钮下面的合适位置
  colorPicker.input(() => {
    myPicker = colorPicker.color();
    updateColorPickerButton();
  });
}

// 更新颜色选择按钮的颜色
function updateColorPickerButton() {
  for (let button of buttons) {
    if (button.label === "Pick") {
      button.color = myPicker;
    }
  }
}

// 清空画板功能
function clearCanvas() {
  noStroke(); // 确保无边框
  fill(255);
  rect(520, 40, 720, 720); // 重新绘制白色画布
}

// 保存画板图片功能
function saveCustomCanvas() {
  let canvasImage = get(520, 40, 720, 720); // 获取画布区域内容
  save(canvasImage, 'custom_canvas.png'); // 保存图片，命名为 custom_canvas.png
}

// 软画笔风格函数
function brush_soft(_color, _size) {
  noStroke();
  let baseAlpha = _color.levels[3];  // 获取用户设置的透明度
  let alphaFactor = baseAlpha / 2;   // 将透明度减少为用户输入的一半

  // 将基础大小设为输入大小的1/3，这样总绘制区域大致等于输入大小
  let baseSize = _size / 9;

  for (let i = 0; i < 10; i += 0.5) {
    let alpha = alphaFactor * (1 - i / 10); // 透明度随着半径减小
    fill(_color.levels[0], _color.levels[1], _color.levels[2], alpha);
    ellipse(mouseX, mouseY, baseSize + baseSize * i, baseSize + baseSize * i); // 增加模糊区域的半径
  }
}

// 笔风格函数
function pen(_color, _size, penposx, penposy, penx, peny) {
  let dix = penx - penposx;
  let diy = peny - penposy;
  let randomSize = random(1, _size); // 在 1 到用户输入的 size 之间随机变化
  let randomAlpha = random(1, _color.levels[3]); // 在 1 到用户输入的透明度之间随机变化

  let c = color(_color.levels[0], _color.levels[1], _color.levels[2], randomAlpha); // 设置随机透明度
  stroke(c);
  strokeWeight(randomSize); // 设置随机大小

  line(penposx, penposy, penx, peny); // 绘制线条
}

// 水彩效果函数
function watercolor(_color, _size) {
  // 将基础大小设为输入大小的1/2，这样总绘制区域大致等于输入大小
  let baseSize = _size/2 ;

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

// 自定义按钮类
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

  // 在Button类的display()方法中添加以下代码以绘制笔头的形状
display() {
  noStroke();
  
  // 检查鼠标是否在按钮上方
  this.hover = this.contains(mouseX, mouseY);
  
  // 根据状态更改颜色或添加边框
  if (this.clicked) {
    fill(100, 100, 100); // 点击状态的颜色
  } else if (this.hover) {
    fill(150, 150, 150); // 悬停状态的颜色
  } else {
    fill(this.color); // 默认颜色
  }
  
  rect(this.x, this.y, this.w, this.h, 5);
  
  // 绘制按钮上的文本标签
  if (this.label) {
    fill(0);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }

   

  if (this.label === "Default") {
      // 绘制横着的马克笔的笔头
      fill(10);
      rect(160,535,90,20);

      fill(120); // 灰色
      beginShape();
      vertex(250, 555); // 左下角
      vertex(270, 550); // 右下角
      vertex(270, 540); // 右上角
      vertex(250, 535); // 左上角
      endShape(CLOSE);

      fill(255); // 白色
      rect(270,540,15,10);
    
    } else if (this.label === "Soft") {
      // 绘制横着的水笔的笔头
      fill(30);
      rect(160, 580, 100, 30);
      fill(120); // 灰色
      beginShape();
      vertex(260, 610); // 左下角
      vertex(290, 600); // 右下角
      vertex(290, 590); // 右上角
      vertex(260, 580); // 左上角
      endShape(CLOSE);
      fill(255); // 白色
      arc(290, 595, 10, 10, -PI/2 , PI/2 );
  
  
    } else if (this.label === "Pen") {
      // 绘制横着的钢笔的笔头
      fill(20);
      rect(160,635,150,15);
      fill(120); // 灰色
      beginShape();
      vertex(310, 650); // 左下角
      vertex(330, 645); // 右下角
      vertex(330, 640); // 右上角
      vertex(310, 635); // 左上角
      endShape(CLOSE);

      fill(255); // 白色
      rect(330,640,6,5);
    
  } else if (this.label === "Watercolor") {
      // 绘制横着的排笔的笔头
      fill(30);
      rect(160,685,100,20);
      fill(120); // 灰色
      rect(260,686,12,16);
      fill(255); // 白色
      rect(272,686,20,16);
  } else if (this.label === "Eraser") {
      // 绘制横着的橡皮擦
      fill(120); // 灰色
      rect(160, 730, 50,30);
      fill(240); // 白色
      rect(210,730,20,30);
  }
  
  // 绘制后重置点击状态
  this.clicked = false;
}


  contains(mx, my) {
    return mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
  }
}

// 自定义滑动条类
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

    // Draw the slider track
    fill(255);
    rect(this.x-8, this.y-5, this.w+18, this.h+10);
    // Draw the slider track
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

// 当你按下空格键时，当前画布上的内容会被保存为 "thumbnail.png" 文件到你的下载文件夹
function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  }
}
