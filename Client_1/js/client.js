var ip = "127.0.0.1";
var port = "8000";

var ViewCount = 0;
var logoimages = new Array()

// //////////client/////////////////

window.addEventListener("load", init, false);

var socketisOpen = 0;
var intervalID = 0;
var currentClass = "1a";
var fadeindelayIntervalID;
var generateBox1IntervalID;
var SBisVisible = 0;
var CDisVisible = 0;
var SBlastUserChoice;
var penaltyArray = [];
var start = 1;
var CDisSet = 0;

var boxkeyframes = [ {
	bottom : "45px"
}, {
	bottom : "0px"
} ]
var boxtimings_in = {
	duration : 500,
	delay : 200,
	iterations : 1,
	direction : "normal",
	fill : "both",
	easing : "ease-in"
}
var boxtimings_out = {
	duration : 500,
	iterations : 1,
	direction : "reverse",
	fill : "both",
	easing : "ease-out"
}
var text_boxkeyframes = [ {
	width : "280px"
}, {
	width : "200px"
} ]
var text_boxtimings_in = {
	duration : 600,
	iterations : 1,
	direction : "normal",
	fill : "both",
	easing : "ease-in"
}
var text_boxtimings_out = {
	duration : 600,
	delay : 200,
	iterations : 1,
	direction : "reverse",
	fill : "both",
	easing : "ease-out"
}
var CDboxkeyframes = [ {
	opacity : "1"
}, {
	opacity : "0"
} ]
var CDboxtimings_in = {
	duration : 600,
	iterations : 1,
	direction : "reverse",
	fill : "both",
	easing : "ease-in"
}
var CDboxtimings_out = {
	duration : 600,
	iterations : 1,
	direction : "normal",
	fill : "both",
	easing : "ease-out"
}
var SBboxtimings_in_slow = {
	duration : 800,
	iterations : 1,
	direction : "reverse",
	fill : "both",
	easing : "ease-in"
}
var SBboxtimings_out_slow = {
	duration : 800,
	iterations : 1,
	direction : "normal",
	fill : "both",
	easing : "ease-out"
}
var SBboxtimings_in_fast = {
	duration : 300,
	iterations : 1,
	direction : "reverse",
	fill : "both",
	easing : "ease-in-out"
}
var SBboxtimings_out_fast = {
	duration : 300,
	iterations : 1,
	direction : "normal",
	fill : "both",
	easing : "ease-in-out"
}

var senderlogoboxtimings_in = {
	duration : 300,
	iterations : 1,
	direction : "reverse",
	fill : "both",
	easing : "ease-in"
}
var senderlogoboxtimings_out = {
	duration : 300,
	iterations : 1,
	direction : "normal",
	fill : "both",
	easing : "ease-out"
}
function fadeCDinSlow() {
	var animRedBox = document.getElementById("cd_anim_mainbox").animate(
			CDboxkeyframes, CDboxtimings_in);
	CDisVisible = 1;
}

function fadeCDoutSlow() {
	var animRedBox = document.getElementById("cd_anim_mainbox").animate(
			CDboxkeyframes, CDboxtimings_out);
	CDisVisible = 0;
}

function fadePenaltyOut() {
	clearInterval(penaltyFadeID);
	var animRedBox = document.getElementById("cd_timebox_animate_box1")
			.animate(boxkeyframes, boxtimings_out);
	var animGreenBox = document.getElementById("cd_timebox_animate_box2")
			.animate(text_boxkeyframes, text_boxtimings_out);
}

function fadeSBinSlow() {
	var animRedBox = document.getElementById("box1mainOutsideDiv").animate(
			CDboxkeyframes, SBboxtimings_in_slow);
	SBisVisible = 1;
}

function fadeSBoutSlow() {
	var animRedBox = document.getElementById("box1mainOutsideDiv").animate(
			CDboxkeyframes, SBboxtimings_out_slow);
	SBisVisible = 0;
}

function fadeSBinFast() {
	var animRedBox = document.getElementById("box1mainOutsideDiv").animate(
			CDboxkeyframes, SBboxtimings_in_fast);
	if (fadeindelayIntervalID != 0) {
		clearInterval(fadeindelayIntervalID);
	}
	SBisVisible = 1;

}

