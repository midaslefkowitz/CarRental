$(document).on('pagebeforecreate','#cars',slideshow);

function slideshow() {
	//image counter as there is no guarantee that the last images loaded
	//is the last one to finish
	var loaded = 0, numOfImages = 9;
	var imgWidth=1024, imgHeight=768; //the dimensions of the images used
	
	//first part of chain, invoke async load
	var image0 = document.createElement('img'); 
	var image1 = document.createElement('img'); 
	var image2 = document.createElement('img');
	var image3 = document.createElement('img');
	var image4 = document.createElement('img');
	var image5 = document.createElement('img');
	var image6 = document.createElement('img');
	var image7 = document.createElement('img');
	var image8 = document.createElement('img');
	var image9 = document.createElement('img');

	//common event handler when images has loaded with counter
	//to know that all images has loaded
	image0.onload = image1.onload = 
	image2.onload = image3.onload = 
	image4.onload = image5.onload = 
	image6.onload = image7.onload = 
	image8.onload = image9.onload = function(e) {
		loaded++;
		if (loaded === numOfImages)
			draw();   // <-- second part of chain, invoke loop
	}

	//invoke async loading... you can put these four into your
	//window.onload if you want to
	image0.src = 'images/car/car00.jpg'; 
	image1.src = 'images/car/car01.jpg';
	image2.src = 'images/car/car02.jpg'; 
	image3.src = 'images/car/car03.jpg'; 
	image4.src = 'images/car/car04.jpg'; 
	image5.src = 'images/car/car05.jpg'; 
	image6.src = 'images/car/car06.jpg'; 
	image7.src = 'images/car/car07.jpg'; 
	image8.src = 'images/car/car08.jpg'; 
	image9.src = 'images/car/car09.jpg'; 

	// this is the main function
	function draw() {
		images = new Array(image0, image1, image2, image3, image4, image5, image6, image7, image8, image9);
		counter = 0;
		maxNum = images.length - 1;
		myCanvas = document.getElementById('carSlideshow');
		ctx = myCanvas.getContext('2d');
		me = this; //this we need for setTimeout()

		//third part of chain, have a function to invoke by setTimeout
		this._draw = function() {
			var canWidth = document.getElementById('carSlideshow').offsetWidth;
			var proportion = canWidth/imgWidth;
			var canHeight = imgHeight * proportion;
			myCanvas.width = canWidth;
			myCanvas.height = canHeight;
			ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
			ctx.drawImage(images[counter++], 0, 0, canWidth, canHeight);
			if (counter > maxNum) counter = 0;
			setTimeout(me._draw, 3000); //here we use me instead of this
		}
		this._draw(); //START the loop
	}
}