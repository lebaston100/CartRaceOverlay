var ip = "10.2.3.1";
var port = "8000";

////////////Controller//////////////////////////////////////////////////////////////


window.addEventListener("load", init, false);
var socketisOpen = 0;
var intervalID = 0;
var closedByUser = 0;


function event(cmdText, valueText) {
	switch (cmdText) {
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
}

function onClose(evt) {
	socketisOpen = 0;
	if (!intervalID && !closedByUser) {
		intervalID = setInterval(doConnect, 2000);
	} else if (closedByUser) {
		closedByUser = 0;
	}
	writeToScreen("Info: Getrennt");
}

function onMessage(evt) {
	lg(evt.data);
	event(evt.data.substring(0, 4), evt.data.substring(5));
}

function onError(evt) {
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