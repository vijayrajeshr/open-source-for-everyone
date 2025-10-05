(() => {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    // ================== CONFIG ==================
    const cfgStars = {
        layers: [
            { count: 500, sizeMin: 0.3, sizeMax: 0.8 },
            { count: 120, sizeMin: 0.8, sizeMax: 1.5 },
            { count: 25, sizeMin: 1.5, sizeMax: 2.2 }
        ]
    };

    const cfgNebula = {
        count: 3,   // fewer nebulae
        sizeMin: 150,
        sizeMax: 300,  // smaller size range
        detail: 6,
        speedFactor: 0.2,
        colorPalette: [
            'rgba(173, 216, 230, 0.04)',  // very faint blue
            'rgba(238, 130, 238, 0.04)',  // faint violet
            'rgba(255, 182, 193, 0.04)',  // faint pink
            'rgba(144, 238, 144, 0.04)',  // faint green
            'rgba(255, 160, 122, 0.04)',  // faint salmon
            'rgba(255, 255, 224, 0.04)'   // faint yellow
        ]
    };

    let stars = [];
    let nebulae = [];

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    // ================== STARS ==================
    function createStars() {
        const starColors = [
            'rgba(255, 255, 255, 1)',
            'rgba(255, 245, 200, 1)',
            'rgba(200, 220, 255, 1)',
            'rgba(255, 180, 150, 1)',
            'rgba(210, 255, 220, 1)',
            'rgba(255, 220, 255, 1)'
        ];

        stars = [];
        cfgStars.layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                const color = starColors[Math.floor(Math.random() * starColors.length)];
                const glowIntensity = rand(6, 15);
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

    // ================== NEBULAE ==================
    function createNebulae() {
        nebulae = [];
        for (let i = 0; i < cfgNebula.count; i++) {
            nebulae.push({
                x: Math.random() * W,
                y: Math.random() * H,
                radius: rand(cfgNebula.sizeMin, cfgNebula.sizeMax),
                color: cfgNebula.colorPalette[i % cfgNebula.colorPalette.length],
                vx: rand(-0.02, 0.02),
                vy: rand(-0.01, 0.01),
                shapes: Array.from({ length: cfgNebula.detail }, () => ({
                    offsetX: rand(-1, 1),
                    offsetY: rand(-1, 1),
                    scale: rand(0.3, 1)
                }))
            });
        }
    }

    function drawNebulae() {
        nebulae.forEach(n => {
            n.x += n.vx * cfgNebula.speedFactor;
            n.y += n.vy * cfgNebula.speedFactor;

            if (n.x - n.radius > W) n.x = -n.radius;
            if (n.x + n.radius < 0) n.x = W + n.radius;
            if (n.y - n.radius > H) n.y = -n.radius;
            if (n.y + n.radius < 0) n.y = H + n.radius;

            n.shapes.forEach(s => {
                const px = n.x + s.offsetX * n.radius * 0.5;
                const py = n.y + s.offsetY * n.radius * 0.5;
                const pr = n.radius * s.scale;

                const gradient = ctx.createRadialGradient(px, py, pr * 0.05, px, py, pr);
                gradient.addColorStop(0, n.color);
                gradient.addColorStop(0.6, n.color.replace(/0\.\d+/, "0.02")); 
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(px, py, pr, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

    // ================== LIGHT BEAMS ==================
    function drawLightBeams() {
        const beamColors = [
            'rgba(255,255,255,0.03)',
            'rgba(200,220,255,0.02)',
            'rgba(255,200,255,0.02)'
        ];
        beamColors.forEach(color => {
            const gradient = ctx.createLinearGradient(0, 0, W, H);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, W, H);
        });
    }

    // ================== MAIN ANIMATION ==================
    function drawScene() {
        ctx.clearRect(0, 0, W, H);
        drawNebulae();
        drawLightBeams();
        drawStars();
    }

    function animate() {
        drawScene();
        requestAnimationFrame(animate);
    }

    function init() {
        resize();
        createStars();
        createNebulae();
        animate();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            createStars();
            createNebulae();
        }, 120);
    });

    requestAnimationFrame(init);
})();
