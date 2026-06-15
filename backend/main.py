from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importazione dei router architettati
from routers import etfs, holdings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrazione dei router nel ciclo vitale dell'applicazione
app.include_router(etfs.router)
app.include_router(holdings.router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "API Gateway is running safely."}
