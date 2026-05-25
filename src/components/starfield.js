import { APP_CONFIG } from '../config/appConfig.js';

export function createStarfield(canvas, options = APP_CONFIG.starfield) {
  const ctx = canvas?.getContext('2d');
  let animationId = null;
  let stars = [];

  function initStars() {
    if (!canvas) return;
    stars = Array.from({ length: options.count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2 + 0.2,
      color: `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`,
      speed: Math.random() * (options.maxSpeed - options.minSpeed) + options.minSpeed
    }));
  }

  function resize() {
    if (!canvas?.parentElement) return;
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    initStars();
  }

  function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();

      star.y += star.speed;
      star.x -= star.speed * 0.3;

      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
      if (star.x < 0) {
        star.x = canvas.width;
        star.y = Math.random() * canvas.height;
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(draw);
  }

  function stop() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  }

  return { start, stop };
}
