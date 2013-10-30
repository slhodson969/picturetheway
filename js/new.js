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

	var start_lat = GetURLParameter('start_lat');
	var start_lng = GetURLParameter('start_lng');
	var end_lat = GetURLParameter('end_lat');
	var end_lng = GetURLParameter('end_lng');

	$("#page2").css('display', 'none');
	$("#page3").css('display', 'none');


	if (start_lat && start_lng && end_lat && end_lng) {
		createHyperlapse(start_lat, start_lng, end_lat, end_lng);
	} else {
		enableOrDisableFindButton();

		$(".geocomplete").geocomplete({
			map: ".map_canvas",
		});

		$("#geocomplete_start").bind("geocode:result", function(event, result){
			start_coordinates = result.geometry;
			$(this).blur(function() {
				$("#geocomplete_start").val(result.formatted_address);
			});
			enableOrDisableFindButton();
		});

		$("#geocomplete_end").bind("geocode:result", function(event, result){
			end_coordinates = result.geometry;
			$(this).blur(function() {
				$("#geocomplete_end").val(result.formatted_address);
			});
			enableOrDisableFindButton();
		});

		$("#submit").click(function(){

			$("#page1").css('display', 'none');
			$("#page2").fadeIn();

			createHyperlapse(
				start_coordinates.location.lat(),
				start_coordinates.location.lng(),
				end_coordinates.location.lat(),
				end_coordinates.location.lng()
			);
			google.maps.event.trigger(map, 'resize');
			
		});
	}
});

function enableOrDisableFindButton() {
	if (start_coordinates && end_coordinates) {
		$("#submit").removeAttr("disabled");
	} else if (!$("#submit").is(":disabled")) {
		$("#submit").attr("disabled", "disabled");
	}
}

function createHyperlapse(start_lat, start_lng, end_lat, end_lng) {

	var elevation, distance_between_points, millis;

	// Distance Matrix
	var origin = new google.maps.LatLng(start_lat, start_lng);
	var destination = new google.maps.LatLng(end_lat, end_lng);

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

            hyperlapse = new Hyperlapse(document.getElementById('pano'), {
				zoom: 1,
				use_lookat: false,
				elevation: 50,
				max_points: 75,
				distance_between_points: 5,
				millis: 125,
				width: $(".big_wrapper").width(),
				height: $(".big_wrapper").height()
			});

			hyperlapse.onRouteProgress = function(e) {
				var p = Math.floor((hyperlapse.length()/160)*100);
				$('.progress .bar').width(p+'%');
				$('#bar_percent').html(p+'%');
			};

			hyperlapse.onRouteComplete = function(e) {
				hyperlapse.load();
			};

			hyperlapse.onLoadProgress = function(e) {
				var p = Math.floor((((e.position+1)/hyperlapse.length()) *100 ) / 2) + 50;
				$('.progress .bar').width(p+'%');
				$('#bar_percent').html(p+'%');
				
			};

			hyperlapse.onLoadComplete = function(e) {
				$('.progress .bar').width('0%');
				$('#bar_percent').html('');
				$("#page2").hide();
				$("#page3").fadeIn();
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

function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}

function createShareUrl()
{
	return encodeURIComponent(location.href + '?start_lat=' + start_coordinates.location.lat() + '&start_lng=' + start_coordinates.location.lng() + '&end_lat=' + end_coordinates.location.lat() + '&end_lng=' + end_coordinates.location.lng());
}
