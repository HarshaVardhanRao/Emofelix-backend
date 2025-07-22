from fastapi import FastAPI, Header, HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware
from pydantic import BaseModel
import random
import asyncio

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS Configuration ---
# This allows your Django app (running on http://127.0.0.1:8000)
# to make requests to this FastAPI server.
origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)


# --- Pydantic Models for Request/Response ---
class ChatRequest(BaseModel):
    user_id: int
    message: str
    relation_type: str = "friend"

# --- Security Setup ---
api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

async def get_api_key(api_key: str = Security(api_key_header)):
    if not api_key or not api_key.startswith("Token "):
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return api_key

# --- Simulated AI Emotional Response Model ---
def get_emotional_response(message: str, relation_type: str) -> tuple[str, str]:
    message = message.lower()
    emotion = "neutral"
    response = "I'm not sure how to respond to that."
    if "sad" in message or "upset" in message:
        emotion = "empathetic"
        response = "I'm so sorry you're feeling that way. It's okay to be sad, and I'm here to listen without judgment."
    elif "happy" in message or "great" in message or "excited" in message:
        emotion = "joyful"
        response = "That is absolutely wonderful to hear! I'm so happy for you. Tell me more about it."
    elif "angry" in message or "frustrated" in message:
        emotion = "calm"
        response = "It sounds like you're really frustrated. Let's take a deep breath together. I'm here to help you work through this."
    return response, emotion

# --- Streaming Chat Generator ---
async def stream_chat_generator(message: str, relation_type: str):
    """
    Simulates an AI model generating a response word by word.
    """
    full_response, _ = get_emotional_response(message, relation_type)
    words = full_response.split()
    for word in words:
        # This is the Server-Sent Event (SSE) format
        yield f"data: {word}\n\n"
        await asyncio.sleep(0.1) # Simulate time between words

# --- API Endpoints ---
@app.post("/chat/stream")
async def stream_chat(request: ChatRequest, token: str = Depends(get_api_key)):
    """
    New endpoint for streaming chat responses.
    """
    return StreamingResponse(stream_chat_generator(request.message, request.relation_type), media_type="text/event-stream")

@app.get("/")
def read_root():
    return {"message": "FastAPI service for Emofelix is running."}
