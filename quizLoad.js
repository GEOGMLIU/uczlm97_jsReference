//global varible for question App
//load and remove the Quiz points
var QuizPointLayer;
//global variable that holds the last 5 questions that the user answered
var lastPointLayer;
//create variables that will hold the XML Http Request()
var xhrQuiz;
var xhrCorrectNum;
var xhrUserRanking;
var xhrLastPt;
//custom marker shows quiz points
var ptMarkerBlue=L.AwesomeMarkers.icon({
	icon:'play',
	markerColor:'blue'});


//about function
function menuClicked(){
	alert("If you have any problem, please contact uczlm97@ucl.ac.uk .")
}

//to get the questions points from database using
//the functions adapted from here: 
//https://moodle-1819.ucl.ac.uk/mod/folder/view.php?id=1025047
//accessed 10th March 2019
function startQuizLoad() {
	xhrQuiz = new XMLHttpRequest();
	var url = "http://developer.cege.ucl.ac.uk:"+httpPortNumber;
	url = url + "/getQuizPoints/"+httpPortNumber;
	xhrQuiz.open("GET", url, true);
	xhrQuiz.onreadystatechange = quizPointsResponse;
	xhrQuiz.send();

}

function quizPointsResponse(){
	if (xhrQuiz.readyState == 4) {
		// once the data is ready, process the data
		var quizPointsData = xhrQuiz.responseText;
		loadQuizLayer(quizPointsData);
	}
}


// keep the layer global so that we can automatically pop up a
// pop-up menu on a point if necessary
// we can also use this to determine distance for the proximity alert
function loadQuizLayer(quizPointsData) {
	// convert the text received from the server to JSON
	var formJSON = JSON.parse(quizPointsData);
	// load the geoJSON layer
	QuizPointLayer = L.geoJson(formJSON,
	{
		// use point to layer to create the points
		pointToLayer: function (feature, latlng)
		{
				// in this case, we build an HTML DIV string
				// using the values in the data
				var htmlString = "<DIV id='popup'"+ feature.properties.question_title + "><h2>" + feature.properties.question_title + "</h2><br>";
				htmlString = htmlString + "<h3>"+feature.properties.question_text +"</h3><br>";
				htmlString = htmlString + "<input type='radio' name='answer' id ='answer_1'/>"+feature.properties.answer_1+"<br>";
				htmlString = htmlString + "<input type='radio' name='answer' id ='answer_2'/>"+feature.properties.answer_2+"<br>";
				htmlString = htmlString + "<input type='radio' name='answer' id ='answer_3'/>"+feature.properties.answer_3+"<br>";
				htmlString = htmlString + "<input type='radio' name='answer' id ='answer_4'/>"+feature.properties.answer_4+"<br>";
				htmlString = htmlString + "<button onclick='checkAnswer(" + feature.properties.id + ");return false;'>Submit Answer</button>"; 

              	// now include a hidden element with the answer               
              	// in this case the answer is alwasy the first choice               
             	// for the assignment this will of course vary - you can use feature.properties.correct_answer               
             	htmlString = htmlString + "<div id=answer" + feature.properties.id + " hidden>" + feature.properties.correct_answer+ "</div>";
             	htmlString = htmlString + "</div>";
				//return L.marker(latlng);
				/*
				L.marker(latlng).addTo(mymap).on('click', function(e){
					document.getElementById("questionDiv").innerHTML = htmlString;
				});
				*/
				return L.marker(latlng, {icon:ptMarkerBlue}).bindPopup(htmlString);
			},
		}).addTo(mymap);
	mymap.fitBounds(QuizPointLayer.getBounds());
}

function closestFormPoint() {  
	// take the leaflet formdata layer  
	// go through each point one by one  
	// and measure the distance to Warren Street  
	// for the closest point show the pop up of that point  
	var minDistance = 100000000000;  
	var closestFormPoint = 0; 
	QuizPointLayer.eachLayer(function(layer) 
	{   
		//alert(userlat,userlng);
		var distance = calculateDistance(userlat, 
			userlng,layer.getLatLng().lat, layer.getLatLng().lng,  'K');
		//alert(distance);
		if (distance < minDistance){    
			minDistance = distance;    
			closestFormPoint = layer.feature.properties.id; 
			//alert(closestFormPoint);
		} 
		
	});  
 	// for this to be a proximity alert, the minDistance must be   
 	// closer than a given distance - you can check that here  
 	// using an if statement 

	// show the popup for the closest point  
	QuizPointLayer.eachLayer(function(layer) {   
		if (layer.feature.properties.id == closestFormPoint){    
			layer.openPopup();   
		}  
	}); 
	
} 


