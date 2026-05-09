from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Maskify API", version="1.0.0")

# Enable CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserPreferences(BaseModel):
    blur_strength: int = 10
    enabled_platforms: List[str] = ["whatsapp", "slack", "discord", "teams", "meet"]
    is_active: bool = True
    reveal_on_hover: bool = True

# Mock database
db = {
    "preferences": UserPreferences()
}

@app.get("/")
async def root():
    return {"status": "Maskify API is running", "version": "1.0.0"}

@app.get("/preferences")
async def get_preferences():
    return db["preferences"]

@app.post("/preferences")
async def update_preferences(prefs: UserPreferences):
    db["preferences"] = prefs
    return {"message": "Preferences updated successfully", "data": db["preferences"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
