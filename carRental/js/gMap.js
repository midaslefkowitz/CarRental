$(document).on('pagebeforeshow','#distance',initialize);

var directionsDisplay;
var geocoder;
var map;
var lat;
var	lon;
var	latlng;
var from;
var to;
var distance;
var address;
var directionsService = new google.maps.DirectionsService();
var bounds = new google.maps.LatLngBounds();
var service = new google.maps.DistanceMatrixService()
var worker;

function initialize() {
	/* Tests if geolocation is supported. 
	 * If so calls showposition function.
	 * Else tells user that geolocation isn't supported */
	if (navigator.geolocation) {
		document.getElementById('to').value ='';
		navigator.geolocation.getCurrentPosition(showPosition,showError);
	}
	else {
		$('#output').text = "Geolocation is not supported by this browser.";
	}
}

function showError(error) {
	/* Geolocation error type */
	switch(error.code) {
		case error.PERMISSION_DENIED:
			$('#output').text = "User denied the request for Geolocation."
			break;
		case error.POSITION_UNAVAILABLE:
			$('#output').text = "Location information is unavailable."
			break;
		case error.TIMEOUT:
			$('#output').text = "The request to get user location timed out."
			break;
		case error.UNKNOWN_ERROR:
			$('#output').text = "An unknown error occurred."
			break;
	}
} 

function showPosition(position) {
	/* creates a map with user location as a marker 
	 * and places user coordinates in from field */
	lat=position.coords.latitude;
	lon=position.coords.longitude;
	latlng=new google.maps.LatLng(lat, lon)
	
	var myOptions={
		center:latlng,zoom:12,
		mapTypeId:google.maps.MapTypeId.ROADMAP,
		mapTypeControl:true,
		navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
	};
	map=new google.maps.Map(document.getElementById("map-canvas"),myOptions);
	var marker=new google.maps.Marker({position:latlng,map:map,title:"You are here!"});
	$('#map-canvas').removeClass('hidden');
	
	// if possible converts user coords into address and places address in 'from' field
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				address = results[0].formatted_address;
				document.getElementById('from').value = address;
			}
		}
		else {
			address = lat + ', ' + lon;
			document.getElementById('from').value = address;
		}
	});
}

function routeAndDist() {
	/* Wrapper function for calculating route, distance and cost 
	 * Called with user click on submit button */
	$('#cost').text("Calculating price please wait").append("<span id='sound'></span>");
	$('#sound').html("<audio id='music' autoplay='autoplay' loop='loop'>"
	+ "<source src='sounds/ElevatorMusic.mp3'/>"
	+ "<source src='sounds/ElevatorMusic.ogg' />"
	+ "</audio>");	
	from = document.getElementById('from').value;
	to = document.getElementById('to').value;
	calcRoute();
	calcDist();
}

function calcRoute() {
	/* Calculates route and displays it on a map */
	directionsDisplay = new google.maps.DirectionsRenderer();
	var mapOptions = {
		center: new google.maps.LatLng(31.7963186, 35.175359),
		zoom: 7
	};
	map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
	directionsDisplay.setMap(map);
	var request = {
		origin:from,
		destination:to,
		travelMode: google.maps.TravelMode.DRIVING
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
		}
	});
}

function calcDist() {
	/* Gets distance between two points */
	service.getDistanceMatrix( {
		origins: [from],
		destinations: [to],
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem: google.maps.UnitSystem.METRIC,
		avoidHighways: false,
		avoidTolls: false
	}, callback);
}

function clearMap() {
	/* Returns the page to it's status when first loaded
	 * Called with user click on clear button */
	document.getElementById('from').value = '';
	document.getElementById('to').value ='';
	$('#output').empty();
	$('#cost').empty();
	worker.terminate();
	initialize();
}

function callback(response, status) {
	if (status != google.maps.DistanceMatrixStatus.OK) {
		var errorText = 'Error was: ' + status;
		$('#output').text = errorText;
	} else {
		var origins = response.originAddresses;
		var destinations = response.destinationAddresses;
		var result = response.rows[0].elements;
		var element = result[0];
		distance = element.distance.text;
		
		$('#output').text('Distance from: ' 
		+ from + ' to: ' + to + ' is: ' + distance);
		
		//localStorage.setItem("distance", distance);
		startWorker();
	}
}

function startWorker() {
	distanceF = parseFloat(distance);
	if(distanceF>0) { //only calculate cost if able to get a distance
		var selectedCar = JSON.parse(localStorage.getItem('selectedCar'));
		var gear = selectedCar.gear;
		if(typeof(Worker)!=="undefined") {
			if(typeof(worker)=="undefined") {
				worker=new Worker("js/calcCost.js");
			}
			worker.postMessage({'distance': distanceF, 'gear': gear});
			worker.onmessage = function (event) {
				var total = Number((parseFloat(event.data)).toFixed(2));
				$('#cost').text('Your total cost is: ' + total + ' NIS');
				$('#cost').append("<button id='rentCar' class='ui-btn ui-corner-all' onclick='rentCar()'>Confirm Price and Rent Car</button>")
			};
		} else {
			$('#cost').text("Sorry, your browser does not support Web Workers...");
		}
	}
}