var map, hyperlapse;

$(document).ready(function() {
	var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var geocoder = new google.maps.Geocoder();
    var amsterdam = new google.maps.LatLng(52.370216, 4.895168);
	var mapOptions = {
	    zoom: 7,
	    center: amsterdam,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	$('#replay').click(function() {
		for (i=0; i < hyperlapse.length(); i++) {
			hyperlapse.prev();
		}
		hyperlapse.play();
	});

});



function create_hyperlapse() {

	var elevation, distance_between_points, millis;

	// Distance Matrix
	var origin = new google.maps.LatLng(start.geometry.location.lat(), start.geometry.location.lng());
	var destination = new google.maps.LatLng(end.geometry.location.lat(), end.geometry.location.lng());

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
    {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: true,
        unitSystem: google.maps.UnitSystem.METRIC
    }, callback);

    function callback(response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK) {
            var results = response.rows[0].elements;
            var element = results[0];
            var distance = element.distance.value;
            var max_points = distance/100;
        	var distance_between_points = distance/100000;

            hyperlapse = new Hyperlapse(document.getElementById('pano'), {
				zoom: 1,
				use_lookat: false,
				elevation: 50,
				max_points: max_points,
				distance_between_points: distance_between_points,
				millis: 100
			});

			hyperlapse.onRouteProgress = function(e) {
				var p = Math.floor((hyperlapse.length()/160)*100);
				$('.progress .bar').width(p+'%');
			};

			hyperlapse.onRouteComplete = function(e) {
				hyperlapse.load();
			};

			hyperlapse.onLoadProgress = function(e) {
				var p = (Math.floor( ((e.position+1) / hyperlapse.length() )*100) / 2) + 50;
				$('.progress .bar').width(p+'%');
			};

			hyperlapse.onLoadComplete = function(e) {
				$('.carousel').carousel('next');
				$('.progress .bar').width('0%');
				hyperlapse.play();
			};

			hyperlapse.onFrame = function(e) {
				if (e.position == hyperlapse.length() - 1) {
					hyperlapse.pause();
				}
			}

			hyperlapse.onError = function(e) {
				console.log(e);
			};
			
        }
    }

	// Google Maps API stuff here...
	var directions_service = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();

	var route = {
		request:{
			origin: new google.maps.LatLng(start.geometry.location.lat(), start.geometry.location.lng()),
			destination: new google.maps.LatLng(end.geometry.location.lat(), end.geometry.location.lng()),
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		}
	};

	directions_service.route(route.request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setMap(map);
			directionsDisplay.setDirections(response);
			hyperlapse.generate( {route:response} );
		} else {
			console.log(status);
		}
	});

}