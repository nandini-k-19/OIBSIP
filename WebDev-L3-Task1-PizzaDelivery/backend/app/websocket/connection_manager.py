import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger("pizzahub.websocket")

class ConnectionManager:
    def __init__(self):
        # Maps order_id (int) to list of connected WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, order_id: int, websocket: WebSocket):
        await websocket.accept()
        if order_id not in self.active_connections:
            self.active_connections[order_id] = []
        self.active_connections[order_id].append(websocket)
        logger.info(f"WebSocket connected for order {order_id}. Active listeners: {len(self.active_connections[order_id])}")

    def disconnect(self, order_id: int, websocket: WebSocket):
        if order_id in self.active_connections:
            if websocket in self.active_connections[order_id]:
                self.active_connections[order_id].remove(websocket)
            if not self.active_connections[order_id]:
                del self.active_connections[order_id]
        logger.info(f"WebSocket disconnected for order {order_id}")

    async def broadcast_order_update(self, order_id: int, data: dict):
        if order_id in self.active_connections:
            to_remove = []
            for connection in self.active_connections[order_id]:
                try:
                    await connection.send_json(data)
                except Exception as e:
                    logger.warning(f"Error sending WS update for order {order_id}: {e}")
                    to_remove.append(connection)
            for conn in to_remove:
                self.disconnect(order_id, conn)

ws_manager = ConnectionManager()
