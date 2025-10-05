(() => {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    // Star configuration
    const starCfg = {
        layers: [
            { count: 500, sizeMin: 0.3, sizeMax: 0.8 },   // small stars
            { count: 100, sizeMin: 0.8, sizeMax: 1.5 },   // medium stars
            { count: 20, sizeMin: 1.5, sizeMax: 2 }       // large stars
        ]
    };

    let stars = [];
    let nebulaLayers = [];

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        createNebula();
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    // ---------- Stars ----------
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
        starCfg.layers.forEach(layer => {
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

    // ---------- Nebula ----------
    function createNebula() {
        nebulaLayers = [];
        const nebulaColors = [
            'rgba(180, 80, 200, 0.05)',
            'rgba(120, 200, 255, 0.04)',
            'rgba(255, 100, 150, 0.03)',
            'rgba(150, 255, 180, 0.02)'
        ];

        nebulaColors.forEach(color => {
            const blobs = [];
            const blobCount = rand(6, 10);
            for (let i = 0; i < blobCount; i++) {
                blobs.push({
                    x: rand(0, W),
                    y: rand(0, H),
                    radius: rand(W*0.1, W*0.25),
                    offsetX: rand(-0.2, 0.2),
                    offsetY: rand(-0.1, 0.1),
                    angle: rand(0, Math.PI*2)
                });
            }
            nebulaLayers.push({ color, blobs });
        });
    }

    function drawNebula() {
        nebulaLayers.forEach(layer => {
            ctx.fillStyle = layer.color;
            layer.blobs.forEach(blob => {
                const grad = ctx.createRadialGradient(
                    blob.x + Math.sin(blob.angle) * blob.offsetX * blob.radius,
                    blob.y + Math.sin(blob.angle) * blob.offsetY * blob.radius,
                    blob.radius*0.3,
                    blob.x,
                    blob.y,
                    blob.radius
                );
                grad.addColorStop(0, layer.color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI*2);
                ctx.fill();

                blob.angle += 0.001; // subtle movement
            });
        });
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        drawNebula();
        drawStars();
        requestAnimationFrame(animate);
    }

    function init() { 
        resize(); 
        createStars(); 
        animate(); 
    }

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
