from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import ws_manager
import logging

logger = logging.getLogger("pizzahub.websocket")
router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/orders/{order_id}")
async def websocket_order_tracking(websocket: WebSocket, order_id: int):
    await ws_manager.connect(order_id, websocket)
    try:
        while True:
            # Keep the connection alive and listen for any ping/pong messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(order_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection exception for order {order_id}: {e}")
        ws_manager.disconnect(order_id, websocket)
