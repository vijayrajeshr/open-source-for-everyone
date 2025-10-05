(() => {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const cfg = { count: 200, sizeMin: 0.5, sizeMax: 1.5 }; // 200 stars
    let stars = [];

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function createStars() {
        const starColors = [
            'rgba(255, 255, 255, 1)',    // white
            'rgba(255, 245, 200, 1)',    // warm yellow
            'rgba(200, 220, 255, 1)',    // icy blue
            'rgba(255, 180, 150, 1)',    // soft orange
            'rgba(210, 255, 220, 1)',    // pale greenish-white
            'rgba(255, 220, 255, 1)'     // light pinkish-white
        ];

        stars = [];
        for (let i = 0; i < cfg.count; i++) {
            const color = starColors[Math.floor(Math.random() * starColors.length)];
            const glowIntensity = rand(8, 20); // vary glow per star
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                size: rand(cfg.sizeMin, cfg.sizeMax),
                alpha: rand(0.3, 1),
                vx: rand(-0.05, 0.05),
                vy: rand(-0.03, 0.03),
                color: color,
                glow: glowIntensity
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, W, H);
        const time = Date.now();
        for (const s of stars) {
            // move star
            s.x += s.vx;
            s.y += s.vy;

            // wrap around edges
            if (s.x > W) s.x = 0;
            if (s.x < 0) s.x = W;
            if (s.y > H) s.y = 0;
            if (s.y < 0) s.y = H;

            // subtle twinkle
            const alpha = s.alpha + 0.25 * Math.sin(time * 0.002 + s.x + s.y);

            // glow effect
            ctx.shadowBlur = s.glow;
            ctx.shadowColor = s.color;

            // fill style with updated alpha
            ctx.fillStyle = s.color.replace(/1\)$/, `${Math.min(1, Math.max(0.1, alpha))})`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();

            // reset shadow
            ctx.shadowBlur = 0;
        }
    }

    function animate() {
        drawStars();
        requestAnimationFrame(animate);
    }

    function init() { resize(); createStars(); animate(); }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            createStars();
        }, 120);
    });

    requestAnimationFrame(init);
})();
