var ip = "127.0.0.1";
var port = "8000";

window.addEventListener("load", init, false);
var socketisOpen = 0;
var intervalID = 0;
var closedByUser = 0;
var requestedAll = 0;

function RequestupdateList() {
	var selected = $('#player_ageclass').val();
	if (selected == "0") {
		sendCommand("6003", "0");
	} else {
		sendCommand("6009", selected);
	}
}

function generateList(json) {
	content = "";
	for (i = 0; i < json.length; i++) {
		content += "<tr><td>" + json[i]["rank"] + "</td><td>"
				+ json[i]["startnumber"] + "</td><td>" + json[i]["full_name"]
				+ "</td><td>" + json[i]["age"] + "</td><td>"
				+ json[i]["ageclass"] + "</td><td>" + json[i]["club"]
				+ "</td><td>" + json[i]["penalty_time_1"] + "</td><td>"
				+ json[i]["time1"] + "</td><td>" + json[i]["penalty_time_2"]
				+ "</td><td>" + json[i]["time2"] + "</td><td>"
				+ json[i]["time_result"] + "</td></tr>";
	}
	document.getElementById("box1mainOutsideDiv").innerHTML = content;
	$("table").trigger("update");
}

function event(cmdText, valueText) {
	switch (cmdText) {
	case "6301":
		json = JSON.parse(valueText.replace(/'/g, '"'));
		generateList(json);
		break;
	case "6303":
		json = JSON.parse(valueText.replace(/'/g, '"'));
		generateList(json);
		break;
	case "ping":
		sendCommand("pong", valueText);
		break;
	}
}

function getInput(id) {
	return document.getElementById(id).value;
}

function sendCommand(p1, p2) {
	if (socketisOpen) {
		p1 = p1.substring(0, 4);
		websocket.send(p1 + ":" + p2);
		console.log("Sent: " + p1 + ":" + p2);
	} else {
		writeToScreen('Fail: Not connected');
	}
}

function init() {
	doConnect();
	$(document).ready(function() {
		$('select').material_select();
	});
	$(document).ready(function() {
		$("#sortit").tablesorter();
	});
}
function lg(text) {
	console.log(text);
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

function onOpen(evt) {
	socketisOpen = 1;
	writeToScreen("Info: Verbunden");
	clearInterval(intervalID);
	intervalID = 0;
	sendCommand("6003", "0");
}

function onClose(evt) {
	socketisOpen = 0;
	if (!intervalID && !closedByUser) {
		intervalID = setInterval(doConnect, 2000);
	} else if (closedByUser) {
		closedByUser = 0;
	}
	lg(evt);
	writeToScreen("Info: Getrennt");
}

function onMessage(evt) {
	lg(evt.data);
	event(evt.data.substring(0, 4), evt.data.substring(5));
}

function onError(evt) {
	clearInterval(pullIntervall);
	writeToScreen('Connection failed, is the Server running?');
	socketisOpen = 0;
	if (!intervalID) {
		intervalID = setInterval(doConnect, 2000);
	}
}

function writeToScreen(message) {
	Materialize.toast(message, 3000);
}

function doDisconnect() {
	socketisOpen = 0;
	closedByUser = 1;
	websocket.close();
}