function fadeSBoutFast() {
	var animRedBox = document.getElementById("box1mainOutsideDiv").animate(
			CDboxkeyframes, SBboxtimings_out_fast);
	SBisVisible = 0;
}

function updateCurDriverBox(newDjson) {
	document.getElementById("cd_text_drivername").innerHTML = newDjson["display_name"];
	document.getElementById("cd_text_startnumber").innerHTML = newDjson["startnumber"];
	document.getElementById("cd_text_currentclass").innerHTML = newDjson["ageclass"];
	document.getElementById("clublogo").src = "logos/" + newDjson["club"]
			+ ".png";
	if (newDjson["time_result"] != "0") {
		document.getElementById("cd_text_lasttime").innerHTML = newDjson["time_result"];
	} else if (newDjson["time1"] != "0") {
		document.getElementById("cd_text_lasttime").innerHTML = newDjson["time1"];
	} else {
		document.getElementById("cd_text_lasttime").innerHTML = "00:00:00";
	}

}

function generateBox1Pre() {
	if (json[0] === undefined) {
		if (SBisVisible) {
			lg("undefined");
			fadeSBoutFast();
			clearSBintervalID = setInterval(clearSBbox, 302);
		}
	} else {
		var tmp1 = json[0]["ageclass"];
		if (tmp1 != currentClass && SBlastUserChoice) {
			currentClass = tmp1;
			lg("current class: " + currentClass);
			fadeSBoutFast();
			generateBox1IntervalID = setInterval(generateBox1, 302);
			fadeindelayIntervalID = setInterval(fadeSBinFast, 605);
		} else {
			generateBox1();
		}
	}
}

function generateBox1() {
	if (generateBox1IntervalID != 0) {
		clearInterval(generateBox1IntervalID);
	}
	if (json.length < 16) {
		ViewCount = json.length;
	} else {
		ViewCount = 16;
	}
	content = "";
	document.getElementById("box1mainOutsideDiv").innerHTML = content;
	for (i = 1; i < ViewCount + 1; i++) {
		if (i == 1) {
			content += generatorHelper1(json[i - 1]["rank"],
					json[i - 1]["display_name"], json[i - 1]["time_result"]);
		} else {
			timediff = getTimeDiff(json[i - 2]["time_result"], json[i - 1]["time_result"]);
			
			content += generatorHelper2(json[i - 1]["rank"],
					json[i - 1]["display_name"], json[i - 1]["time_result"], timediff);
		}
	}
	document.getElementById("box1mainOutsideDiv").innerHTML = content;
}

function clearSBbox() {
	clearInterval(clearSBintervalID);
	document.getElementById("box1mainOutsideDiv").innerHTML = "";
}

function generatorHelper1(rank, name, time) {
	genstring1 = "<div>"
			+ "<svg height=\"35\" width=\"380\">"
			+ "<path d=\"m 25 2 h 280 q 8 0 5 5 l -13 20 q -3 3 -8 3 h -280 q -9 0 -5 -5 l 13 -20 q 3 -4 7 -3 z\" stroke=\"black\" style=\"fill:#4d0000;stroke-opacity:1;\" fill-opacity=\"0.9\" stroke-width=\"3\" />"
			+ "<path d=\"m 26 3 h 28 q 8 0 5 5 l -13 18 q -3 3 -8 3 h -28 q -8.5 0.5 -5 -5 l 13 -18 q 3 -4 7 -3 z\" style=\"fill:#990000;\" />"
			+ "<text id=\"testtext\" x=\"31\" y=\"24\" fill=\"white\" font-size=\"24\" text-anchor=\"middle\">"
			+ rank
			+ "</text>"
			+ "<text id=\"testtext2\" x=\"64\" y=\"24\" fill=\"white\" font-size=\"24\" style=\"text-transform: uppercase;\">"
			+ name
			+ "</text>"
			+ "<text id=\"testtext2\" x=\"290\" y=\"24\" fill=\"white\" font-size=\"24\" text-anchor=\"end\">"
			+ time + "</text>" + "</svg></div>";
	return genstring1;
}

