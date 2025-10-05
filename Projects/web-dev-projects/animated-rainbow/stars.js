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
        count: 3,
        sizeMin: 150,
        sizeMax: 300,
        detail: 6,
        speedFactor: 0.2,
        baseAlpha: 0.04,  // baseline dimness
        pulseStrength: 0.015, // how much it pulses
        colorPalette: [
            'rgba(173, 216, 230, ALPHA)',
            'rgba(238, 130, 238, ALPHA)',
            'rgba(255, 182, 193, ALPHA)',
            'rgba(144, 238, 144, ALPHA)',
            'rgba(255, 160, 122, ALPHA)',
            'rgba(255, 255, 224, ALPHA)'
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
                baseColor: cfgNebula.colorPalette[i % cfgNebula.colorPalette.length],
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
        const time = Date.now() * 0.0001; // slow pulse
        nebulae.forEach(n => {
            n.x += n.vx * cfgNebula.speedFactor;
            n.y += n.vy * cfgNebula.speedFactor;

            if (n.x - n.radius > W) n.x = -n.radius;
            if (n.x + n.radius < 0) n.x = W + n.radius;
            if (n.y - n.radius > H) n.y = -n.radius;
            if (n.y + n.radius < 0) n.y = H + n.radius;

            // pulse alpha
            const pulse = cfgNebula.baseAlpha + cfgNebula.pulseStrength * Math.sin(time + n.x * 0.01 + n.y * 0.01);

            n.shapes.forEach(s => {
                const px = n.x + s.offsetX * n.radius * 0.5;
                const py = n.y + s.offsetY * n.radius * 0.5;
                const pr = n.radius * s.scale;

                const col = n.baseColor.replace("ALPHA", pulse.toFixed(3));

                const gradient = ctx.createRadialGradient(px, py, pr * 0.05, px, py, pr);
                gradient.addColorStop(0, col);
                gradient.addColorStop(0.6, col.replace(/0\.\d+/, (pulse * 0.4).toFixed(3)));
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
            'rgba(255,255,255,0.025)',
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

    // ================== VIGNETTE ==================
    function drawVignette() {
        const vignette = ctx.createRadialGradient(W/2, H/2, Math.min(W, H) * 0.4, W/2, H/2, Math.max(W, H) * 0.7);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);
    }

    // ================== MAIN ANIMATION ==================
    function drawScene() {
        ctx.clearRect(0, 0, W, H);
        drawNebulae();
        drawLightBeams();
        drawStars();
        drawVignette();
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
