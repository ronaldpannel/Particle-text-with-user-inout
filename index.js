window.addEventListener("load", function () {
  /**@type{HTMLCanvasElement} */

  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = 400;
  canvas.height = 500;

  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = Math.random() * this.effect.canvasWidth;
      this.y = this.effect.canvasHeight;
      this.color = color;
      this.originalX = x;
      this.originalY = y;
      this.size = this.effect.gap;
      this.dx = 0;
      this.dy = 0;
      this.vx = 0;
      this.vy = 0;
      this.force = 0;
      this.angle = 0;
      this.distance = 0;
      this.friction = Math.random() * 0.6 + 0.15;
      this.ease = Math.random() * 0.1 + 0.005;
    }
    draw() {
      this.effect.context.fillStyle = this.color;
      this.effect.context.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
      this.dx = this.effect.pointer.x - this.x;
      this.dy = this.effect.pointer.y - this.y;
      this.distance = this.dx * this.dx + this.dy * this.dy;
      this.force = -this.effect.pointer.radius / this.distance;

      if (this.distance < this.effect.pointer.radius) {
        this.angle = Math.atan2(this.dy, this.dx);
        this.vx += this.force * Math.cos(this.angle);
        this.vy += this.force * Math.sin(this.angle);
      }
      this.x +=
        (this.vx *= this.friction) + (this.originalX - this.x) * this.ease;
      this.y +=
        (this.vy *= this.friction) + (this.originalY - this.y) * this.ease;
    }
  }

  class Effect {
    constructor(context, canvasWidth, canvasHeight) {
      this.context = context;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.textX = this.canvasWidth * 0.5;
      this.textY = this.canvasHeight * 0.5;
      this.fontSize = 80;
      this.lineHeight = this.fontSize * 0.99;
      this.maxTextWidth = this.canvasWidth * 0.8;
      this.verticalOffset = 20;
      const textInput = document.getElementById("textInput");
      textInput.addEventListener("keyup", (e) => {
        if (e.key !== " ") {
          this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
          this.wrapText(e.target.value);
        }
      });
      //particle text
      this.particles = [];
      this.gap = 3;
      this.pointer = {
        radius: 20000,
        x: undefined,
        y: undefined,
        active: false,
      };
      window.addEventListener("pointermove", (e) => {
        this.pointer.x = e.offsetX;
        this.pointer.y = e.offsetY;
      });
    }
    wrapText(text) {
      const gradient = this.context.createLinearGradient(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );
      gradient.addColorStop(0.3, "red");
      gradient.addColorStop(0.5, "orange");
      gradient.addColorStop(0.7, "yellow");
      this.context.fillStyle = gradient;
      this.context.textAlign = "center";
      this.context.textBaseLine = "middle";
      this.context.lineWidth = 3;
      this.context.strokeStyle = "white";
      this.context.letterSpacing = "5px";
      this.context.font = this.fontSize + "px Helvetica";
      this.context.fillText(text, this.textX, this.textY);
      this.context.strokeText(text, this.textX, this.textY);
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      //break to multi line text
      let linesArray = [];
      let words = text.split(" ");
      let lineCounter = 0;
      let line = " ";
      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        if (this.context.measureText(testLine).width > this.maxTextWidth) {
          line = words[i] + " ";
          lineCounter++;
        } else {
          line = testLine;
        }
        linesArray[lineCounter] = line;
      }
      let textHeight = this.lineHeight * lineCounter;
      this.textY =
        this.canvasHeight * 0.5 - textHeight * 0.5 + this.verticalOffset;
      linesArray.forEach((el, index) => {
        this.context.fillText(
          el,
          this.textX,
          this.textY + index * this.lineHeight
        );
        this.context.strokeText(
          el,
          this.textX,
          this.textY + index * this.lineHeight
        );
      });
      this.convertToParticles();
    }
    convertToParticles() {
      this.particles = [];
      const pixels = this.context.getImageData(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      ).data;
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      for (let y = 0; y < this.canvasHeight; y += this.gap) {
        for (let x = 0; x < this.canvasHeight; x += this.gap) {
          const index = (y * this.canvasWidth + x) * 4;
          const alpha = pixels[index + 3];
          if (alpha > 0) {
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
            const color = `rgb(${red}, ${green}, ${blue})`;
            this.particles.push(new Particle(this, x, y, color));
          }
        }
      }
    }
    render() {
      this.particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
    }
    resize(width, height) {
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.textX = this.canvasWidth * 0.5;
      this.textY = this.canvasHeight * 0.5;
      this.maxTextWidth = this.canvasWidth * 0.8;
    }
  }
  const effect = new Effect(ctx, canvas.width, canvas.height);
  effect.wrapText("Hello Lets Code");
  effect.render();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    effect.render();
    requestAnimationFrame(animate);
  }

  animate();
  this.window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height);
    effect.wrapText("lets Code with Javascript now");
  });
});
