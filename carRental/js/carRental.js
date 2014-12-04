$(document).ready(function() {
	/*appends copyright info including current year to the footer*/
	var year = new Date().getFullYear();
	$('.copyright').each(function(){
		$(this).find('h5').append('&copy; '+year+'. All rights reserved to Yitz\'s Car Rental&trade;')
	});
});

$(document).on('pagebeforeshow','#login',loadLoginForm); 
$(document).on('pagebeforeshow', '#cars', loadCars); // 
$(document).on('click', '.carWrapper', function() {  // adds click event to list of available cars 
	if (localStorage.isRegistered) { // if registered adds clicked car to 'selectedCar' in localstorage
		var selectedId = $(this).attr('id');
		var cars = JSON.parse(localStorage.getItem('cars'));
		for (var i=0, numCars = cars.length; i<numCars; i++) {
			if (cars[i].id == selectedId) {
				localStorage.setItem('selectedCar', JSON.stringify(cars[i]));
				$( ":mobile-pagecontainer" ).pagecontainer("change", "#distance", { transition: "slide"}); //go to calc page
			}
		}
	} 
	else { //not registered so register first
		alert('You need to register first');
		$( ":mobile-pagecontainer" ).pagecontainer("change", "#login", { transition: "slide"});
	}
});
$(document).on('pagebeforeshow', '#distance', function() { //clears any values that remained in the DOM from previous pageshows/submits
	$('#output').empty();
	$('#cost').empty();
});

function loadLoginForm() {
	/* Loads values (if any exist) from localstorage into car rental form */
	
	document.getElementById("fname").value = localStorage.getItem("fname");
	document.getElementById("lname").value = localStorage.getItem("lname");
	document.getElementById("id").value = localStorage.getItem("id");
	document.getElementById("email").value = localStorage.getItem("email");
	document.getElementById("phone").value = localStorage.getItem("phone");
	document.getElementById("cell").value = localStorage.getItem("cell");
	document.getElementById("dob").value = localStorage.getItem("dob");
	document.getElementById("license").value = localStorage.getItem("license");
}
	
function savefield(fieldName) {
	/*adds fieldname.value to localstorage */
	try {
		document.getElementById(fieldName).setCustomValidity('');
		localStorage.setItem(fieldName, (document.getElementById(fieldName).value));
	} 
	catch(e){
	}	
};
	
function validateForm() {
	/*Checks to see if at least one phone number was entered
	* And if the user is at least 21 years old.
	* If so, changes isRegistered value and changes page to 
	* the browse cars page.
	* No need for further validation. All other inputs are required and have a regex */
	
	//Ensure that user is at least 21
	var dob = localStorage.dob;
	var birthMonth = dob.slice(5,7);
	var birthDay = dob.slice(8,10);
	var birthYear = dob.slice(0,4);
	if ((calculateAge(birthMonth, birthDay, birthYear)) < 21) {
		alert("You must be at least 21 to rent a car");
		return false;
	}
		
	//Ensure that a tel or cell was entered
	var phone = document.getElementById("phone").value;
	var cell = document.getElementById("cell").value;
	if ((phone == null || phone == "") && (cell == null || cell == "")) {
		alert("You must enter at least one phone number");
		return false;
	}
	else {
		//Cell was entered change isRegistered to True and change page
		$.ajax({
			type: "POST",
			url: "submit.php",
			        data: "FName=" + $("#fname").val() + "LName=" 
					+ $("#lname").val() + "TZ=" + $("#id").val() 
					+ "Email=" + $("#email").val() + "Tel=" 
					+ $("#phone").val() + "cell=" + $("#cell").val() 
					+ "dob=" + $("#dob").val() + "license=" 
					+ $("#license").val(),
			success: function () {
				alert("Registration Completed");
			},
		});
		localStorage.setItem("isRegistered", 'True');
		$( ":mobile-pagecontainer" ).pagecontainer("change", "#cars", { transition: "slide"}); 
	};
}

