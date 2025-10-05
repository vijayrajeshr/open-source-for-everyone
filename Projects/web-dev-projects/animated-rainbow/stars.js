(() => {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const cfg = { count: 200, sizeMin:0.5, sizeMax:1.5 }; // 200 stars
    let stars = [];

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR,0,0,DPR,0,0);
    }

    function rand(min,max){ return Math.random()*(max-min)+min; }

    function createStars(){
        stars = [];
        for(let i=0;i<cfg.count;i++){
            stars.push({
                x: Math.random()*W,
                y: Math.random()*H,
                size: rand(cfg.sizeMin, cfg.sizeMax),
                alpha: rand(0.3, 1), 
                vx: rand(-0.1, 0.1), // slow movement
                vy: rand(-0.05, 0.05)
            });
        }
    }

    function drawStars(){
        ctx.clearRect(0,0,W,H);
        const time = Date.now();
        for(const s of stars){
            // move star
            s.x += s.vx;
            s.y += s.vy;

            // wrap around edges
            if(s.x > W) s.x = 0;
            if(s.x < 0) s.x = W;
            if(s.y > H) s.y = 0;
            if(s.y < 0) s.y = H;

            // subtle twinkle
            const alpha = s.alpha + 0.15 * Math.sin(time*0.002 + s.x + s.y);

            // glow effect
            ctx.shadowBlur = 16;
            ctx.shadowColor = 'white';

            ctx.fillStyle = `rgba(255,255,255,${Math.min(1,Math.max(0.1, alpha))})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
            ctx.fill();

            // reset shadow so it doesn't affect other canvas drawings
            ctx.shadowBlur = 0;
        }
    }

    function animate(){
        drawStars();
        requestAnimationFrame(animate);
    }

    function init(){ resize(); createStars(); animate(); }
    let resizeTimer;
    window.addEventListener('resize',()=>{
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(()=>{
            resize();
            createStars();
        }, 120);
    });
    requestAnimationFrame(init);
})();
