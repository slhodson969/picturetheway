var start_coordinates, end_coordinates;
var amsterdam = new google.maps.LatLng(52.370216, 4.895168);
var map;

function initialize() {
	var mapOptions = {
		center: amsterdam,
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);


$(function(){
	
	enableOrDisableFindButton();

	$(".geocomplete").geocomplete({
		map: ".map_canvas",
		//details: "form",
		//types: ["geocode", "establishment"]
	});

	$("#geocomplete_start").bind("geocode:result", function(event, result){
		start_coordinates = result.geometry;
		console.log("START");
		console.log(result);
		console.log(result.geometry.location.lat());
		console.log(result.geometry.location.lng());
		console.log(result.formatted_address);
		console.log("-----------------------------");

		$(this).blur(function() {
			$("#geocomplete_start").val(result.formatted_address);
		});

		enableOrDisableFindButton();

	});

	$("#geocomplete_end").bind("geocode:result", function(event, result){
		end_coordinates = result.geometry;
		console.log("END")
		console.log(result);
		console.log(result.geometry.location.lat());
		console.log(result.geometry.location.lng());
		console.log(result.formatted_address);
		console.log("-----------------------------");

		$(this).blur(function() {
			$("#geocomplete_end").val(result.formatted_address);
		});

		enableOrDisableFindButton();
		
	});

	$("#submit").click(function(){
		createHyperlapse();
		google.maps.event.trigger(map, 'resize');
	});
});

function enableOrDisableFindButton() {
	if (start_coordinates && end_coordinates) {
		$("#submit").removeAttr("disabled");
	} else if (!$("#submit").is(":disabled")) {
		$("#submit").attr("disabled", "disabled");
	}
}

function createHyperlapse() {

	var elevation, distance_between_points, millis;

	// Distance Matrix
	var origin = new google.maps.LatLng(start_coordinates.location.lat(), start_coordinates.location.lng());
	var destination = new google.maps.LatLng(end_coordinates.location.lat(), end_coordinates.location.lng());

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
			origin: origin,
			destination: destination,
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