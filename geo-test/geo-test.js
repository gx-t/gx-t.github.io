function GeoTest() {
    var cs = document.createElement("canvas");
    var gps = {coords: {altitude: 0,speed: 0,latitude: 0,longitude: 0,heading: 0}};
    var dt = new Date();
    var compass = {alpha: 0};
    var ctx = cs.getContext("2d");

    var empty_proc = function() {};
    var draw_layer_0 = empty_proc;
    var draw_layer_1 = empty_proc;

    main_menu = function() {
        const items = [
            {t:"Պահպանել", f:function() {}},
            {t:"Փոխանցել...", f:function(geo_data) {navigator.share && navigator.share(geo_data);}},
            {t:"Քարտեզ...", f:function(geo_data) {window.location = geo_data.url;}}
            ];
        cs.onclick = function(e) {
            var geo_data = {
                title: 'Geolocation data',
                text: dt.toLocaleTimeString([], { hour12: false }) + " ( " + dt.toLocaleDateString() + " )\n" +  Math.round(gps.coords.altitude) + " մ\n" + Math.round(Math.round(gps.coords.speed * 3.6)) + " կմ/ժ\n" + Math.round(gps.coords.heading) + " °\n",
                url: "https://www.openstreetmap.org/?mlat=" + gps.coords.latitude + "&mlon=" + gps.coords.longitude + "#map=17/" + gps.coords.latitude + "/" + gps.coords.longitude,
                };

            var line_height = cs.height / items.length;
            var i;
            for(i = 0, y = line_height; i < items.length; i ++, y += line_height) {
                if(e.clientY < y)
                    return items[i].f(geo_data);
            }
        }

        draw_layer_1 = function() {
            var line_height = cs.height / items.length;
            var font_height = Math.min(cs.width, cs.height) / items.length / 4;
            ctx.save();
            ctx.fillStyle = "#FFFF0040";
            ctx.strokeStyle = '#FFFFFF40';
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'left';
            ctx.font = font_height + 'pt Calibri';
            for(var i = 0, x = 0, y = line_height; i < items.length; i ++, x += cs.width / 4, y += line_height) {
                if(x + ctx.measureText(items[i]).width > cs.width)
                    x = 0;
                ctx.fillText(items[i].t, x, y);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(cs.width, y);
                ctx.stroke();
            }
            ctx.restore();
        }

    }

    keep_awake = async function() {
        if(!navigator.wakeLock)
            return;
        try {await navigator.wakeLock.request('screen');} catch (err) {console.log(err);}
    }

    on_orientation_change = function(e) {
        compass = e;
        update();
    }

    draw_compass = function(x, y, r, init_rot) {
        var alpha = Math.round(compass.alpha + init_rot) % 360;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';
        ctx.save();
        ctx.translate(x, y);
        ctx.font = r / 4 + 'pt Calibri';
        ctx.textAlign = 'center';
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

    draw_coord_time = function(x, y, s) {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.font = s + 'pt Calibri';
        ctx.fillStyle = '#BBBBBBBB';
        ctx.fillText('G: ' + dt.toLocaleTimeString([], { hour12: false }), x, y); 
        y -= 3 * s;
        ctx.fillText(gps.coords.latitude, x, y); 
        y -= 1.5 * s;
        ctx.fillText(gps.coords.longitude, x, y); 
        ctx.restore();
    }

    draw_layer_0 = function() {
        ctx.fillStyle = "#00FFFFFF";
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.clearRect(0, 0, cs.width, cs.height);
        if(cs.width > cs.height) {
            ctx.font = cs.height * 0.125 + 'pt Calibri';
            ctx.fillText(Math.round(gps.coords.altitude), cs.width / 25, cs.height * 0.125); 
            ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.width / 25, cs.height * 0.325); 
            draw_coord_time(cs.width / 25, cs.height, cs.height * 0.05);
            var r = cs.width * 0.15;
            compass_draw_proc(cs.width - r, cs.height - r, r, compass.gamma > 0 ? 90 : 270);
            return;
        }
        ctx.font = cs.width * 0.125 + 'pt Calibri';
        ctx.fillText(Math.round(gps.coords.altitude), cs.width / 25, cs.width * 0.125); 
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.width - cs.width / 25, cs.width * 0.125); 
        draw_coord_time(cs.width / 25, cs.height - cs.height / 16, cs.width * 0.05);
        var r = cs.height * 0.15;
        compass_draw_proc(cs.width - r, cs.height - r, r, 0);
    }

    update = function() { window.requestAnimationFrame(function() { draw_layer_0(); draw_layer_1(); }); }

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
                    }
                    clearInterval(it);
                    compass_draw_proc = draw_compass;
                    window.addEventListener("deviceorientation", on_orientation_change);
                    update();
                    });
            main_menu();
        }
    }
    else {
        window.addEventListener("deviceorientationabsolute", on_orientation_change);
        main_menu();
    }
    document.body.appendChild(cs);
    cs.update = update;
    return cs;
}