function generatorHelper2(rank, name, time, timediff) {
	var box = "";
	var width = 0;
	var doGenerate = 1;
	switch(timediff.toString().length) {
	case 0:
		doGenerate = 0;
		break;
	case 1:
		width = 34;
		break;
	case 2:
		width = 45;
		break;
	case 3:
		width = 58;
		break;
	case 4:
		width = 71;
		break;
	case 5:
		width = 84;
		break;
	case 6:
		width = 97;
		break;
	}
	if (doGenerate) {
		box = "<path d=\"m 322 2 h " + width + " q 8 0 5 5 l -13 20 q -3 3 -8 3 h -" + width + " q -9 0 -5 -5 l 13 -20 q 3 -4 7 -3 z\" stroke=\"black\" style=\"fill:#4d4d4d;stroke-opacity:1;\" fill-opacity=\"0.9\" stroke-width=\"3\" />"
		+ "<text id=\"testtext\" x=\"314\" y=\"24\" fill=\"white\" font-size=\"24\" text-anchor=\"left\">"
		+ "+" + timediff + "</text>";
	}
	genstring1 = "<div>"
			+ "<svg height=\"35\" width=\"420\">"
			+ "<path d=\"m 25 2 h 280 q 8 0 5 5 l -13 20 q -3 3 -8 3 h -280 q -9 0 -5 -5 l 13 -20 q 3 -4 7 -3 z\" stroke=\"black\" style=\"fill:grey;stroke-opacity:1;\" fill-opacity=\"0.6\" stroke-width=\"3\" />"
			+ "<path d=\"m 26 3 h 28 q 8 0 5 5 l -13 18 q -3 3 -8 3 h -28 q -8.5 0.5 -5 -5 l 13 -18 q 3 -4 7 -3 z\" style=\"fill:#4d4d4d;\" />";

	genstring2 = "<text id=\"testtext\" x=\"31\" y=\"24\" fill=\"white\" font-size=\"24\" text-anchor=\"middle\">"
			+ rank
			+ "</text>"
			+ "<text id=\"testtext2\" x=\"64\" y=\"24\" fill=\"white\" font-size=\"24\" style=\"text-transform: uppercase;\">"
			+ name
			+ "</text>"
			+ "<text id=\"testtext2\" x=\"290\" y=\"24\" fill=\"white\" font-size=\"24\" text-anchor=\"end\">"
			+ time + "</text>" + "</svg></div>";
	return genstring1 + box + genstring2;
}

