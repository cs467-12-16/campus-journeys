var map;

var rectangles = {};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {
            lat: 40.106483,
            lng: -88.2229657
        },
    });
}

var daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
var days = ['M', 'T', 'W', 'R', 'F'];

function showDay(value) {
    $('#currentDay').text(daysOfTheWeek[value-1]);
    getSuggested();
}

function parseData(data) {
    $('#schedule').empty();
    var places = {};
    for(var p in rectangles) {
        places[p] = 0;
    }
    for(var y in data) {
        if (y == $('#year').val()) {
            for (var s in data[y]) {
                if (s == $('#semester').val()) {
                    var classes = data[y][s];
                    for (var i = 0; i < classes.length; i++) {
                        c = classes[i];
                        $('#schedule').append('<li class="list-group-item">' + c.section + ' ' + c.number + '</li>');
                        var day = days[$('#day').val() - 1];
                        if (c.locations[day] !== undefined) {
                            for (var cl in c.locations[day]) {
                                var place = c.locations[day][cl].place;
                                if (place !== undefined)
                                    places[place] += 1 / c.locations[day].length;
                            }
                        }
                        console.log(places);
                    }
                    for (var t in places) {
                        rectangles[t].setOptions({
                            fillOpacity: places[t]
                        });
                    }
                }
            }
        }
    }
}

function getSuggested() {
    $.getJSON('data/weekly/' + $('#major').val() + '_weekly.json', function(data) {
        parseData(data);
    });
}

function initializeRectangles() {
    $.getJSON('data/locations.json', function(data) {
        for(var classroom in data) {
            rectangles[classroom] = new google.maps.Rectangle({
                strokeColor: '#0000FF',
                strokeOpacity: 0,
                strokeWeight: 0,
                fillColor: '#0000FF',
                fillOpacity: 0,
                map: map,
                bounds: {
                    north: data[classroom][0],
                    south: data[classroom][2],
                    east: data[classroom][1],
                    west: data[classroom][3]
                }
            });
        }
    });
}

$(document).ready(function() {
    showDay(1);
    initializeRectangles();
    getSuggested();
});