var ip = "127.0.0.1";
var port = "8000";

var ViewCount = 0;

// //////////Controller//////////////////////////////////////////////////////////////

window.addEventListener("load", init, false);
var socketisOpen = 0;
var intervalID = 0;
var pullIntervall = 0;
var closedByUser = 0;
var activeDriver;
var activeAgeclass;
var oldactiveclass = "1a";

function setActiveDriver() {
	newdriverkey = $('#playerselect').val();
	var count = json.length;
	var oldactiveclass = activeAgeclass
	for (i = 0; i < count; i++) {
		if (json[i]["key"] == newdriverkey) {
			activeAgeclass = json[i]["ageclass"];
		}
	}
	sendCommand("6106", activeAgeclass);
	sendCommand("6105", newdriverkey);
	clearHeader()
	activeDriver = newdriverkey;
	lg("New Active Driver " + newdriverkey);

}

function setActiveAgeclassOverride(newdriverkey) {
	activeAgeclass = $('#select_ageclass').val();
	sendCommand("6008", activeAgeclass);
	sendCommand("6004", "0");
}

function penalty2() {
	if (typeof activeDriver !== 'undefined') {
		sendCommand("6903", "1");
		sendCommand("6104", activeDriver + ":2");
	} else {
		Materialize.toast("Kein aktiver Fahrer", 4000);
	}
}

function penalty10() {
	if (typeof activeDriver !== 'undefined') {
		sendCommand("6903", "2");
		sendCommand("6104", activeDriver + ":10");
	} else {
		Materialize.toast("Kein aktiver Fahrer", 4000);
	}
}

function penalty2Min() {
	if (typeof activeDriver !== 'undefined') {
		sendCommand("6104", activeDriver + ":-2");
	} else {
		Materialize.toast("Kein aktiver Fahrer", 4000);
	}
}

function penalty10Min() {
	if (typeof activeDriver !== 'undefined') {
		sendCommand("6104", activeDriver + ":-10");
	} else {
		Materialize.toast("Kein aktiver Fahrer", 4000);
	}
}

function clearHeader() {
	document.getElementById("field_current_driver").innerHTML = "Keiner";
	document.getElementById("field_ageclass").innerHTML = "";
	document.getElementById("field_current_penalty_1").innerHTML = "0";
	document.getElementById("field_current_penalty_2").innerHTML = "0";
	document.getElementById("field_current_driver_startnumber").innerHTML = "0";
}

function generateBox1(newData) {
	content = "";
	for (i = 0; i < newData.length; i++) {
		content += "<tr><td>" + newData[i]["rank"] + "</td><td>"
				+ newData[i]["full_name"] + "</td><td>" + newData[i]["time1"]
				+ "</td><td>" + newData[i]["time2"] + "</td><td>"
				+ newData[i]["time_result"] + "</td></tr>";
	}
	document.getElementById("box1mainOutsideDiv").innerHTML = content;
}

function secFormat(secs) {

	return formated;
}

function event(cmdText, valueText) {
	switch (cmdText) {
	case "6106":
		json2 = JSON.parse(valueText.replace(/'/g, '"'));
		document.getElementById("field_current_driver").innerHTML = json2["full_name"];
		document.getElementById("field_ageclass").innerHTML = json2["ageclass"];
		document.getElementById("field_current_penalty_1").innerHTML = json2["penalty_time_1"];
		document.getElementById("field_current_penalty_2").innerHTML = json2["penalty_time_2"];
		document.getElementById("field_current_driver_startnumber").innerHTML = json2["startnumber"];
		document.getElementById("field_time1").innerHTML = json2["time1"];
		document.getElementById("field_time2").innerHTML = json2["time2"];
		document.getElementById("field_time_result").innerHTML = json2["time_result"];
	case "6201":
		ViewCount = parseInt(valueText);
		break;
	case "6107":
		json = JSON.parse(valueText.replace(/'/g, '"'));
		$('#playerselect').empty();
		var count = json.length;
		if (count == 0) {
			document.getElementById("field_remaining_drivers").innerHTML = 0;
		} else {
			document.getElementById("field_remaining_drivers").innerHTML = count - 1;
		}
		var oldSel = $('#playerselect').get(0);
		for (i = 0; i < count; i++) {
			var opt = document.createElement('option');
			opt.text = "StNr " + json[i]["startnumber"] + " "
					+ json[i]["full_name"] + " Kl: " + json[i]["ageclass"];
			opt.value = json[i]["key"];
			oldSel.add(opt, null)
		}
		$('#playerselect').material_select();
		// Materialize.toast("Success", 4000);
		break;
	case "6110":
		// Its json only time sorted by rank;
		generateBox1(JSON.parse(valueText.replace(/'/g, '"')));
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
	$('#select_ageclass').material_select();
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
	sendCommand("6004", "0");
	// pullIntervall = setInterval(helper1, 12000);
}

function helper1() {
	sendCommand("6004", "0");
}

function onClose(evt) {
	clearInterval(pullIntervall);
	socketisOpen = 0;
	if (!intervalID && !closedByUser) {
		intervalID = setInterval(doConnect, 4000);
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
		intervalID = setInterval(doConnect, 4000);
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