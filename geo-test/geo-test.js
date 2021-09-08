function GeoTest() {
    var cs = document.createElement("canvas");
    var gps = {coords: {altitude: 0,speed: 0,latitude: 0,longitude: 0}};
    var dt = new Date();
    var compass = {alpha: 0};
    var ctx = cs.getContext("2d");

    main_menu = function() {
        var div = document.createElement("div");
        var timer = 0;

        div.innerHTML = (navigator.share ? "<a href='javascript:share();'>Share ...</a><br>" : "") + "<a href='javascript:save();'>Save</a><hr>";
        div.style.display = "none";
        document.body.appendChild(div);
        cs.onclick = function(e) {
            if(div.style.display == "block") {
                div.style.display = "none";
                clearTimeout(timer);
                return;
            }
            div.style = "position: absolute; left: " + e.x + "px; top: " + e.y + "px; display: block; background:#000000BA; font-size: 50px";
            console.log(e);
            timer = setTimeout(() => {div.style.display = "none"}, 3000);
        }

        share = function() {
            div.style.display = "none";
            clearTimeout(timer);
            navigator.share({
                title: 'Geolocation data',
                text: dt.toLocaleTimeString([], { hour12: false }) + "\n" +  Math.round(gps.coords.altitude) + "m\n" + Math.round(Math.round(gps.coords.speed * 3.6)) + "km/h\n",
                url: "https://www.openstreetmap.org/?mlat=" + gps.coords.latitude + "&mlon=" + gps.coords.longitude + "#map=17/" + gps.coords.latitude + "/" + gps.coords.longitude,
                });
        }

        save = function() {
            div.style.display = "none";
            clearTimeout(timer);
        }

    }

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

    draw_portrait = function() {
        ctx.font = cs.width * 0.125 + 'pt Calibri';
        ctx.fillText(Math.round(gps.coords.altitude), cs.width * 0.25, cs.width * 0.125); 
        ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.width * 0.75, cs.width * 0.125); 
        draw_coord_time(cs.width / 25, cs.height, cs.width * 0.05);
        var r = cs.height * 0.15;
        compass_draw_proc(cs.width - r - cs.width / 25, cs.height - r, r, 0);
    }

    draw_landscape = function() {
        ctx.font = cs.height * 0.125 + 'pt Calibri';
        ctx.fillText(Math.round(gps.coords.altitude), cs.height * 0.25, cs.height * 0.125); 
        ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.height * 0.25, cs.height * 0.325); 
        draw_coord_time(cs.width / 25, cs.height, cs.height * 0.05);
        var r = cs.width * 0.15;
        compass_draw_proc(cs.width - r - cs.width / 25, cs.height - r, r, compass.gamma > 0 ? 90 : 270);
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

