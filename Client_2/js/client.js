var ip = "127.0.0.1";
var port = "8000";

var ViewCount = 0; // Kommt übers Netzwerk
var logoimages = new Array()

// //////////client///////////////////////////////////////////////////////////////

window.addEventListener("load", init, false);
var socketisOpen = 0;
var intervalID = 0;

var fadeframes = [ {
	opacity : "1"
}, {
	opacity : "0"
} ]
var timings_in = {
	duration : 500,
	iterations : 1,
	direction : "reverse",
	fill : "both",
	easing : "ease-in"
}
var timings_out = {
	duration : 500,
	iterations : 1,
	direction : "normal",
	fill : "both",
	easing : "ease-out"
}

function generateBox(json) {
	var fulllength = json.length;
	lg(json);
	content = "";
	document.getElementById("insertcontenthere").innerHTML = content;
	if (fulllength < 11) {
		for (i = 0; i < fulllength; i++) {
			if (i == 0) {
				content += "<div class=\"row\">";
				content += generatorHelper1(json[i]["rank"],
						json[i]["display_name"], json[i]["time_result"],
						parseInt(json[i]["penalty_time_1"])
								+ parseInt(json[i]["penalty_time_2"]));
				content += "</div>";
			} else {
				content += "<div class=\"row\">";
				content += generatorHelper2(json[i]["rank"],
						json[i]["display_name"], json[i]["time_result"],
						parseInt(json[i]["penalty_time_1"])
								+ parseInt(json[i]["penalty_time_2"]));
				content += "</div>";
			}
		}
		document.getElementById("insertcontenthere").innerHTML = content;
	} else {
		// Aufteilen
		var halfcount = json.length / 2;
		content += "<div class=\"row\"><div class=\"col s6\">";
		var x;
		document.getElementById("insertcontenthere").classList.remove('s4');
		document.getElementById("insertcontenthere").classList.remove('push-s4');
		document.getElementById("insertcontenthere").classList.add('push-s3');
		document.getElementById("insertcontenthere").classList.add('s6');
		for (i = 0; i < halfcount; i++) {
			if (i == 0) {
				content += "<div class=\"row\">";
				content += generatorHelper1(json[i]["rank"],
						json[i]["display_name"], json[i]["time_result"]);
				content += "</div>";
			} else {
				content += "<div class=\"row\">";
				timediff = getTimeDiff(json[i - 1]["time_result"], json[i]["time_result"]);
				content += generatorHelper2(json[i]["rank"],
						json[i]["display_name"], json[i]["time_result"], timediff);
				content += "</div>";
			}
			x = i + 1;
		}
		content += "</div><div class=\"col s6\">"; //Beende col 1 und starte neue
		//hier wird teil 2 genertiert
		for (i = x; i < fulllength; i++) {
			if (i == 0) {
				content += "<div class=\"row\">";
				content += generatorHelper1(json[i]["rank"],
						json[i]["display_name"], json[i]["time_result"]);
				content += "</div>";
			} else {
				content += "<div class=\"row\">";
				timediff = getTimeDiff(json[i - 1]["time_result"], json[i]["time_result"]);
				content += generatorHelper2(json[i]["rank"],
						json[i]["display_name"], json[i]["time_result"], timediff);
				content += "</div>";
			}
			x = i;
		}
		content += "</div>"; //beende row
		document.getElementById("insertcontenthere").innerHTML = content;
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
	case "6110":
		generateBox(JSON.parse(valueText.replace(/'/g, '"')));
		break;
	case "6112":
		generateBox(JSON.parse(valueText.replace(/'/g, '"')));
		break;
	case "6905":
		if (valueText == "0") {
			var animSenderlogo = document.getElementById("insertcontenthere")
					.animate(fadeframes, timings_out);
		} else if (valueText == "1") {
			var animSenderlogo = document.getElementById("insertcontenthere")
					.animate(fadeframes, timings_in);
		}

		break;
	case "ping":
		sendCommand("pong", valueText);
		break;
	}
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