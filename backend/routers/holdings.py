from fastapi import APIRouter
import yfinance as yf
from services.extraetf_api import fetch_data_from_extraetf_v2
from services.yfinance_api import get_ticker_from_isin

router = APIRouter(tags=["Holdings"])

@router.get("/api/holding/{isin_holding}")
def get_holding_data(isin_holding: str):
    try:
        return fetch_data_from_extraetf_v2(isin_holding.strip().upper())
    except Exception as e:
        return {"status": "error", "message": f"Errore nel recupero holding {isin_holding}: {str(e)}"}

@router.get("/api/holding-details/{isin}")
def get_detailed_holding_data(isin: str):
    try:
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }
            
        stock = yf.Ticker(ticker_symbol)
        info = stock.info
        
        return {
            "status": "success",
            "isin": isin,
            "ticker": ticker_symbol,
            "nome": info.get("shortName") or info.get("longName"),
            "settore": info.get("sector", "Sconosciuto"),
            "industria": info.get("industry", "Sconosciuta"),
            "paese": info.get("country", "Sconosciuto"),
            "dipendenti": info.get("fullTimeEmployees"),
            "descrizione": info.get("longBusinessSummary"),
            "dati_finanziari": {
                "prezzo_attuale": info.get("currentPrice"),
                "valuta": info.get("currency"),
                "market_cap": info.get("marketCap"),
                "pe_ratio_trailing": info.get("trailingPE"),
                "pe_ratio_forward": info.get("forwardPE"),
                "dividendo_yield_percentuale": info.get("dividendYield", 0) * 100 if info.get("dividendYield") else 0,
                "margine_profitto": info.get("profitMargins"),
                "revenue_crescita": info.get("revenueGrowth"),
                "ebitda": info.get("ebitda")
            }
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel recupero dettagli: {str(e)}"}

@router.get("/api/holding-history/{isin}")
def get_holding_history(isin: str, period: str = "1y"):
    try:
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }
            
        stock = yf.Ticker(ticker_symbol)
        hist = stock.history(period=period)
        
        if hist.empty:
            return {
                "status": "error", 
                "message": f"Nessun dato storico trovato per il periodo {period}"
            }
            
        hist = hist.reset_index()
        
        cronologia_pulita = []
        for _, row in hist.iterrows():
            data_str = row['Date'].strftime('%Y-%m-%d') if hasattr(row['Date'], 'strftime') else str(row['Date'])[:10]
            
            cronologia_pulita.append({
                "data": data_str,
                "prezzo": round(row['Close'], 2),
                "volume": int(row['Volume'])
            })
            
        return {
            "status": "success",
            "isin": isin,
            "ticker": ticker_symbol,
            "periodo_selezionato": period,
            "valuta": stock.info.get("currency", "USD"),
            "andamento": cronologia_pulita
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel recupero della serie storica: {str(e)}"}