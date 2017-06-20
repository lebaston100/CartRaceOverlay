var ip = "127.0.0.1";
var port = "8000";

// ////////DBupdate/////////////////////////////////////////////////////////////////

window.addEventListener("load", init, false);
var socketisOpen = 0;
var intervalID = 0;
var pullIntervall = 0;
var closedByUser = 0;
currentTime = new Date()

function updatesetPlayerData() {
	//sende daten aus formular zum server (update oder neu)
	sendbuffer = "{\"key\":\"" + document.getElementById("playeridinDB").value
			+ "\",\"startnumber\":\""
			+ document.getElementById("player_startnumber").value
			+ "\",\"full_name\":\""
			+ document.getElementById("player_full_name").value
			+ "\",\"display_name\":\""
			+ document.getElementById("player_display_name").value
			+ "\",\"club\":\""
			+ document.getElementById("player_club").value
			+ "\",\"age\":\""
			+ document.getElementById("player_age").value
			+ "\",\"ageclass\":\""
			+ $('#player_ageclass').val()
			+ "\",\"gender\":\""
			+ $('#player_gender').val()
			+ "\",\"penalty_time_1\":\""
			+ document.getElementById("player_penalty_time_1").value
			+ "\",\"penalty_time_2\":\""
			+ document.getElementById("player_penalty_time_2").value
			+ "\",\"rank\":\""
			+ document.getElementById("player_rank").value
			+ "\",\"time1\":\""
			+ document.getElementById("player_time_1").value
			+ "\",\"time2\":\""
			+ document.getElementById("player_time_2").value
			+ "\",\"time_result\":\""
			+ document.getElementById("player_time_result").value
			+ "\"}";
	sendCommand("6102", sendbuffer);
	getPlayers();
}

function selectedPlayerToUpdate() {
	//befülle formular mit ausgewähltem spieler
	playerid = $('#playerselect').val();
	document.getElementById("playeridinDB").value = json[playerid]["key"];
	document.getElementById("player_startnumber").value = json[playerid]["startnumber"];
	document.getElementById("player_full_name").value = json[playerid]["full_name"];
	document.getElementById("player_display_name").value = json[playerid]["display_name"];
	document.getElementById("player_club").value = json[playerid]["club"];
	document.getElementById("player_age").value = json[playerid]["age"];
	$('#player_ageclass').material_select('destroy');
	document.getElementById("player_ageclass").value = json[playerid]["ageclass"];
	$('#player_ageclass').material_select();
	$('#player_gender').material_select('destroy');
	document.getElementById("player_gender").value = json[playerid]["gender"];
	$('#player_gender').material_select();
	document.getElementById("player_rank").value = json[playerid]["rank"];
	document.getElementById("player_penalty_time_1").value = json[playerid]["penalty_time_1"];
	document.getElementById("player_penalty_time_2").value = json[playerid]["penalty_time_2"];
	document.getElementById("player_time_1").value = json[playerid]["time1"];
	document.getElementById("player_time_2").value = json[playerid]["time2"];
	document.getElementById("player_time_result").value = json[playerid]["time_result"];
}

function PushNewPlayerDataToForm(data) {
	//update formular mit neuer id updaten nach neu erstellen
	temp1_json = JSON.parse(data);
	document.getElementById("playeridinDB").value = temp1_json["key"];
	document.getElementById("player_startnumber").value = temp1_json["startnumber"];
	document.getElementById("player_full_name").value = temp1_json["full_name"];
	document.getElementById("player_club").value = temp1_json["club"];
	document.getElementById("player_display_name").value = temp1_json["display_name"];
	document.getElementById("player_age").value = temp1_json["age"];
	$('#player_ageclass').material_select('destroy');
	document.getElementById("player_ageclass").value = temp1_json["ageclass"];
	$('#player_ageclass').material_select();
	$('#player_gender').material_select('destroy');
	document.getElementById("player_gender").value = temp1_json["gender"];
	$('#player_gender').material_select();
	document.getElementById("player_rank").value = temp1_json["rank"];
	document.getElementById("player_penalty_time_1").value = temp1_json["penalty_time_1"];
	document.getElementById("player_penalty_time_2").value = temp1_json["penalty_time_2"];
	document.getElementById("player_time_1").value = temp1_json["time1"];
	document.getElementById("player_time_2").value = temp1_json["time2"];
	document.getElementById("player_time_result").value = temp1_json["time_result"];
}

function prepareFormForNewPlayer() {
	//formular leeren damit ein neuer spieler hinzugefügt werden kann
	document.getElementById("playeridinDB").value = "new";
	document.getElementById("player_startnumber").value = "";
	document.getElementById("player_full_name").value = "";
	document.getElementById("player_display_name").value = "";
	document.getElementById("player_club").value = "";
	document.getElementById("player_age").value = "";
	$('#player_ageclass').material_select('destroy');
	document.getElementById("player_ageclass").value = "1a";
	$('#player_ageclass').material_select();
	$('#player_gender').material_select('destroy');
	document.getElementById("player_gender").value = "M";
	$('#player_gender').material_select();
	document.getElementById("player_rank").value = "0";
	document.getElementById("player_penalty_time_1").value = "0";
	document.getElementById("player_penalty_time_2").value = "0";
	document.getElementById("player_time_1").value = "0";
	document.getElementById("player_time_2").value = "0";
	document.getElementById("player_time_result").value = "0";
}

