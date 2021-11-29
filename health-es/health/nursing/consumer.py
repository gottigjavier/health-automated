from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .views import new_call, answ_call
from asgiref.sync import sync_to_async, asyncio


class appConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        #print(self.scope)
        self.groupname = 'appboard'
        await self.channel_layer.group_add(
            self.groupname,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.groupname,
            self.channel_name,
        )
        pass
        #await self.disconnect()

    async def receive(self, app_data):
        data = json.loads(app_data)
        all_data = data['all_data']
        await self.channel_layer.group_send(
            self.groupname,
            {
                'type': 'deprocessing',
                'all_data': all_data,
            }
        )

    async def deprocessing(self, event):
        all_app_data = event['all_data']
        await self.send(json.dumps(all_app_data))


class callConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        #print(self.scope)
        self.groupname = 'callsboard'
        await self.channel_layer.group_add(
            self.groupname,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.groupname,
            self.channel_name,
        )
        pass
        #await self.disconnect()

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['key'] == 'this&is$a$key&to?prevent?hacking':
            if data['state']:
                key = data['key']
                state = data['state']
                bed = data['bed']
                n_call = await sync_to_async(new_call)(bed)
                call = {
                    'key' : key,
                    'state' : state,
                    'bed' : bed,
                    'call': n_call
                }
            else:
                key = data['key']
                state = data['state']
                bed = data['bed']
                ans_call = await sync_to_async(answ_call)(bed)
                call = {
                    'key' : key,
                    'state' : state,
                    'bed' : bed,
                    'call' : ans_call
                }
            await self.channel_layer.group_send(
                self.groupname,
                {
                    'type': 'deprocessing',
                    'call': call
                }
            )
        else:
            print('Warning!!! Possible hacking!!')

    async def deprocessing(self, event):
        call = event['call']
        await self.send(json.dumps(call))


class taskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        #print(self.scope)
        self.groupname = 'tasksboard'
        await self.channel_layer.group_add(
            self.groupname,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.groupname,
            self.channel_name,
        )
        pass
        #await self.disconnect()

    async def receive(self, task_data):
        data = json.loads(task_data)
        tasks_and_beds = data['tasks_and_beds']
        await self.channel_layer.group_send(
            self.groupname,
            {
                'type': 'deprocessing',
                'tasks_and_beds': tasks_and_beds,
            }
        )

    async def deprocessing(self, event):
        tasks_beds = event['tasks_and_beds']
        await self.send(json.dumps(tasks_beds))