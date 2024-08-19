let myPicker;
let brushSizeSlider;
let brushOpacitySlider;
let brushStyle = "default"; // 默认画笔风格
let presetColors = [
  '#fceae2', '#ddeff6', '#dfeeea', '#f2d3bf', '#e0c7e3', '#ee6a5b',  
  '#e8c8c0', '#a8d8e2', '#ebe4d0', '#f39a8f', '#ae98b3', '#f6b654',  
  '#c4a6a0', '#5b7288', '#d7af83', '#d95475', '#846e89', '#c7dbd5',  
  '#383838', '#c5b8bf', '#9d8063', '#bbb1b1', '#c6d182', '#4ea59f'
]; // 24个颜色

function setup() {
  createCanvas(1200, 800);

  // 设置工具区背景颜色 (浅灰色)
  fill(50);
  rect(0, 0, 400, 800); // 左侧工具区 (400x800)

  // 上部分：颜色选择器和预设颜色区域
  myPicker = createColorPicker('deeppink');
  myPicker.position(45, 50);
  myPicker.size(40, 40); // 设置与按钮相同的大小

  // 创建三排预设颜色按钮
  for (let i = 0; i < presetColors.length; i++) {
    let colorButton = createButton('');
    colorButton.style('background-color', presetColors[i]);
    colorButton.position(50 + (i % 6) * 50, 110 + Math.floor(i / 6) * 50); // 在 colorPicker 下方分三排排列
    colorButton.size(30, 30); // 设置按钮大小与 colorPicker 一致
    colorButton.mousePressed(() => myPicker.value(presetColors[i])); // 点击按钮时设置颜色选择器的颜色
  }

  // 下部分：透明度滑块、画笔大小滑块、按钮区域
  let controlsYPosition = 300; // 下部分的起始 Y 位置（根据需要调整）

  // 画笔大小标签
  fill(255); // 设置标签字体颜色为白色
  textSize(16); // 设置字体大小
  text('Size:', 50, controlsYPosition + 65);

  // 画笔大小滑块区域
  brushSizeSlider = createSlider(1, 100, 100); // 设置默认值为最大
  brushSizeSlider.position(150, controlsYPosition + 50);

  // 透明度标签
  fill(255); // 设置标签字体颜色为白色
  text('Opacity:', 50, controlsYPosition + 120);

  // 透明度滑块区域
  brushOpacitySlider = createSlider(0, 255, 255); // 设置默认值为最大
  brushOpacitySlider.position(150, controlsYPosition + 105);

  // 画笔风格标签
  fill(255); // 设置标签字体颜色为白色
  text('Brushes:', 50, controlsYPosition + 175);

  // 画笔风格选择区域
  createButton('Default').position(50, controlsYPosition + 200).size(100, 30).mousePressed(() => brushStyle = "default");
  createButton('Soft').position(50, controlsYPosition + 255).size(100, 30).mousePressed(() => brushStyle = "soft");
  createButton('Pen').position(50, controlsYPosition + 310).size(100, 30).mousePressed(() => brushStyle = "pen");
  createButton('Watercolor').position(50, controlsYPosition + 365).size(100, 30).mousePressed(() => brushStyle = "watercolor");

  // 橡皮擦按钮
  createButton('Eraser').position(50, controlsYPosition + 420).size(100, 30).mousePressed(() => {
    brushStyle = "eraser";
    myPicker.value('#ffffff'); // 将颜色选择器设置为白色
  });

  // 清空画板按钮
  createButton('Clear').position(730, controlsYPosition + 465).size(60, 30).mousePressed(clearCanvas);

  // 保存画板图片按钮
  createButton('Save').position(810, controlsYPosition + 465).size(60, 30).mousePressed(saveCustomCanvas);

  // 设置绘图区背景颜色 (深灰色)
  fill(230);
  rect(400, 0, 800, 800); // 右侧绘图区 (800x800)

  // 设置画布 (白色底色的720x720) 位于绘图区中心
  noStroke(); // 禁用边框
  fill(255);
  rect(440, 40, 720, 720); // 画布 (720x720)
}


function draw() {
  let brushSize = brushSizeSlider.value();

  // 限制绘制范围
  let minX = 440 + brushSize / 2;
  let maxX = 1160 - brushSize / 2;
  let minY = 40 + brushSize / 2;
  let maxY = 760 - brushSize / 2;

  if (mouseIsPressed && mouseX > minX && mouseX < maxX && mouseY > minY && mouseY < maxY) {
    let c = myPicker.color();
    let brushOpacity = brushOpacitySlider.value();
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

// 清空画板功能
function clearCanvas() {
  noStroke(); // 确保无边框
  fill(255);
  rect(440, 40, 720, 720); // 重新绘制白色画布
}

// 保存画板图片功能
function saveCustomCanvas() {
  let canvasImage = get(440, 40, 720, 720); // 获取画布区域内容
  save(canvasImage, 'custom_canvas.png'); // 保存图片，命名为 custom_canvas.png
}

// 软画笔风格函数
function brush_soft(_color, _size) {
  noStroke();
  let baseAlpha = _color.levels[3];  // 获取用户设置的透明度
  let alphaFactor = baseAlpha / 2;   // 将透明度减少为用户输入的一半

  // 将基础大小设为输入大小的1/3，这样总绘制区域大致等于输入大小
  let baseSize = _size / 3;

  for (let i = 0; i < 10; i += 0.5) {
    let alpha = alphaFactor * (1 - i / 10); // 透明度随着半径减小
    fill(_color.levels[0], _color.levels[1], _color.levels[2], alpha);
    ellipse(mouseX, mouseY, (baseSize + baseSize * i, baseSize + baseSize * i)/3); // 增加模糊区域的半径
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
    for (let m = 0; m < TWO_PI; m += 1) {
      let r = random(baseSize * 0.8, baseSize * 1.2);
      let x = cos(m) * r;
      let y = sin(m) * r;
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}
