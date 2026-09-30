const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let leaves = [];
const leafCount = 74;
const colors = ['#e67e22', '#d35400', '#f39c12', '#c0392b', '#ae5414'];
let windX = 0.2;
let windY = 0.5;
let touchPos = { x: null, y: null, active: false };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Leaf {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.size = Math.random() * 8 + 6;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speedY = Math.random() * 1 + 0.8;
    this.speedX = Math.random() * 0.6 - 0.3;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = Math.random() * 0.03 - 0.015;
    this.swingRange = Math.random() * 0.02 + 0.01;
    this.swingTime = Math.random() * 100;
  }

  update() {
    this.swingTime += this.swingRange;
    this.y += this.speedY + Math.sin(this.swingTime) * 0.3 + windY * 0.5;
    this.x += this.speedX + Math.cos(this.swingTime) * 0.8 + windX;
    this.angle += this.rotationSpeed;

    if (touchPos.active) {
      const dx = this.x - touchPos.x;
      const dy = this.y - touchPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 8;
        this.y += (dy / dist) * force * 4;
      }
    }

    if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.quadraticCurveTo(this.size * 0.6, 0, 0, this.size);
    ctx.quadraticCurveTo(-this.size * 0.6, 0, 0, -this.size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function init() {
  resize();
  leaves = [];
  for (let i = 0; i < leafCount; i++) {
    leaves.push(new Leaf());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  windX = Math.sin(Date.now() * 0.0005) * 0.4 + 0.2;
  leaves.forEach(leaf => {
    leaf.update();
    leaf.draw();
  });
  requestAnimationFrame(animate);
}

const handleStart = (e) => {
  touchPos.active = true;
  const t = e.touches ? e.touches[0] : e;
  touchPos.x = t.clientX;
  touchPos.y = t.clientY;
};

const handleMove = (e) => {
  if (!touchPos.active) return;
  const t = e.touches ? e.touches[0] : e;
  touchPos.x = t.clientX;
  touchPos.y = t.clientY;
};

const handleEnd = () => { touchPos.active = false; };

window.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);
window.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);
window.addEventListener('resize', resize);

init();
animate();

/* ---- background audio: "rests" track, loops automatically ---- */
const audioNotice = document.getElementById('audio-notice');
const restsAudio = document.getElementById('rests');

function startRests() {
  restsAudio.play().then(() => {
    audioNotice.style.display = 'none';
  }).catch(() => {
    // playback blocked, will retry on next interaction
  });
}

document.body.addEventListener('click', startRests, { once: true });
document.body.addEventListener('touchstart', startRests, { once: true });
