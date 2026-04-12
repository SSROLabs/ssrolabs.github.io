const year = document.querySelector("#year");
const canvas = document.querySelector("#cyber-bg");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (canvas) {
  const ctx = canvas.getContext("2d", { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let frame = 0;

  const createNodes = () => {
    const count = width < 700 ? 58 : 96;
    nodes = Array.from({ length: count }, (_, index) => {
      const angle = index * 0.72;
      const ring = 130 + (index % 9) * 24;
      return {
        x: Math.cos(angle) * ring,
        y: ((index % 13) - 6) * 34,
        z: Math.sin(angle) * ring + ((index % 5) - 2) * 42,
        phase: index * 0.18
      };
    });
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createNodes();
  };

  const project = (point, time) => {
    const rotationY = time * 0.16;
    const rotationX = Math.sin(time * 0.18) * 0.22;
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const wave = Math.sin(time + point.phase) * 18;
    const x = point.x * cosY - point.z * sinY;
    const z = point.x * sinY + point.z * cosY;
    const y = (point.y + wave) * cosX - z * sinX;
    const depth = z * cosX + (point.y + wave) * sinX + 620;
    const scale = 620 / Math.max(260, depth);

    return {
      x: width / 2 + x * scale,
      y: height / 2 + y * scale,
      scale,
      alpha: Math.min(1, Math.max(0.08, scale * 0.46))
    };
  };

  const draw = () => {
    frame += 1;
    const time = frame / 60;
    ctx.clearRect(0, 0, width, height);

    const projected = nodes.map((node) => project(node, time));

    ctx.lineWidth = 1;
    for (let i = 0; i < projected.length; i += 1) {
      for (let j = i + 1; j < projected.length; j += 1) {
        const dx = projected[i].x - projected[j].x;
        const dy = projected[i].y - projected[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 145) {
          const alpha = (1 - distance / 145) * 0.22;
          ctx.strokeStyle = i % 4 === 0
            ? `rgba(225, 6, 0, ${alpha})`
            : `rgba(255, 255, 255, ${alpha * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();
        }
      }
    }

    projected.forEach((point, index) => {
      const radius = index % 7 === 0 ? 2.2 : 1.3;
      ctx.fillStyle = index % 5 === 0
        ? `rgba(225, 6, 0, ${0.42 * point.alpha})`
        : `rgba(255, 255, 255, ${0.34 * point.alpha})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
}
