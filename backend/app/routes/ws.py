from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import manager

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await manager.send_personal(websocket, "connected", {
            "message": "Connected to Emergency Dispatch System"
        })
        while True:
            data = await websocket.receive_text()
            await manager.send_personal(websocket, "echo", {"received": data})

    except WebSocketDisconnect:
        manager.disconnect(websocket)