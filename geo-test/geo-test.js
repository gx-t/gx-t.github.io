function GeoTest(canvas_id) {
    var cs = document.getElementById(canvas_id);
    var gps = {coords: {altitude: 0,speed: 0}};
    var compass = {alpha: 0};
    var ctx = cs.getContext("2d");

    keep_awake = async function() {
        if(!navigator.wakeLock)
            return;
        try {await navigator.wakeLock.request('screen');} catch (err) {console.log(err);}
    }

    on_orientation_change = function(e) {
        compass = e;
        draw();
    }

    init_compass = function() {
        if(!DeviceOrientationEvent.requestPermission) {
            window.addEventListener("deviceorientationabsolute", on_orientation_change);
            return;
        }

        DeviceOrientationEvent.requestPermission().then(function(resp) {
                if("granted" != resp) {
                alert("DeviceOrientationEvent.requestPermission - not granted");
                return;
                }
                window.addEventListener("deviceorientation", on_orientation_change);
                });
    }

    draw_compass = function(x, y, r, init_rot) {
        var alpha = Math.round(compass.alpha) % 360;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';
        ctx.save();
        ctx.translate(x, y);
        ctx.font = r / 4 + 'pt Calibri';
        r *= 0.75;
        ctx.fillText(alpha, 0, 0);

        ctx.rotate(compass.alpha / 180 * Math.PI + init_rot);
        ctx.lineWidth = 1;
        ctx.fillStyle = 'red';
        ctx.fillText("N", 0, -r);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'yellow';
        ctx.fillText("E", 0, -r);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'blue';
        ctx.fillText("S", 0, -r);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'yellow';
        ctx.fillText("W", 0, -r);
        ctx.rotate(Math.PI / 2);

        for(var i = 0; i < 36; i ++) {
            ctx.beginPath();
            ctx.moveTo(0, -r/1.2);
            ctx.lineTo(0, -r/1.3);
            ctx.stroke();
            ctx.rotate(Math.PI / 18);
        }
        ctx.restore();
    }

    draw_portrait = function() {
        ctx.font = cs.width * 0.125 + 'pt Calibri';
        ctx.fillText(Math.round(gps.coords.altitude), cs.width * 0.25, cs.width * 0.125); 
        ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.width * 0.75, cs.width * 0.125); 
        var r = cs.height * 0.15;
        draw_compass(cs.width - r, cs.height - r, r, 0);
    }

    draw_landscape = function() {
        ctx.font = cs.height * 0.125 + 'pt Calibri';
        ctx.fillText(Math.round(gps.coords.altitude), cs.height * 0.25, cs.height * 0.125); 
        ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.height * 0.25, cs.height * 0.325); 
        var r = cs.width * 0.15;
        draw_compass(cs.width - r, cs.height - r, r, -Math.PI / 2);
    }

    draw = function() {
        ctx.fillStyle = "#00FFFFFF";
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.clearRect(0, 0, cs.width, cs.height);
        if(cs.width > cs.height)
            return draw_landscape();
        draw_portrait();
    }

    update = function() { window.requestAnimationFrame(draw); }

    window.addEventListener("resize", function() {
        cs.width = window.innerWidth;
        cs.height = window.innerHeight;
        update();
    });

    document.addEventListener("visibilitychange", function() {
            if("visible" === document.visibilityState)
            keep_awake();
            });

    keep_awake();

    if(navigator.geolocation)
        navigator.geolocation.watchPosition(function(gg) {gps = gg; update();},function(error) {},{ enableHighAccuracy: true });
    cs.onclick = function() {
        init_compass();
        cs.onclick = null;
    }

    cs.width = window.innerWidth;
    cs.height = window.innerHeight;
    update();
}
