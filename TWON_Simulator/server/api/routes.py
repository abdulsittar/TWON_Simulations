from fastapi import APIRouter
from server.state import simulation_running

router = APIRouter()

@router.get("/status")
def status():
    return {"running": simulation_running}
