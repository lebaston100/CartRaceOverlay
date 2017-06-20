#This is a modification of https://github.com/dpallot/simple-websocket-server/blob/6e455f45b7ceb4ddfefb9e757fea7bc4403f84b8/SimpleWebSocketServer/SimpleExampleServer.py

from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
from tinydb import TinyDB, Query
from operator import itemgetter
import threading, time, json, ast, math

clients = []
ViewCount = 10
ActiveRound = 1
ActiveDriver = ""
ActAgecls = "1a"
db = TinyDB('db.json')

class Server(WebSocket):
    def handleMessage(self):
        global ActAgecls
        global ActiveDriver
        global ActiveRound
        cmd = self.data.split(":", 1)
        print(cmd)
        if cmd[0] == "6001":
            #anzahl der aktellen spieler in klasse
            #global ActAgecls
            tmp1 = len(db.search(Query()['ageclass'] == ActAgecls))
            for client in clients:
                client.sendMessage("6201:" + str(tmp1))
        elif cmd[0] == "6002":
            #komplette datenbank zusenden
            self.sendMessage("6303:" + str(db.all()))
        elif cmd[0] == "6003":
            #komplette datenbank zusenden
            tmp1 = sorted(db.all(), key=lambda x: int(itemgetter('startnumber')(x)))
            self.sendMessage("6303:" + str(tmp1))
        elif cmd[0] == "6004":
            #nur liste mit fahrern senden die noch keine zeit haben
            sendallUsersOnlyTimeEmpty()
        elif cmd[0] == "6005":
            #spieler aus db löschen
            cmd = cmd[1].split(":", 1)
            if cmd[1] == "423895729":
                print(db.remove(Query()["key"] == int(cmd[0])))
                self.sendMessage("6303:" + str(db.all()))
        elif cmd[0] == "6006" and cmd[1] == "786846375":
            #db leeren
            db.purge()
        elif cmd[0] == "6007" and cmd[1] == "68435638568256":
            #alle statistiken zurücksetzten
            print(db.update({"time1":"0", "time2":"0", "time_result":"0","penalty_time_1": "0", "penalty_time_2": "0","rank": "0"}, Query()["key"] != "new"))
        elif cmd[0] == "6008":
            tmp1 = db.search((Query()['ageclass'] == cmd[1])& (Query()['time1'] != "0") & (Query()['time2'] != "0") & (Query()['time_result'] != "0"))
            tmp1 = sorted(tmp1, key=lambda x: int(itemgetter('rank')(x)))
            for client in clients:
                client.sendMessage("6112:" + str(tmp1))
            for client in clients:
              if client != self:
                 client.sendMessage(self.data)
        elif cmd[0] == "6009":
            #kommentatoren ausgewählte klasse
            tmp1 = db.search(Query()['ageclass'] == cmd[1])
            tmp1 = sorted(tmp1, key=lambda x: int(itemgetter('startnumber')(x)))
            self.sendMessage("6301:" + str(tmp1))
        elif cmd[0] == "6010":
            #update ranks
            updateRanks()
            sendActiveUsersOnlyTimeFilledSortedByRank()
            sendOnlyCurrentDriverData()
        elif cmd[0] == "6011":
            sendOnlyCurrentDriverData()
            sendActiveUsersOnlyTimeFilledSortedByRank()
        elif cmd[0] == "6102":
            jdata = json.loads(cmd[1])
            if jdata.get("key") != "new":
                #datenbankeintrag updaten
                print(db.update(jdata, eids=[int(jdata["key"])]))
                for client in clients:
                    client.sendMessage("6303:" + str(db.all()))
                sendallUsersOnlyTimeEmpty()
            else:
                #neuen datenbankeintrag hinzufügen
                newID = db.insert(jdata)
                print(newID)
                jdata["key"] = str(newID)
                for client in clients:
                    client.sendMessage("6304:" + str(jdata))
                db.update({"key": newID}, eids=[newID])
                sendallUsersOnlyTimeEmpty()
        elif cmd[0] == "6104":
            cmd = cmd[1].split(":")
            if len(cmd) == 2:
                #strafzeit updaten
                if ActiveRound == 2:
                    print(db.update({"penalty_time_1": str(int(db.get(eid=int(cmd[0]))["penalty_time_1"]) + int(cmd[1]))}, eids=[int(cmd[0])]))
                elif ActiveRound == 3:
                    print(db.update({"penalty_time_2": str(int(db.get(eid=int(cmd[0]))["penalty_time_2"]) + int(cmd[1]))}, eids=[int(cmd[0])]))
                self.sendMessage("6106:" + str(db.get(eid=int(cmd[0]))))
        elif cmd[0] == "6105":
            #aktiven fahrer festlegen
            print("Aktiver Fahrer: " + cmd[1])
            #global ActiveDriver
            ActiveDriver = int(cmd[1])
            #global ActiveRound
            ActiveRound = 1
            sendOnlyCurrentDriverData()
        elif cmd[0] == "6106":
            #aktive altersklasse festlegen
            print("Aktive Altersklasse: " + cmd[1])
            ActAgecls = str(cmd[1])
            for client in clients:
              if client != self:
                 client.sendMessage("6111:" + ActAgecls)
            sendActiveUsersOnlyTimeFilledSortedByRank()
        elif cmd[0] == "6991":
            #neue zeit angekommen
            print("Aktive Runde " + str(ActiveRound))
            print("Aktiver Fahrer " + str(ActiveDriver))
            self.sendMessage("9ACK:" + str(cmd[1]))
            if ActiveRound == 2:
                print(db.update({"time1": str(cmd[1])}, eids=[int(ActiveDriver)]))
            elif ActiveRound == 3:
                print(db.update({"time2": str(cmd[1])}, eids=[int(ActiveDriver)]))
                time1 = TimeStrToMS(db.get(eid=int(ActiveDriver))["time1"])
                print(time1)
                time2 = TimeStrToMS(db.get(eid=int(ActiveDriver))["time2"])
                print(time2)
                ptt1 = int(db.get(eid=int(ActiveDriver))["penalty_time_1"])
                print(ptt1)
                ptt2 = int(db.get(eid=int(ActiveDriver))["penalty_time_2"])
                print(ptt2)
                timeresult = time1 + time2 + ptt1*1000 + ptt2*1000
                print(db.update({"time_result": TimeMsToStr(timeresult)}, eids=[int(ActiveDriver)]))
                updateRanks()
            ActiveRound += 1
            sendActiveUsersOnlyTimeFilledSortedByRank()
            sendOnlyCurrentDriverData()
            sendallUsersOnlyTimeEmpty()
        else:
            for client in clients:
              if client != self:
                 client.sendMessage(self.data)

    def handleConnected(self):
       print(self.address, 'connected') 
       clients.append(self)

    def handleClose(self):
       clients.remove(self)
       print(self.address, 'disconnected')

