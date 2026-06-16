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
        
        if not info:
            raise ValueError("Dati societari non restituiti da Yahoo Finance")
        
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
            
        # ==================== RECUPERO VALUTA COMPATIBILE CON PYLANCE ====================
        valuta_rilevata = "USD"
        
        # 1. Tentativo sicuro tramite i metadati del DataFrame (introdotto nelle ultime versioni di yfinance)
        hist_metadata = getattr(hist, "metadata", None)
        if isinstance(hist_metadata, dict) and "currency" in hist_metadata:
            valuta_rilevata = hist_metadata["currency"]
        else:
            # 2. Tentativo dinamico tramite fast_info o basic_info usando getattr per evitare l'errore Pylance
            fast_info = getattr(stock, "fast_info", None)
            basic_info = getattr(stock, "basic_info", None)
            
            # Controlliamo fast_info (il dizionario nativo super veloce di yfinance)
            if fast_info:
                if isinstance(fast_info, dict) and "currency" in fast_info:
                    valuta_rilevata = fast_info["currency"]
                elif hasattr(fast_info, "currency"):
                    valuta_rilevata = getattr(fast_info, "currency", "USD")
            # Fallback su basic_info se presente in versioni alternative
            elif basic_info:
                if isinstance(basic_info, dict) and "currency" in basic_info:
                    valuta_rilevata = basic_info["currency"]
                elif hasattr(basic_info, "currency"):
                    valuta_rilevata = getattr(basic_info, "currency", "USD")
        # =================================================================================
            
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
            "valuta": valuta_rilevata,
            "andamento": cronologia_pulita
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel recupero della serie storica: {str(e)}"}