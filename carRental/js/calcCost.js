onmessage = function (event) {
	setTimeout(function(){
		var total = 0;
		var distance = (event.data).distance;
		var gear = (event.data).gear; 
		if (distance > 90) {
			total = (distance-90) * .9;
			distance = 90;
		}
		total += (distance * 1.2);
		if (gear == 'Manual') {
			total *= .9;
		}
		
		postMessage(total.toString());
	},3000);
};