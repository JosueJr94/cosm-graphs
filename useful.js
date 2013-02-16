function getImagePath(klass) {
    var duration = $('#duration').val();

    var urls = {
        'temperature':'/v2/feeds/89487/datastreams/temperature.png?width=1000&height=180&colour=%23ff0000&duration=' + duration + '&title=Temperature&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=15&max=25&timezone=Tokyo',
        'humidity':'/v2/feeds/89487/datastreams/humidity.png?width=1000&height=180&colour=%230000ff&duration=' + duration + '&title=Humidity&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=30&max=60&timezone=Tokyo',
        'pressure':'/v2/feeds/89487/datastreams/pressure.png?width=1000&height=180&colour=%2300ff00&duration=' + duration + '&title=Pressure&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=99000&max=104000&timezone=Tokyo',
        'tremor':'/v2/feeds/89487/datastreams/bed-tremor.png?width=1000&height=180&colour=%23ff0000&duration=' + duration + '&title=Tremor&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=0.0&max=0.30&timezone=Tokyo',
        'sound-level':'/v2/feeds/89487/datastreams/bed-sound-level.png?width=1000&height=180&colour=%230000ff&duration=' + duration + '&title=Sound%20Level&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=23&max=33&timezone=Tokyo',
    };
    var timestamp = new Date().getTime();
    return urls[klass] + '&dummy=' + timestamp;
}

function getImageUrl(klass) {
    return 'https://api.cosm.com' + getImagePath(klass);
}

function loadImage(klass) {
    var dfd = $.Deferred();

    $.ajax({
        type: 'GET',
        url: 'http://kjunurl.appspot.com/imgview',
        dataType: 'jsonp',
        jsonp: 'callback',
        data: {
            host: 'api.cosm.com',
            path: getImagePath(klass),
        },
    }).done(function(data) {
        var image = new Image();
        image.src = data.image;
        image.onload = function() {
            dfd.resolve(image);
        };
    });

    return dfd;
}

function updateGraphs(canvas, ctx, tmp_canvas, ctx2) {
    var room_graphs = document.getElementById('room-graphs');
    var bed_graphs = document.getElementById('bed-graphs');

    var tmp_canvas = document.getElementById('tmp-canvas');
    var ctx2 = tmp_canvas.getContext('2d');

    var clear = function(canvas) {
        var ctx = canvas.getContext('2d');
        if (!ctx)
            throw 'failed to get 2d context';

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    var draw = function(canvas, image, x, y) {
        var ctx = canvas.getContext('2d');
        if (!(ctx && ctx2))
            throw 'failed to get 2d context';

        ctx2.drawImage(image, x, y);
        var imageData = ctx2.getImageData(0, 0, tmp_canvas.width, tmp_canvas.height);
        var data = imageData.data;
        var len = tmp_canvas.width * tmp_canvas.height * 4;
        for (var i = 0; i < len; i += 4) {
            var r = data[i+0];
            var g = data[i+1];
            var b = data[i+2];
            if (r == 255 && g == 255 && b == 255) {
                data[i+3] = 0;
            } else {
                data[i+3] = 127;
            }
        }
        ctx2.putImageData(imageData, 0, 0);

        var sx = 0;
        var sy = 0;
        var sw = tmp_canvas.width + x;
        var sh = tmp_canvas.height + y;
        var dx = 0;
        var dy = 0;
        var dw = canvas.width;
        var dh = canvas.height;
        ctx.drawImage(tmp_canvas, sx, sy, sw, sh, dx, dy, dw, dh);
    };

    $('img.graph').each(function() {
        var $img = $(this);
        var src = getImageUrl($img.attr('id'));
        $img.attr('src', src);
    });

    $.when(
         loadImage('temperature'),
         loadImage('humidity'),
         loadImage('pressure')
    ).done(function(temperature, humidity, pressure) {
        clear(room_graphs);
        draw(room_graphs, pressure, -32, 0);
        draw(room_graphs, humidity, 0, 0);
        draw(room_graphs, temperature, 0, 0);
    });

    $.when(
         loadImage('tremor'),
         loadImage('sound-level')
    ).done(function(tremor, sound_level) {
        clear(bed_graphs);
        draw(bed_graphs, tremor, -10, 0);
        draw(bed_graphs, sound_level, 0, 0);
    });
}

$(function() {
    $('#duration').on('change', function() {
        updateGraphs();
    });

    updateGraphs();
    setInterval(updateGraphs, 60 * 1000);
});
