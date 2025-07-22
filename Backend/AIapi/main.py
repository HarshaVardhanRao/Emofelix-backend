# In your FastAPI app
import httpx

DJANGO_API_URL = "http://localhost:8000/api/"
USER_AUTH_TOKEN = "your_user_auth_token_here" 

headers = {
    "Authorization": f"Token {USER_AUTH_TOKEN}"
}

async def get_user_relations():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DJANGO_API_URL}relations/", headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            # Handle error
            return {"error": "Could not fetch relations"}