import sys, os
import asyncio

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server.socket_manager import ConnectionManager

class FakeWebSocket:
    """A simple websocket mock that records sent messages."""

    def __init__(self):
        self.sent = []

    async def send_json(self, data):
        self.sent.append(data)


def test_broadcast_sends_to_all_connections():
    async def run_test():
        manager = ConnectionManager()
        ws1 = FakeWebSocket()
        ws2 = FakeWebSocket()
        ws3 = FakeWebSocket()

        manager.active_connections = {
            "1": ws1,
            "2": ws2,
            "3": ws3,
        }

        payload = {"msg": "hello"}
        await manager.broadcast(payload)

        assert ws1.sent == [payload]
        assert ws2.sent == [payload]
        assert ws3.sent == [payload]

    asyncio.run(run_test())