function event(cmdText, valueText) {
	switch (cmdText) {
	case "6008":
		currentClass = valueText;
		break;
	case "6106":
		// Uhh, its a new player
		newDjson = JSON.parse(valueText.replace(/'/g, '"'));
		updateCurDriverBox(newDjson);
		CDisSet = 1;
		break;
	case "6110":
		// Its json only time sorted by rank;
		json = JSON.parse(valueText.replace(/'/g, '"'));
		generateBox1Pre();
		break;
	case "6112":
		// Class Override
		json = JSON.parse(valueText.replace(/'/g, '"'));
		generateBox1Pre();
		break;
	case "6901":
		if (valueText == "0" && SBisVisible) {
			SBlastUserChoice = 0;
			fadeSBoutSlow();
		} else if (valueText == "1" && !SBisVisible) {
			SBlastUserChoice = 1;
			fadeSBinSlow();
		} else if (valueText == "2" && SBisVisible) {
			SBlastUserChoice = 0;
			fadeSBoutFast();
		} else if (valueText == "3" && !SBisVisible) {
			SBlastUserChoice = 1;
			fadeSBinFast();
		}
		break;
	case "6902":
		if (valueText == "0" && CDisVisible) {
			fadeCDoutSlow();
		} else if (valueText == "1" && !CDisVisible && CDisSet) {
			fadeCDinSlow();
		}
		break;
	case "6903":
		var lenght = penaltyArray.length;

		if (valueText == "1") {
			penaltyArray.push(1);
		} else if (valueText == "2") {
			penaltyArray.push(2);
		}
		if (lenght == 0) {
			fadePenaltyInOnEvent();
		}
		break;
	case "6904":
		if (valueText == "0") {
			var animSenderlogo = document.getElementById("animSenderLogoDiv").animate(
					CDboxkeyframes, senderlogoboxtimings_out);
		} else if (valueText == "1") {
			var animSenderlogo = document.getElementById("animSenderLogoDiv").animate(
					CDboxkeyframes, senderlogoboxtimings_in);
		}

		break;
	case "ping":
		sendCommand("pong", valueText);
		break;
	}
}

function getTimeDiff(timestr1, timestr2) {
	return (timestrToInt(timestr2) - timestrToInt(timestr1))/1000;
}

function timestrToInt(str) {
    var tms = parseInt(str.substring(6, 8))
    var ts = parseInt(str.substring(3, 5))
    var tm = parseInt(str.substring(0, 2))
    return tm*60000+ts*1000+tms*10
}

function fadePenaltyOut2() {
	clearInterval(penaltyFadeID);
	var animRedBox = document.getElementById("cd_timebox_animate_box1")
			.animate(boxkeyframes, boxtimings_out);
	var animGreenBox = document.getElementById("cd_timebox_animate_box2")
			.animate(text_boxkeyframes, text_boxtimings_out);
	penaltyFadeOutdelayID = setInterval(removePenaltyFromList, 1000);
}

function removePenaltyFromList() {
	clearInterval(penaltyFadeOutdelayID);
	penaltyArray.splice(0, 1);
	if (penaltyArray.length > 0) {
		fadePenaltyInOnEvent();
	}
}

function fadePenaltyInOnEvent() {
	if (penaltyArray[0] == 1) {
		document.getElementById("penaltytext").innerHTML = "+2s"
	} else if (penaltyArray[0] == 2) {
		document.getElementById("penaltytext").innerHTML = "+10s"
	}

	var animRedBox = document.getElementById("cd_timebox_animate_box1")
			.animate(boxkeyframes, boxtimings_in);
	var animGreenBox = document.getElementById("cd_timebox_animate_box2")
			.animate(text_boxkeyframes, text_boxtimings_in);
	penaltyFadeID = setInterval(fadePenaltyOut2, 2600);
}

function preload() {
	for (i = 0; i < preload.arguments.length; i++) {
		logoimages[i] = new Image()
		logoimages[i].src = preload.arguments[i]
	}
}

function init() {
	doConnect();
	preload("logos/fc1.png", "logos/fc2.png");
}

function sendCommand(p1, p2) {
	if (socketisOpen) {
		p1 = p1.substring(0, 4);
		websocket.send(p1 + ":" + p2);
		lg("sent: " + p1 + ":" + p2)
	} else {
		console.log('Fail: Not connected\n');
	}
}

function showContent(id) {
	document.getElementById(id).style.visibility = "visible";
}

function hideContent(id) {
	document.getElementById(id).style.visibility = "hidden";
}

function changeElementContent(id, newContent) {
	document.getElementById(id).innerHTML = newContent
}

function doConnect() {
	websocket = new WebSocket("ws://" + ip + ":" + port + "/");
	websocket.onopen = function(evt) {
		onOpen(evt)
	};
	websocket.onclose = function(evt) {
		onClose(evt)
	};
	websocket.onmessage = function(evt) {
		onMessage(evt)
	};
	websocket.onerror = function(evt) {
		onError(evt)
	};
}

function onClose(evt) {
	socketisOpen = 0;
	if (!intervalID) {
		intervalID = setInterval(doConnect, 5000);
	}
}

function onOpen(evt) {
	socketisOpen = 1;
	clearInterval(intervalID);
	intervalID = 0;
}
function lg(text) {
	console.log(text);
}
function onMessage(evt) {
	lg(evt.data);
	event(evt.data.substring(0, 4), evt.data.substring(5));
}

function onError(evt) {
	socketisOpen = 0;
	if (!intervalID) {
		intervalID = setInterval(doConnect, 5000);
	}
}

function doDisconnect() {
	socketisOpen = 0;
	websocket.close();
}