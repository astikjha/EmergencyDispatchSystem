from fastapi import WebSocket
import json


class ConnectionManager:
    _instance = None

    # Singleton — only one manager handles all connections
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        # List of all currently connected WebSocket clients
        self.active_connections: list[WebSocket] = []
        self._initialized = True

    async def connect(self, websocket: WebSocket):
        # Accept the connection and add to active list
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        # Remove client when they disconnect
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: dict):
        # Send a message to ALL connected clients
        # This is what makes it real-time — one event, everyone gets it
        message = json.dumps({
            "event": event_type,
            "data": data
        })

        # Loop through all connections and send
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # If sending fails, client probably disconnected unexpectedly
                disconnected.append(connection)

        # Clean up dead connections
        for conn in disconnected:
            self.disconnect(conn)

    async def send_personal(self, websocket: WebSocket, event_type: str, data: dict):
        # Send a message to ONE specific client
        message = json.dumps({
            "event": event_type,
            "data": data
        })
        await websocket.send_text(message)


# Single instance used across the entire app
manager = ConnectionManager()