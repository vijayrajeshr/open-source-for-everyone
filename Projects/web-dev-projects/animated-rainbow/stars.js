(() => {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const cfg = { count: 200, sizeMin:0.5, sizeMax:1.5 };
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
                alpha: rand(0.08, 0.95),
                alphaChange: rand(0.002,0.008)
            });
        }
    }

    function drawStars(){
        ctx.clearRect(0,0,W,H);
        for(const s of stars){
            s.alpha += s.alphaChange * (Math.random()<0.5?-1:1);
            if(s.alpha < 0.08) s.alpha = 0.08;
            if(s.alpha > 0.95) s.alpha = 0.95;
            ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
            ctx.fill();
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