function getPlayers() {
	//gesamte fahrerliste anfordern
	sendCommand("6002", "0");
}

function clearStats() {
	//befehl zum statistiken leeren geben
	if (confirm("Alle Statistiken wirklich zurücksetzten??")) {
		if (confirm("Ganz sicher??")) {
			sendCommand("6007", "68435638568256");
			Materialize.toast("Statistiken wurden gelöscht!!", 5000);
		} else {
			Materialize.toast("Alle Statistiken wurden zurücksetzt", 5000);
		}
	} else {
		Materialize.toast("Alle Statistiken wurden zurücksetzt", 5000);
	}
}

function removePlayer() {
	//entferne user aus datenbank
	playerid = $('#playerselect').val();
	if (confirm("Spieler " + json[playerid]["full_name"] + " wirklich entfernen??")) {
		sendCommand("6005", json[playerid]["key"] +":423895729");
		Materialize.toast("Spieler wurde gelöscht", 5000);
	} else {
		Materialize.toast("Spieler wurde nicht gelöscht", 5000);
	}
}

function clearDB() {
	//löscht die gesamte datenbank
	if (confirm("Datenbank wirklich löschen??")) {
		if (confirm("Ganz sicher löschen??")) {
			sendCommand("6006", "786846375");
			Materialize.toast("Datenbank wurde gelöscht!!", 5000);
		} else {
			Materialize.toast("Datenbank wurde NICHT gelöscht", 5000);
		}
	} else {
		Materialize.toast("Datenbank wurde NICHT gelöscht", 5000);
	}
}

function lg(text) {
	//debugging abürzung :D
	console.log(text);
}

function event(cmdText, valueText) {
	//verarbeiten von nachrichten die vom server an den client verschickt werden
	switch (cmdText) {
	case "6302":
		Materialize.toast("Success", 4000);
		break;
	case "6303":
		json = JSON.parse(valueText.replace(/'/g, '"'));
		$('#playerselect').empty();
		var count = json.length;
		var oldSel = $('#playerselect').get(0);
		for (i = 0; i < count; i++) {
			var alreadyover = "";
			if (json[i]["time_result"] != "0") {
				alreadyover = " ;ist gefahren"
			}
			var opt = document.createElement('option');
			opt.text = json[i]["startnumber"] + " | "
					+ json[i]["full_name"] + " | " + json[i]["ageclass"] + alreadyover;
			opt.value = i;
			oldSel.add(opt, null)
		}
		$('#playerselect').material_select();
		Materialize.toast("Update Success", 1000);
		break;
	case "6304":
		PushNewPlayerDataToForm(valueText.replace(/'/g, '"'));
		Materialize.toast("Update Success", 2000);
		break;
	case "ping":
		sendCommand("pong", valueText);
		break;
	}
}

function getInput(id) {
	//Funktion aus dem Framework die ich nicht nutze
	return document.getElementById(id).value;
}

function sendCommand(p1, p2) {
	if (socketisOpen) {
		lg("Sent: " + p1 + ":" + p2);
		p1 = p1.substring(0, 4);
		websocket.send(p1 + ":" + p2);
	} else {
		writeToScreen('Fail: Not connected');
	}
}

function init() {
	//Initialisieren der Selects
	doConnect();
	$(document).ready(function() {
		$('select').material_select();
	});
	$(document).ready(function() {
		$('#player_gender').material_select();
	});

	$("#playerselect").on('change', function() {
		selectedPlayerToUpdate();
	});

}

function doConnect() {
	//stellt die websocket verbindung her
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
	//Wenn die websocket verbindung aufgebaut wurde
	socketisOpen = 1;
	writeToScreen("Info: Connection opened");
	clearInterval(intervalID);
	intervalID = 0;
	sendCommand("6002", "0");
}
function helper1() {
	sendCommand("6002", "0");
}
function onClose(evt) {
	//wenn die websocket verbindung geschlossen wurde
	socketisOpen = 0;
	if (!intervalID && !closedByUser) {
		intervalID = setInterval(doConnect, 2000);
	} else if (closedByUser) {
		closedByUser = 0;
	}
	writeToScreen("Info: Connection closed");
}

function onMessage(evt) {
	//Low level verarbeitung von servernachrichten
	console.log(evt.data);
	event(evt.data.substring(0, 4), evt.data.substring(5));
}

function onError(evt) {
	//wenn ein fehler mit der websocket verbindung auftritt
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
	//beendet die verbindung zum server
	socketisOpen = 0;
	closedByUser = 1;
	websocket.close();
}