//the function to get correct answer numbers
function showCorrectNum(){
	xhrCorrectNum = new XMLHttpRequest();
	var url = "http://developer.cege.ucl.ac.uk:"+httpPortNumber;
	url = url + "/getCorrectAnsNum/"+httpPortNumber;
	xhrCorrectNum.open("GET", url, true);
	xhrCorrectNum.onreadystatechange = ansNumResponse;
	xhrCorrectNum.send();
}

function ansNumResponse(){
	if (xhrCorrectNum.readyState == 4) {
		// once the data is ready, process the data
		var correctNumString = xhrCorrectNum.responseText;

		//the code is to convert string into JSON format array
		//in order to get the num_questions
		var correctNumData="";
		for (var i = 1; i <correctNumString.length-1; i++) {
			correctNumData=correctNumData+correctNumString[i];
		}
		var ansNumJSON = JSON.parse(correctNumData);
		alert("You have answered "+ ansNumJSON.array_to_json[0].num_questions + " questions correctly.");
	}
}


// the code to show the user's ranking
function showRanking(){
	xhrUserRanking = new XMLHttpRequest();
	var url = "http://developer.cege.ucl.ac.uk:"+httpPortNumber;
	url = url + "/getRanking/"+httpPortNumber;
	xhrUserRanking.open("GET", url, true);
	xhrUserRanking.onreadystatechange = rankingResponse;
	xhrUserRanking.send();
}

function rankingResponse(){
	if (xhrUserRanking.readyState == 4) {
		// once the data is ready, process the data
		var rankingString = xhrUserRanking.responseText;

		//the code is to convert string into JSON format array
		//in order to get the rank
		var rankingData="";
		for (var i = 1; i <rankingString.length-1; i++) {
			rankingData=rankingData+rankingString[i];
		}
		var rankingJSON = JSON.parse(rankingData);
		alert("You ranking is: "+ rankingJSON.array_to_json[0].rank + ".");
	}
}

//the following functions are used to load the last 5 question
function startLastPtLoad() {
	xhrLastPt = new XMLHttpRequest();
	var url = "http://developer.cege.ucl.ac.uk:"+httpPortNumber;
	url = url + "/getLast5/"+httpPortNumber;
	xhrLastPt.open("GET", url, true);
	xhrLastPt.onreadystatechange = lastPtResponse;
	xhrLastPt.send();

}

function lastPtResponse(){
	if (xhrLastPt.readyState == 4) {
		// once the data is ready, process the data
		var lastPointsData = xhrLastPt.responseText;
		loadLastPtLayer(lastPointsData);
	}
}


// keep the layer global so that we can automatically pop up a
// pop-up menu on a point if necessary
// we can also use this to determine distance for the proximity alert
function loadLastPtLayer(lastPointsData) {

	// convert the text received from the server to JSON
	var formJSON = JSON.parse(lastPointsData);
	// load the geoJSON layer
	lastPointLayer = L.geoJson(formJSON,
	{
		// use point to layer to create the points
		pointToLayer: function (feature, latlng)
		{
				// in this case, we build an HTML DIV string
				// using the values in the data
				var htmlString = "<DIV id='popup'"+ feature.properties.question_title + "><h2>" + feature.properties.question_title + "</h2><br>";
				htmlString = htmlString + "<h3>"+feature.properties.question_text +"</h3><br>";
				htmlString = htmlString + "<input type='radio' name='answer' id ='answer_1'/>"+feature.properties.answer_1+"<br>";
				htmlString = htmlString + "<input type='radio' name='answer' id ='answer_2'/>"+feature.properties.answer_2+"<br>";
				htmlString = htmlString + "<input type='radio' name='answer' id ='answer_3'/>"+feature.properties.answer_3+"<br>";
				htmlString = htmlString + "<input type='radio' name='answer' id ='answer_4'/>"+feature.properties.answer_4+"<br>";
				htmlString = htmlString + "<button onclick='checkAnswer(" + feature.properties.id + ");return false;'>Submit Answer</button>"; 

              	// now include a hidden element with the answer               
              	// in this case the answer is alwasy the first choice               
             	// for the assignment this will of course vary - you can use feature.properties.correct_answer               
             	htmlString = htmlString + "<div id=answer" + feature.properties.id + " hidden>" + feature.properties.correct_answer+ "</div>";
             	htmlString = htmlString + "</div>";
				//return L.marker(latlng);
				//show the quiz depends on the user answered right or wrong (first one in timestamp)
				if (feature.properties.answer_correct===true) {
					return L.marker(latlng, {icon:wrongMarker}).bindPopup(htmlString);
				}
				else{
					return L.marker(latlng, {icon:correctMarker}).bindPopup(htmlString);
				}
			},
		}).addTo(mymap);
	mymap.fitBounds(lastPointLayer.getBounds());
}