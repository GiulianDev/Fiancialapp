from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_data_from_extraetf(isin: str):
    url = f"https://extraetf.com/api-v2/detail/?isin={isin}&extraetf_locale=it"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        return {"status": "error", "message": f"Errore API ExtraETF. Status: {response.status_code}"}
        
    data = response.json()
    
    if not data.get("results"):
        return {"status": "error", "message": "Nessun asset finanziario compatibile trovato."}
        
    etf_data = data["results"][0]
    
    is_etf_flag = etf_data.get("is_etf", False) or etf_data.get("is_fund_of_funds", False)
    asset_class = etf_data.get("asset_class_name", "Sconosciuto")
    
    nome = (etf_data.get("fondname") or 
            etf_data.get("shortname") or 
            etf_data.get("name") or 
            "Nome Sconosciuto")
    
    costo_annuo = etf_data.get("ter") if is_etf_flag else 0.0
    
    # ESTRAZIONE DEL CONTATORE REALE DAL DATABASE
    if is_etf_flag:
        totale_holdings = (etf_data.get("number_of_holding") or 
                           etf_data.get("number_of_stockholding") or 
                           etf_data.get("number_of_bondholding") or 0)
    else:
        totale_holdings = 1 # Per le azioni singole è sempre 1

    portfolio = etf_data.get("portfolio_breakdown", {})
    holdings_pulite = []
    regions = {}
    countries = {}
    sectors = {}
    
    if is_etf_flag and portfolio:
        holdings_raw = portfolio.get("items", [])
        if isinstance(holdings_raw, list):
            for h in holdings_raw:
                if isinstance(h, dict):
                    holdings_pulite.append({
                        "nome": h.get("name", "Sconosciuto"),
                        "peso_percentuale": h.get("weight", 0)
                    })
        
        regions = (portfolio.get("region_stock_exposure") or portfolio.get("region_bond_exposure") or {})
        countries = (portfolio.get("country_stocks_exposure") or portfolio.get("country_bond_exposure") or {})
        sectors = (portfolio.get("global_stock_exposure") or portfolio.get("global_bond_exposure") or {})
                   
    else:
        singolo_paese = etf_data.get("land_name")
        singolo_settore = etf_data.get("sector_name")
        singola_regione = etf_data.get("region_name")
        
        if singolo_paese: countries = {singolo_paese: 100.0}
        if singolo_settore: sectors = {singolo_settore: 100.0}
        if singola_regione: regions = {singola_regione: 100.0}
            
        holdings_pulite = [{"nome": nome.strip(), "peso_percentuale": 100.0}]

    return {
        "status": "success",
        "isin": isin,
        "tipo_asset": asset_class, 
        "nome": nome.strip(),
        "costo_annuo": costo_annuo,
        "totale_holdings": totale_holdings,  # <--- Nuovo dato inviato al FE
        "holdings": holdings_pulite,
        "regions": regions,
        "countries": countries,
        "sectors": sectors
    }

@app.get("/api/etf/{isin}")
def get_etf_data(isin: str):
    try:
        return fetch_data_from_extraetf(isin.strip().upper())
    except Exception as e:
        return {"status": "error", "message": f"Errore interno: {str(e)}"}