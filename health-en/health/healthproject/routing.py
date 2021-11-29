from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from django.urls import path
from nursing import consumer

websocket_urlPattern = [
    path('ws/appData/', consumer.appConsumer.as_asgi()),
    path('ws/callData/', consumer.callConsumer.as_asgi()),
    path('ws/taskData/', consumer.taskConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(URLRouter(websocket_urlPattern))
})