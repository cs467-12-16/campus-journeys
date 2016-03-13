function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {
            lat: 40.106483,
            lng: -88.2229657
        },
    });
}

var daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function showDay(value) {
    $('#currentDay').text(daysOfTheWeek[value-1]);
}

function parseData(data) {
    $('#schedule').empty();
    for(var y in data) {
        if (y == $('#year').val()) {
            for (var s in data[y]) {
                if (s == $('#semester').val()) {
                    var classes = data[y][s];
                    for (var i = 0; i < classes.length; i++) {
                        c = classes[i];
                        console.log(c);
                        $('#schedule').append('<li class="list-group-item">' + c.section + ' ' + c.number + '</li>');
                    }
                }
            }
        }
    }
}

function getSuggested() {
    $.getJSON('data/suggested/' + $('#major').val() + '_suggested.json', function(data) {
        parseData(data);
    });
}

$(document).ready(function() {
    showDay(3);
    getSuggested();
});