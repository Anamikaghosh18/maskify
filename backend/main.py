from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
import os

app = FastAPI(title="Maskify", version="1.0.0")

# SQLite Setup
DB_PATH = "maskify.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS preferences 
                 (id INTEGER PRIMARY KEY, data TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Enable CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserPreferences(BaseModel):
    blur_strength: int = 12
    is_active: bool = True
    reveal_on_hover: bool = True

@app.get("/")
async def root():
    return {"status": "Maskify Production API", "version": "1.0.0"}

@app.get("/preferences")
async def get_preferences():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT data FROM preferences WHERE id = 1")
    row = c.fetchone()
    conn.close()
    
    if row:
        return json.loads(row[0])
    return UserPreferences()

@app.post("/preferences")
async def update_preferences(prefs: UserPreferences):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    data_json = prefs.json()
    c.execute("INSERT OR REPLACE INTO preferences (id, data) VALUES (1, ?)", (data_json,))
    conn.commit()
    conn.close()
    return {"message": "Preferences synced to cloud", "data": prefs}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
