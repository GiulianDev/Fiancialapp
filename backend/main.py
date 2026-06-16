from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import etfs, holdings

app = FastAPI()

# 1. PRIMA REGISTRI IL MIDDLEWARE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:5173",  # Porta standard di Vite
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. DOPO INCLUDI I ROUTER
app.include_router(etfs.router)
app.include_router(holdings.router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "API Gateway is running safely."}