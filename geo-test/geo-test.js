function GeoTest() {
    var cs = document.createElement("canvas");
    var gps = {coords: {altitude: 0,speed: 0}};
    var dt = new Date();
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

    draw_compass = function(x, y, r, init_rot) {
        var alpha = Math.round(compass.alpha + init_rot) % 360;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';
        ctx.save();
        ctx.translate(x, y);
        ctx.font = r / 4 + 'pt Calibri';
        r *= 0.75;
        ctx.fillText(alpha, 0, 0);

        ctx.rotate((compass.alpha + init_rot)/ 180 * Math.PI);
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

    var compass_draw_proc = draw_compass;

    flash_compass = function() {
        if(compass_draw_proc == draw_compass) {
            compass_draw_proc = function(x, y, r) {
                ctx.clearRect(x - r, y - r,  2 * r,  2 * r);
            }
        }
        else{
            compass_draw_proc = draw_compass;
        }
        update();
    }

    draw_time = function(x, y, s) {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.font = s + 'pt Calibri';
        ctx.fillStyle = '#BBBBBBBB';
        ctx.fillText('sat: ' + dt.toLocaleTimeString([], { hour12: false }), x, y); 
        ctx.restore();
    }

    draw_portrait = function() {
        ctx.font = cs.width * 0.125 + 'pt Calibri';
        ctx.fillText(Math.round(gps.coords.altitude), cs.width * 0.25, cs.width * 0.125); 
        ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.width * 0.75, cs.width * 0.125); 
        draw_time(0, cs.height, cs.width * 0.05);
        var r = cs.height * 0.15;
        compass_draw_proc(cs.width - r, cs.height - r, r, 0);
    }

    draw_landscape = function() {
        ctx.font = cs.height * 0.125 + 'pt Calibri';
        ctx.fillText(Math.round(gps.coords.altitude), cs.height * 0.25, cs.height * 0.125); 
        ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.height * 0.25, cs.height * 0.325); 
        draw_time(0, cs.height, cs.height * 0.05);
        var r = cs.width * 0.15;
        compass_draw_proc(cs.width - r, cs.height - r, r, compass.gamma > 0 ? 90 : 270);
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
        navigator.geolocation.watchPosition(function(gg) {gps = gg; dt.setTime(gg.timestamp); update();},function(error) {},{ enableHighAccuracy: true });

    if(window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
        var it = setInterval(flash_compass, 250);
        cs.onclick = function() {
            DeviceOrientationEvent.requestPermission().then(function(resp) {
                    if("granted" != resp) {
                    alert("DeviceOrientationEvent.requestPermission - not granted");
                    return;
                    }
                    clearInterval(it);
                    compass_draw_proc = draw_compass;
                    window.addEventListener("deviceorientation", on_orientation_change);
                    update();
                    });
            cs.onclick = null;
        }
    }
    else {
        window.addEventListener("deviceorientationabsolute", on_orientation_change);
    }
    document.body.appendChild(cs);
    cs.update = update;
    return cs;
}

