var start_coordinates, end_coordinates;
var amsterdam = new google.maps.LatLng(52.370216, 4.895168);

function initialize() {
	var mapOptions = {
		center: amsterdam,
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
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
		$(".geocomplete").trigger("geocode");
		// $(".geocomplete").bind("geocode:result", function(event, result){
// 				console.log(result);
// 			});
	});
});

function enableOrDisableFindButton() {
	if (start_coordinates && end_coordinates) {
		$("#submit").removeAttr("disabled");
	} else if (!$("#submit").is(":disabled")) {
		$("#submit").attr("disabled", "disabled");
	}
}