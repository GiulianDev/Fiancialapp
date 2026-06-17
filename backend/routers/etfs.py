from fastapi import APIRouter
import requests
from services.extraetf_api import fetch_data_from_extraetf, fetch_data_from_extraetf_v2
from services.yfinance_api import get_ticker_from_isin
from services.risk_calculator import calcola_drawdown, calcola_metriche_rischio, calcola_sharpe, calcola_volatilita, calcola_beta

router = APIRouter(tags=["ETFs"])

@router.get("/api/etf/{isin}")
def get_etf_data_v2(isin: str):
    try:
        return fetch_data_from_extraetf_v2(isin.strip().upper())
    except Exception as e:
        return {"status": "error", "message": f"Errore interno V2: {str(e)}"}


# API endpoint per calcolare le metriche di rischio di un ETF dato il suo ISIN

@router.get("/api/etf/{isin}/risk/drawdown")
def get_drawdown(isin: str):
    try:
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }

        data = calcola_drawdown(ticker_symbol, period="3y")
        
        return {
            "status": "success",
            "isin": isin.upper(),
            "ticker": ticker_symbol,
            "periodo_analisi": "3 Anni",
            "data": data
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel calcolo del rischio: {str(e)}"}

@router.get("/api/etf/{isin}/risk/volatilita")
def get_volatilita(isin: str):
    try:
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }

        data = calcola_volatilita(ticker_symbol, period="3y")
        
        return {
            "status": "success",
            "isin": isin.upper(),
            "ticker": ticker_symbol,
            "periodo_analisi": "3 Anni",
            "data": data
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel calcolo del rischio: {str(e)}"}

@router.get("/api/etf/{isin}/risk/sharpe")
def get_sharpe_index(isin: str):
    try:
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }

        data = calcola_sharpe(ticker_symbol, period="3y")
        
        return {
            "status": "success",
            "isin": isin.upper(),
            "ticker": ticker_symbol,
            "periodo_analisi": "3 Anni",
            "data": data
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel calcolo del rischio: {str(e)}"}

@router.get("/api/etf/{isin}/risk/beta")
def get_beta(isin: str):
    try:
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }

        data = calcola_beta(ticker_symbol, period="3y")
        
        return {
            "status": "success",
            "isin": isin.upper(),
            "ticker": ticker_symbol,
            "periodo_analisi": "3 Anni",
            "data": data
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel calcolo del rischio: {str(e)}"}





# get all data
@router.get("/api/etf/{isin}/risk")
def get_etf_risk_analysis(isin: str):
    try:
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }

        metriche = calcola_metriche_rischio(ticker_symbol, period="3y")
        
        return {
            "status": "success",
            "isin": isin.upper(),
            "ticker": ticker_symbol,
            "periodo_analisi": "3 Anni",
            "dati_rischio": metriche
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel calcolo del rischio: {str(e)}"}
    

# DEBUG ONLY
@router.get("/api/etf/{isin}/debug-holdings")
def debug_etf_holdings(isin: str):
    try:
        url = f"https://extraetf.com/api-v2/detail/?isin={isin.strip().upper()}&extraetf_locale=it"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return {"status": "error", "message": f"Errore ExtraETF: {response.status_code}"}

        data = response.json()
        if not data.get("results"):
            return {"status": "error", "message": "Nessun asset trovato."}

        etf_data = data["results"][0]
        portfolio = etf_data.get("portfolio_breakdown", {})
        holdings_raw = portfolio.get("items", [])

        return {
            "status": "success",
            "isin_analizzato": isin,
            "struttura_grezza_prime_3_holdings": holdings_raw[:3] 
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel debug: {str(e)}"}
