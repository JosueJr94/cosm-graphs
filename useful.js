function getImageUrl(klass) {
    var urls = {
        'temperature':'https://api.cosm.com/v2/feeds/89487/datastreams/temperature.png?width=1000&height=180&colour=%23f15a24&duration=9hours&title=Temperature&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=15&max=25&timezone=Tokyo',
        'humidity':'https://api.cosm.com/v2/feeds/89487/datastreams/humidity.png?width=1000&height=180&colour=%23f15a24&duration=9hours&title=Humidity&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=30&max=60&timezone=Tokyo',
        'pressure':'https://api.cosm.com/v2/feeds/89487/datastreams/pressure.png?width=1000&height=180&colour=%23f15a24&duration=9hours&title=Pressure&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=99000&max=104000&timezone=Tokyo',
        'tremor':'https://api.cosm.com/v2/feeds/89487/datastreams/bed-tremor.png?width=1000&height=180&colour=%23f15a24&duration=9hours&title=Tremor&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=0&max=0.25&timezone=Tokyo',
        'sound-level':'https://api.cosm.com/v2/feeds/89487/datastreams/bed-sound-level.png?width=1000&height=180&colour=%23f15a24&duration=9hours&title=Sound%20Level&stroke_size=1&show_axis_labels=true&detailed_grid=true&scale=manual&min=23&max=33&timezone=Tokyo',
    };
    var timestamp = new Date().getTime();
    return urls[klass] + '&dummy=' + timestamp;
}

function updateGraphs() {
    $('#graphs img').each(function() {
        var $self = $(this);
        $self.attr('src', getImageUrl($self.attr('class')));
    });
    console.log('updated');
}

$(function() {
    // Draw Graphs
    updateGraphs();
    setInterval(updateGraphs, 60 * 1000);
    // Toggle Ruler
    $(window).keydown(function(e) {
        if (e.keyCode == 82) {
            $('#ruler').toggle();
        }
    });
    // Draw Ruler
    $('body').mousemove(function(e) {
        var offset = $('#graphs').offset();
        $('#ruler').css('left', e.pageX - offset.left);
    });
});
