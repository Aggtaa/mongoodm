from urllib.parse import urljoin
from urllib.request import urlopen, Request
import json
import re
from datetime import datetime

serverUrl = "http://10.0.64.7:37082"
apiKey = "oLFWGjDwpZiFYdTWUETEoJtZ59m7pHLq"

watchFolders = dict({
    'camera': {
        url: "http://10.0.64.7/????"
    }
})

querySize = 100
lastSeenId = 0

def getEvents():
    global lastSeenId

    req = Request(
        urljoin(serverUrl, f'/rest/events?since={lastSeenId}'), 
        headers = {'X-API-Key': apiKey}
    )
    response = urlopen(req)
    records = json.load(response)

    events = []

    for record in records:
        id = record['id']
        lastSeenId = id
        
        # syncthing sends time ALMOST in ISO8601.
        # trim microseconds so that we can parse it
        time = re.sub(r'(\.\d{6})\d*', '\1', record['time'])
        time = datetime.fromisoformat(time)

        type = record['type']
        data = record['data']
        if 'folder' in data and data['folder'] in watchFolders:
            data['event'] = type
            event = {
                'id': id, 
                'time': time, 
                'folder': data['folder'], 
                'data': data, 
            }

            if type in ['FolderCompletion']:
                event['event'] = 'folder'
                event['source'] = data['device']
                events.append(event)
            elif type in ['ItemFinished']:
                event['event'] = 'file'
                event[data['type']] = data['item']
                events.append(event)

    return events

while 1:
    events = getEvents()
    for event in events:
        print(f'[{datetime.strftime(event["time"], "%c")}] {event["event"]} {event["folder"]}/{event["file"] if "file" in event else ""}')
        print(event["data"])
        # print(f'{event["id"]} [{event["time"]}] {event["folder"]}::{event["file"]} {event["event"]} {event["data"]}')
