(() => {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    // ------------------- Stars Config -------------------
    const cfg = {
        layers: [
            { count: 500, sizeMin: 0.3, sizeMax: 0.8 },   // small stars
            { count: 100, sizeMin: 0.8, sizeMax: 1.5 },   // medium stars
            { count: 20, sizeMin: 1.5, sizeMax: 2 }       // large stars
        ]
    };
    let stars = [];

    // ------------------- Nebulae / Mist -------------------
    let clouds = [];

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        createStars();
        createNebulae();
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    // ------------------- Stars -------------------
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
        cfg.layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                const color = starColors[Math.floor(Math.random() * starColors.length)];
                const glowIntensity = rand(8, 20);
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    size: rand(layer.sizeMin, layer.sizeMax),
                    alpha: rand(0.3, 1),
                    vx: rand(-0.05, 0.05),
                    vy: rand(-0.03, 0.03),
                    color: color,
                    glow: glowIntensity
                });
            }
        });
    }

    function drawStars() {
        const time = Date.now();
        for (const s of stars) {
            s.x += s.vx;
            s.y += s.vy;

            if (s.x > W) s.x = 0;
            if (s.x < 0) s.x = W;
            if (s.y > H) s.y = 0;
            if (s.y < 0) s.y = H;

            const alpha = s.alpha + 0.35 * Math.sin(time * 0.002 + s.x + s.y);
            ctx.shadowBlur = s.glow;
            ctx.shadowColor = s.color;
            ctx.fillStyle = s.color.replace(/1\)$/, `${Math.min(1, Math.max(0.1, alpha))})`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // ------------------- Nebulae -------------------
    function createNebulae() {
        clouds = [];
        for (let i = 0; i < 6; i++) {
            const nebula = {
                blobs: [],
                x: rand(0, W),
                y: rand(0, H / 2),
                alpha: rand(0.1, 0.25), // increased base opacity
                vx: rand(0.005, 0.02),  // slower movement
                vy: rand(-0.005, 0.005),
                baseColor: `hsla(${rand(220, 260)}, 70%, 60%, 1)` // slightly brighter
            };
            const blobCount = rand(6, 12); // more blobs
            for (let b = 0; b < blobCount; b++) {
                nebula.blobs.push({
                    offsetX: rand(-150, 150), // larger spread
                    offsetY: rand(-120, 120),
                    radius: rand(100, 250), // larger blobs
                    alpha: rand(0.05, 0.15) // increased opacity per blob
                });
            }
            clouds.push(nebula);
        }
    }

    function drawNebulae() {
        for (const n of clouds) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x - 200 > W) n.x = -200;
            if (n.y - 200 > H) n.y = -200;

            for (const b of n.blobs) {
                const gx = n.x + b.offsetX;
                const gy = n.y + b.offsetY;
                const gradient = ctx.createRadialGradient(gx, gy, 0, gx, gy, b.radius);
                gradient.addColorStop(0, `hsla(${rand(220, 260)}, 70%, 60%, ${b.alpha * n.alpha})`);
                gradient.addColorStop(1, `hsla(${rand(220, 260)}, 70%, 60%, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(gx, gy, b.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }


    function drawAll() {
        ctx.clearRect(0, 0, W, H);
        drawNebulae();
        drawStars();
        requestAnimationFrame(drawAll);
    }

    function init() {
        resize();
        drawAll();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
        }, 120);
    });

    requestAnimationFrame(init);
})();
