//global varible for question App
//load and remove the Quiz points
var QuestionPointLayer;
var LatestQuestionsLayer;
//createavariablethatwillholdtheXMLHttpRequest()
var xhrQuestion;
var xhrLatestQ;
var xhrMostDif;
//marker shows last 5 questions that user answered
var ptMarkerOrg=L.AwesomeMarkers.icon({
	icon:'play',
	markerColor:'orange'});

//about function
function menuClicked(){
	alert("If you have any problem, please contact uczlm97@ucl.ac.uk .")
}

//load or remove layer depending on the checkbox
function checkQuestionLayer()
{
	if (document.getElementById('switch1').checked) 
	{
		loadQuestionPoint();
	} 
	else {
		removeQuestionPoint();
	}
}

//method to call the other functions to load 
//all the questions points created by my user only
function loadQuestionPoint() 
{
	startQuestionLoad();
}

//to remove all the loaded question points
function removeQuestionPoint() 
{
	//Quiz Points data will be removed
	mymap.removeLayer(QuestionPointLayer);
}	

//to get the questions points from database using
//the functions adapted from here: 
//https://moodle-1819.ucl.ac.uk/mod/folder/view.php?id=1025047
//accessed 10th March 2019
function startQuestionLoad() {
	xhrQuestion = new XMLHttpRequest();
	var url = "http://developer.cege.ucl.ac.uk:"+httpPortNumber;
	url = url + "/getQuizPoints/"+httpPortNumber;
	xhrQuestion.open("GET", url, true);
	xhrQuestion.onreadystatechange = questionPointsResponse;
	xhrQuestion.send();

}

function questionPointsResponse(){
	if (xhrQuestion.readyState == 4) {
		// once the data is ready, process the data
		var questionPointsData = xhrQuestion.responseText;
		loadQuestionLayer(questionPointsData);
	}
}

//convert the received data-which is text
//-toJSON format and add it to the map 
function loadQuestionLayer(questionPointsData){
	//convert the text to JSON 
	var questionPointsDataJSON = JSON.parse(questionPointsData);
	QuestionPointLayer = L.geoJson(questionPointsDataJSON).addTo(mymap);
	mymap.fitBounds(QuestionPointLayer.getBounds());
}

// map layer showing all the questions added in the last week (by any user).

function checkLatestQLayer()
{
	if (document.getElementById('switch2').checked) 
	{
		loadLatestQ();
	} 
	else {
		removeLatestQ();
	}
}

//method to call the other functions to load 
//all the questions points created by my user only
function loadLatestQ() 
{
	startLatestQLoad();
}

//to remove all the loaded question points
function removeLatestQ() 
{
	//Quiz Points data will be removed
	mymap.removeLayer(LatestQuestionsLayer);
}	

function startLatestQLoad() {
	xhrLatestQ = new XMLHttpRequest();
	var url = "http://developer.cege.ucl.ac.uk:"+httpPortNumber;
	url = url + "/getLatestQuestions/"+httpPortNumber;
	xhrLatestQ.open("GET", url, true);
	xhrLatestQ.onreadystatechange = latestPointsResponse;
	xhrLatestQ.send();

}

function latestPointsResponse(){
	if (xhrLatestQ.readyState == 4) {
		// once the data is ready, process the data
		var latestQData = xhrLatestQ.responseText;
		loadLatestQLayer(latestQData);
	}
}

//convert the received data-which is text
//-toJSON format and add it to the map 
function loadLatestQLayer(latestQData){
	//convert the text to JSON 
	var latestQJSON = JSON.parse(latestQData);
	LatestQuestionsLayer = L.geoJson(latestQJSON,
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

             	return L.marker(latlng, {icon:ptMarkerOrg}).bindPopup(htmlString);
             	//return L.marker(latlng).bindPopup(htmlString);
             		//, {icon:ptMarkerOrg})
             },
         }).addTo(mymap);
	mymap.fitBounds(LatestQuestionsLayer.getBounds());
}

// the code to show the user's ranking
function mostDifLoad(){
	xhrMostDif = new XMLHttpRequest();
	var url = "http://developer.cege.ucl.ac.uk:"+httpPortNumber;
	url = url + "/getMostDiff/"+httpPortNumber;
	xhrMostDif.open("GET", url, true);
	xhrMostDif.onreadystatechange = mostDifResponse;
	xhrMostDif.send();
}

function mostDifResponse(){
	if (xhrMostDif.readyState == 4) {
		// once the data is ready, process the data
		var mostDifString = xhrMostDif.responseText;
		var mostDifData="";
		for (var i = 1; i <mostDifString.length-1; i++) {
			mostDifData=mostDifData+mostDifString[i];
		}
		var mostDifJSON = JSON.parse(mostDifData);
		var postList=""
		for(var i= 0;i <5 ;i++){
			postList=postList+mostDifJSON.array_to_json[i].id +": "+mostDifJSON.array_to_json[i].question_title+": "+mostDifJSON.array_to_json[i].question_text+": \n";
			postList=postList+mostDifJSON.array_to_json[i].answer_1+";"+mostDifJSON.array_to_json[i].answer_2+";"+mostDifJSON.array_to_json[i].answer_3+";"+mostDifJSON.array_to_json[i].answer_4+"; \n"
			//+": "+mostDifJSON.array_to_json[i].question_title": "+mostDifJSON.array_to_json[i].question_text+": \n";
			//postList=postList+
		}
		document.getElementById("mostDifDiv").innerHTML = postList;
	}
}