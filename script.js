// ---------------- Boot sequence ----------------
const bootLines = [
  { text: "> initializing_session...", cls: "dim", pause: 220 },
  { text: "> loading profile.dat", cls: "dim", pause: 260 },
  { text: "> compiling identity_matrix... OK", cls: "", pause: 300 },
  { text: "> handshake with visitor... OK", cls: "", pause: 260 },
  { text: "> ACCESS GRANTED", cls: "amber", pause: 500 },
];

const bootEl = document.getElementById('boot-text');
const bootOverlay = document.getElementById('boot');
let lineIdx = 0;

function typeLine(line, cb){
  const p = document.createElement('div');
  if(line.cls) p.className = line.cls;
  bootEl.appendChild(p);
  let i = 0;
  const speed = 14;
  function step(){
    if(i <= line.text.length){
      p.textContent = line.text.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else {
      setTimeout(cb, line.pause);
    }
  }
  step();
}

function runBoot(){
  if(lineIdx < bootLines.length){
    typeLine(bootLines[lineIdx], () => { lineIdx++; runBoot(); });
  } else {
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    bootEl.appendChild(cursor);
    setTimeout(finishBoot, 400);
  }
}

function finishBoot(){
  bootOverlay.classList.add('fade-out');
  const navEl = document.getElementById('nav');
  if(navEl) navEl.classList.add('show');
  revealHero();
  setTimeout(() => bootOverlay.remove(), 700);
}

function revealHero(){
  const items = [
    ['hero-eyebrow', 0],
    ['hero-title', 120],
    ['hero-sub', 320],
    ['hero-cta', 480],
    ['scroll-hint', 620],
  ];
  items.forEach(([id, delay]) => {
    const el = document.getElementById(id);
    if(!el) return;
    setTimeout(() => {
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      el.style.opacity = '1';
    }, delay);
  });
}

// Only run the boot sequence on pages that actually have the overlay (e.g. the homepage)
if(bootEl && bootOverlay){
  runBoot();
} else {
  const navEl = document.getElementById('nav');
  if(navEl) navEl.classList.add('show');
}

// ---------------- Scroll reveal ----------------
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------------- Particle network ----------------
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let w, h, particles, mouse = { x: null, y: null };
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initParticles(){
  const count = Math.min(90, Math.floor((w * h) / 16000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6,
  }));
}
initParticles();

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

function tick(){
  ctx.clearRect(0, 0, w, h);
  const linkDist = 130;

  for(let i = 0; i < particles.length; i++){
    const p = particles[i];
    if(!prefersReduced){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
    }

    if(mouse.x !== null){
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 140){
        const force = (140 - dist) / 140;
        p.x += (dx / dist) * force * 1.2;
        p.y += (dy / dist) * force * 1.2;
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(77,255,180,0.75)';
    ctx.fill();

    for(let j = i + 1; j < particles.length; j++){
      const q = particles[j];
      const dx = p.x - q.x, dy = p.y - q.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < linkDist){
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(77,255,180,${(1 - dist / linkDist) * 0.18})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if(mouse.x !== null){
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 160){
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(255,176,32,${(1 - dist / 160) * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(tick);
}
tick();

// ---------------- Subtle role glitch on hero ----------------
const roles = ["builds systems.", "is not your regular software engineer", "ships code.", "is a terminal enthusiast.", "breaks things (on purpose).", "might be a regular software engineer after all."];
let roleIdx = 0;
const glitchEl = document.getElementById('glitch-role');
const roleCursor = document.getElementById('role-cursor');
if(glitchEl){
  glitchEl.style.transition = 'opacity 0.2s ease';
  setInterval(() => {
    roleIdx = (roleIdx + 1) % roles.length;
    glitchEl.style.opacity = '0';
    setTimeout(() => {
      glitchEl.textContent = roles[roleIdx];
      glitchEl.style.opacity = '1';
      if(roleCursor){
        // restart the pop animation by removing then re-adding the class
        roleCursor.classList.remove('pop');
        void roleCursor.offsetWidth; // force reflow so the animation replays
        roleCursor.classList.add('pop');
      }
    }, 200);
  }, 4200);
}