function clearLoginForm() {
	/*As the name suggests, it clears the login form*/
    localStorage.removeItem("fname");
	localStorage.removeItem("lname");
	localStorage.removeItem("id");
	localStorage.removeItem("email");
	localStorage.removeItem("phone");
	localStorage.removeItem("cell");
	localStorage.removeItem("dob");
	localStorage.removeItem("license");
    loadAll();
}

function loadCars() {
	/* Populates list of cars for rent with cars that have isRented=false on the browse cars page */
	var first=localStorage.getItem("first");
	if(first!='1') {
		var cars=[
			{ "id": "11-22-123", "maker":"Mazda" , "model":"6" , "gear":"Manual", "year":"2013","isRented":false },
			{ "id": "11-22-129" ,"maker":"BMW" , "model":"325i" , "gear":"Automatic", "year":"2013" ,"isRented":false },
			{ "id": "11-22-128", "maker":"Mercedes" , "model":"C class" , "gear":"Manual", "year":"2013","isRented":false },
			{ "id": "11-22-127", "maker":"Honda" , "model":"civic" , "gear":"Manual", "year":"2013","isRented":false },
			{ "id": "11-22-126", "maker":"Fiat" , "model":"punto" , "gear":"Automatic", "year":"2013","isRented":false },
			{ "id": "11-22-125", "maker":"Audi" , "model":"A8" , "gear":"Manual", "year":"2013","isRented":false },
			{ "id": "11-22-124", "maker":"Mini" , "model":"Cooper" , "gear":"Automatic","year":"2013","isRented":false }
		];
		localStorage.setItem('cars', JSON.stringify(cars));
		localStorage.setItem('first','1');
	}
	var cars = JSON.parse(localStorage.getItem('cars'));
	$('#carList').empty();
	for (var i=0, numCars = cars.length; i<numCars; i++) {
		if(!(cars[i].isRented)) {
			$('#carList').append("<li class='carWrapper' id='"+cars[i].id
			+"'><a href=''><img src='images/car/car0"+i+".jpg'>"
			+"<h2>"+cars[i].maker+" "+cars[i].model+" ("+cars[i].year+")</h2>"
			+"<p>Car Number: " + cars[i].id + "</br>" 
			+ "Transmission: " + cars[i].gear + "</p>"
			+"</a></li>")
		}
	};
	$('#carList').listview('refresh');
}

function rentCar() {
	var cars = JSON.parse(localStorage.getItem('cars'));
	var selectedCar = JSON.parse(localStorage.getItem('selectedCar'));
	for (var i=0, numCars = cars.length; i<numCars; i++) {
		if (cars[i].id == selectedCar.id) {
			cars[i].isRented = true;
			localStorage.setItem('cars', JSON.stringify(cars));
		}
	} 
	alert('Car has been reserved for you');
	$( ":mobile-pagecontainer" ).pagecontainer("change", "#home", { transition: "pop"});
}

function returnCar() {
	var userCarId = document.getElementById('carID').value;
	var cars = JSON.parse(localStorage.getItem('cars'));
	for (var i=0, numCars = cars.length; i<numCars; i++) {
		if (cars[i].id == userCarId) {
			if (cars[i].isRented) {
				cars[i].isRented = false;
				localStorage.setItem('cars', JSON.stringify(cars));
				alert("Car has been returned");
				document.getElementById('carID').value = '';
				$( ":mobile-pagecontainer" ).pagecontainer("change", "#home", { transition: "pop"});
				return;
			} else {
				alert("The car with ID " + userCarId + " hasn't been rented");
				document.getElementById('carID').value = '';
				return;
			}
		}
	}
	alert("We don't recognize a car with ID " + userCarId + ". Please try again.");
	document.getElementById('carID').value = '';
}

function calculateAge(birthMonth, birthDay, birthYear) {
	todayDate = new Date();
	todayYear = todayDate.getFullYear();
	todayMonth = todayDate.getMonth();
	todayDay = todayDate.getDate();
	age = todayYear - birthYear; 

	if (todayMonth < birthMonth - 1) {
		age--;
	}

	if (birthMonth - 1 == todayMonth && todayDay < birthDay) {
		age--;
	}
	return age;
}