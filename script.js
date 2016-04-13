var map;
var userMap;
var binnedData;
var allMajors;
var userLocations;

var rectangles = {};

var daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var days = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];

function showDay(value) {
  $('#currentDay').text(daysOfTheWeek[value]);
  getSuggested();
}

function showDayUser(value) {
  $('#currentDayUser').text(daysOfTheWeek[value]);
  updatePoints();
}

function showTimeUser(value) {
  var hour = Math.floor(value / 2) % 12;
  if (hour === 0)
    hour = 12;
  var minute = value % 2 === 1 ? "30" : "00";
  var ampm = value >= 24 ? "pm" : "am";
  $('#currentTimeUser').text(hour + ":" + minute + " " + ampm);
  updatePoints();
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
            var day = days[$('#day').val()];
            if (c.locations !== undefined && c.locations[day] !== undefined) {
              for (var cl in c.locations[day]) {
                var place = c.locations[day][cl].place;
                if (place !== undefined)
                  places[place] += 1 / c.locations[day].length;
              }
            }
          }
          for (var t in places) {
            if (rectangles[t]) {
              rectangles[t].setOptions({
                fillOpacity: places[t]
              });
            }
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
    getSuggested();
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: {
      lat: 40.106483,
      lng: -88.2229657
    },
  });
  initializeRectangles();
  initMapActual();
}

$(document).ready(function() {
  showDay(1);
  showDayUser(0);
  //showTimeUser(0);
  showSuggested();
  initializeActual();

  $('#year').change(updatePoints);
  $('#semester').change(updatePoints);

  $('#user-major').change(updatePoints);
  $('#user-week').change(updatePoints);
  //$('#user-day').change(updatePoints);
});

function showSuggested() {
  $('#tabs a:first').tab('show');
  $('#actual').removeClass('inline-block').addClass('hide');
  $('#suggested').removeClass('hide').addClass('block');
  $('#user-major-select').removeClass('inline-block').addClass('hide');
  $('#user-week-select').removeClass('inline-block').addClass('hide');
  $('#user-day-select').removeClass('inline-block').addClass('hide');
  $('#suggested-major-select').removeClass('hide').addClass('inline-block');
  $('#suggested-week-select').removeClass('hide').addClass('inline-block');
  initializeRectangles();
}

function showActual() {
  $('#tabs a:last').tab('show');
  $('#suggested').removeClass('block').addClass('hide');
  $('#actual').removeClass('hide').addClass('inline-block');
  $('#suggested-major-select').removeClass('inline-block').addClass('hide');
  $('#suggested-week-select').removeClass('inline-block').addClass('hide');
  $('#user-major-select').removeClass('hide').addClass('inline-block');
  $('#user-week-select').removeClass('hide').addClass('inline-block');
  $('#user-day-select').removeClass('hide').addClass('inline-block');
  initMapActual();
}

var userDataPoints = [];

function initMapActual() {
  userMap = new google.maps.Map(document.getElementById('user-map'), {
    zoom: 15,
    center: {
      lat: 40.106483,
      lng: -88.2229657
    },
  });
  initializeActual();
}

function initializeActual() {
  $.getJSON('./data/glh_parsed/merged_user_data_binned_limit_2000.json', function(data) {
    binnedData = data;
    var year = $('#year').val();
    var semester = $('#semester').val();
    var major = $('#major').val();
    $.getJSON('./data/cs467group12map-export-v2.json', function(d) {
      for (var id in d.data) {
        if (d.data[id].type === 'user' && d.data[id].locations !== 'undefined') {
          d.data[id].id = id;
          data.push(d.data[id]);
        }
      }
      setUserMajors(data, getUserDataByMajor);
    });
  });
  $.getJSON('./data/newlocations.json', function(locs) {
    userLocations = locs.userlocations;
  });
}

function getUserDataByMajor(data, major, callback) {
  data = data.filter(function(person) {
    return person && (major === person.major);
  });
  callback(data);
}

// returns between 0 and 6 the day of the week - 0 = Sunday, 6 = Saturday - corresponds with the arrays above
function getDayOfWeek(timestamp) {
  var date = new Date(parseFloat(timestamp));
  return date.getDay();
}

// returns between 0 and 47 the half hour we are referring to - corresponds with the time slider
function getTime(timestamp) {
  var date = new Date(parseFloat(timestamp));
  var hour = date.getHours(); // between 0 and 23
  var minute = date.getMinutes(); // between 0 and 59
  var isA30 = minute >= 30 ? true : false;
  var timeIndex = hour * 2;
  if (isA30) {
    timeIndex += 1;
  }
  return timeIndex;
}

function updatePoints() {
  if (binnedData) getUserDataByMajor(binnedData, $('#user-major').val(), displayActual);
  else {
    initializeActual();
  }
}

var heatMap;

function displayActual(data) {
  var bin = getBinFromDropdowns();

  while(userDataPoints[0]) {
    userDataPoints.pop()
  }

  data.forEach(function(user, index) {
    // using a smaller subset of data because otherwise chrome crashes
    if (user.type === 'google') {
      user.semesterBins[bin].slice(0, 2000).forEach(function(point) {
        var day = getDayOfWeek(point.timestamp);
        if (parseInt($('#user-week').val()) === day) {
          var loc = {
            lat: point.lat,
            lng: point.lon
          };

          userDataPoints.push(new google.maps.LatLng(loc.lat, loc.lng))
        }
      });
    } else if (user.type === 'user' && user.locations !== 'undefined') {
      for (var id in user.locations) {
        var day = new Date(user.locations[id].start._i).getDay();
        if (day === parseInt($('#user-week').val())) {
          var loc = {
            lat: userLocations[user.id][user.locations[id].location].lat,
            lng: userLocations[user.id][user.locations[id].location].lon
          };

          userDataPoints.push(new google.maps.LatLng(loc.lat, loc.lng))
        }
      }
    }

    // clear old heatmap
    if (heatMap) heatMap.setMap(null)

    heatMap = new google.maps.visualization.HeatmapLayer({
      data: userDataPoints,
      map: userMap,
      fillOpacity: 0.5
    })

  });
}


function setUserMajors(data, callback) {
  var majors = data.map(function(user) {
    if (user) return user.major;
    else return null;
  });
  var $majorSelect = $('#user-major');
  $majorSelect.empty();
  majors = removeDuplicates(majors);

  allMajors = majors;

  majors.forEach(function(major) {
    if (major) {
      var $option = '<option value="' + major + '">' + major + '</option>';
      $majorSelect.append($option);
    }
  });
  callback(data, $majorSelect.val(), displayActual);
}

function removeDuplicates(array) {
  var seen = {};
  return array.filter(function(element) {
    return seen.hasOwnProperty(element) ? false : (seen[element] = true);
  });
}

function getBinFromDropdowns() {
  var yearVal = $('#year').val();
  var semesterVal = ($('#semester').val() === 'F') ? 0 : 1;
  var bin = yearVal * 2 + semesterVal - 2;
  return bin;
}
