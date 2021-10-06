function GeoTest() {
    var cs = document.createElement("canvas");
    var gps = {coords: {altitude: 0,speed: 0,latitude: 0,longitude: 0,heading: 0}};
    var dt = new Date();
    var ctx = cs.getContext("2d");

    var empty_proc = function() {};
    var draw_layer_0 = empty_proc;
    var draw_layer_1 = empty_proc;

    main_screen = function() {
        draw_coord_time = function(x, y, s) {
            ctx.save();
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.font = s + 'pt Calibri';
            ctx.fillStyle = '#FFFFFFFF';
            ctx.fillText('G: ' + dt.toLocaleTimeString([], { hour12: false }), x, y); 
            ctx.fillStyle = '#BBBBBBBB';
            y -= 2 * s;
            ctx.fillText(gps.coords.latitude, x, y); 
            y -= 1.5 * s;
            ctx.fillText(gps.coords.longitude, x, y); 
            ctx.restore();
        }

        draw_layer_0 = function() {
            ctx.fillStyle = "#00FFFFFF";
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.clearRect(0, 0, cs.width, cs.height);
            var unit = Math.min(cs.width, cs.height);
            ctx.font = unit * 0.125 + 'pt Calibri';
            ctx.fillText(Math.round(gps.coords.altitude), cs.width / 25, 0); 
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(3.6 * gps.coords.speed), cs.width - cs.width / 25, 0); 
            draw_coord_time(cs.width - cs.width / 25, cs.height, unit * 0.05);
        }

        main_menu = function() {
            const items = [
            {t:"Պահպանել", f:function() {}},
            {t:"Փոխանցել...", f:function(geo_data) {navigator.share && navigator.share(geo_data);}},
            {t:"Քարտեզ...", f:function(geo_data) {window.location = geo_data.url;}}
            ];
            cs.onclick = function(e) {
                var geo_data = { title: 'Geolocation data', text: dt.toLocaleTimeString([], { hour12: false }) + " ( " + dt.toLocaleDateString() + " )\n" +  Math.round(gps.coords.altitude) + " մ\n" + Math.round(Math.round(gps.coords.speed * 3.6)) + " կմ/ժ\n" + Math.round(gps.coords.heading) + " °\n", url: "https://www.google.com/maps/place/" + gps.coords.latitude + "," + gps.coords.longitude + "/@" + gps.coords.latitude + "," + gps.coords.longitude };
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
                ctx.textAlign = 'center';
                ctx.font = font_height + 'pt Calibri';
                for(var i = 0, y = line_height; i < items.length; i ++, y += line_height) {
                    ctx.fillText(items[i].t, cs.width / 2, y);
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(cs.width, y);
                    ctx.closePath();
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
        main_menu();
    }

    main_screen();

    keep_awake = async function() {
        if(!navigator.wakeLock)
            return;
        try {await navigator.wakeLock.request('screen');} catch (err) {console.log(err);}
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

    document.body.appendChild(cs);
    cs.update = update;
    return cs;
}

