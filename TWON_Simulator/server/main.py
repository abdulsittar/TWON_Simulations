import uvicorn
from fastapi import FastAPI
from server.api.socket import sio
from server.api.routes import router

app = FastAPI()
app.include_router(router)
socket_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=1071)