def updateRanks():
    tmp1 = db.search((Query()['ageclass'] == ActAgecls) & (Query()['time_result'] != "0"))
    tmp1 = sorted(tmp1, key=lambda x: TimeStrToMS(itemgetter('time_result')(x)))
    for i in range(0, len(tmp1)):
        db.update({"rank": str(i+1)}, eids=[int(tmp1[i]["key"])])
     
def sendOnlyCurrentDriverData():
    if ActiveDriver != "":
        qdata = str(db.get(eid=int(ActiveDriver)))
        for client in clients:
            client.sendMessage("6106:" + qdata)
        
def sendallUsersOnlyTimeEmpty():
    tmp1 = db.search((Query()['time1'] == "0") & (Query()['time2'] == "0") & (Query()['time_result'] == "0"))
    tmp1 = sorted(tmp1, key=lambda x: int(itemgetter('startnumber')(x)))
    for client in clients:
        client.sendMessage("6107:" + str(tmp1))

def sendActiveUsersOnlyAll():
    global ActAgecls
    tmp1 = str(db.search(Query()['ageclass'] == ActAgecls))
    for client in clients:
        client.sendMessage("6108:" + tmp1)

def sendActiveUsersOnlyTimeFilledSortedByRank():
    global ActAgecls
    tmp1 = db.search((Query()['ageclass'] == ActAgecls)& (Query()['time1'] != "0") & (Query()['time2'] != "0") & (Query()['time_result'] != "0"))
    tmp1 = sorted(tmp1, key=lambda x: int(itemgetter('rank')(x)))
    for client in clients:
        client.sendMessage("6110:" + str(tmp1))

def TimeMsToStr(ms):
    tm = math.floor(ms/60000)
    ts = math.floor((ms%60000)/1000)
    tms = math.floor((ms - (tm*60000) - (ts*1000))/10)
    if tm < 10:
        tm = "0" + str(tm)
    if ts < 10:
        ts = "0" + str(ts)
    if tms < 10:
        tms = "0" + str(tms)
    return str(tm) + ":" + str(ts) + "." + str(tms)

def TimeStrToMS(ts):
    split1 = ts.split(":", 2)
    split2 = split1[1].split(".", 2)
    tms = int(split2[1])
    ts = int(split2[0])
    tm = int(split1[0])
    time = tm*60000+ts*1000+tms*10
    return time

def startScheduleTask():
    while True:
        time.sleep(2)

def startServer():
    server.serveforever()

if __name__ == "__main__":
    server = SimpleWebSocketServer('', 8000, Server)
    threading.Thread(target=startServer).start()
    #threading.Thread(target=startScheduleTask).start()
