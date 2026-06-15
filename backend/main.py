from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import requests

from services.risk_calculator import calcola_metriche_rischio

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
    

def fetch_data_from_extraetf_v2(isin: str):
    url = f"https://extraetf.com/api-v2/detail/?isin={isin}&extraetf_locale=it"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
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

    if is_etf_flag:
        totale_holdings = (etf_data.get("number_of_holding") or 
                           etf_data.get("number_of_stockholding") or 
                           etf_data.get("number_of_bondholding") or 0)
    else:
        totale_holdings = 1

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
                        "peso_percentuale": h.get("weight", 0),
                        "isin": h.get("isin", None)  # <--- ECCO LA RETROCOMPATIBILITÀ ESPANSA! Ora passiamo anche l'ISIN dell'azione
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

        holdings_pulite = [{"nome": nome.strip(), "peso_percentuale": 100.0, "isin": isin}] # Anche per azione singola mettiamo il suo isin

    return {
        "status": "success",
        "isin": isin,
        "tipo_asset": asset_class, 
        "nome": nome.strip(),
        "costo_annuo": costo_annuo,
        "totale_holdings": totale_holdings,
        "holdings": holdings_pulite,
        "regions": regions,
        "countries": countries,
        "sectors": sectors
    }

# NUOVO ENDPOINT V2: Il vecchio resta intatto, 
# chi vuole i codici ISIN delle singole holding interroga questo
@app.get("/api/v2/etf/{isin}")
def get_etf_data_v2(isin: str):
    try:
        return fetch_data_from_extraetf_v2(isin.strip().upper())
    except Exception as e:
        return {"status": "error", "message": f"Errore interno V2: {str(e)}"}
    
# Recupera i dati per una SINGOLA HOLDING (azione/obbligazione)
@app.get("/api/holding/{isin_holding}")
def get_holding_data(isin_holding: str):
    try:
        # Riutilizziamo la stessa funzione che sa come interrogare ExtraETF per un ISIN
        # ExtraETF restituisce dettagli sia per ETF che per azioni/obbligazioni singole
        return fetch_data_from_extraetf_v2(isin_holding.strip().upper())
    except Exception as e:
        return {"status": "error", "message": f"Errore nel recupero holding {isin_holding}: {str(e)}"}


# Only for debug
@app.get("/api/etf/{isin}/debug-holdings")
def debug_etf_holdings(isin: str):
    try:
        # Facciamo la stessa chiamata a ExtraETF per sicurezza
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

        # Prendiamo solo le prime 3 aziende per non intasare lo schermo
        # e vedere tutte le chiavi disponibili (ISIN, Ticker, ID, ecc.)
        return {
            "status": "success",
            "isin_analizzato": isin,
            "struttura_grezza_prime_3_holdings": holdings_raw[:3] 
        }
    except Exception as e:
        return {"status": "error", "message": f"Errore nel debug: {str(e)}"}
    


    # Usa l'API di ricerca di Yahoo Finance per convertire un ISIN in un Ticker.
def get_ticker_from_isin(isin: str):
    url = f"https://query2.finance.yahoo.com/v1/finance/search?q={isin}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            quotes = data.get("quotes", [])
            if quotes:
                # Ritorna il simbolo del primo risultato trovato
                return quotes[0].get("symbol")
    except Exception as e:
        print(f"Errore nella conversione ISIN->Ticker: {e}")        
    return None

@app.get("/api/holding-details/{isin}")
def get_detailed_holding_data(isin: str):
    try:
        # 1. Traduciamo l'ISIN in Ticker
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }
            
        # 2. Usiamo yfinance per recuperare tutti i dati fondamentali
        stock = yf.Ticker(ticker_symbol)
        info = stock.info
        
        # 3. Formattiamo i dati più importanti (ma info contiene decine di parametri in più)
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
            },
            # "raw_data": info  # <-- Decommenta questa riga se vuoi inviare al frontend TUTTO il JSON gigante di yfinance
        }
        
    except Exception as e:
        return {"status": "error", "message": f"Errore nel recupero dettagli: {str(e)}"}
    

@app.get("/api/holding-history/{isin}")
def get_holding_history(isin: str, period: str = "1y"):
    """
    Recupera la serie storica dei prezzi per una holding tramite ISIN.
    Il parametro 'period' accetta valori come: 1mo, 3mo, 6mo, 1y, 5y, max.
    """
    try:
        # 1. Traduciamo l'ISIN in Ticker usando la funzione definita in precedenza
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }
            
        # 2. Inizializziamo il ticker con yfinance
        stock = yf.Ticker(ticker_symbol)
        
        # 3. Recuperiamo la cronologia dei prezzi
        # period può essere: '1mo', '3mo', '6mo', '1y', '5y', 'max'
        hist = stock.history(period=period)
        
        if hist.empty:
            return {
                "status": "error", 
                "message": f"Nessun dato storico trovato per il periodo {period}"
            }
            
        # 4. Trasformiamo l'indice delle date in una colonna normale
        hist = hist.reset_index()
        
        # 5. Formattiamo i dati in una lista di dizionari (array di oggetti JSON)
        cronologia_pulita = []
        for _, row in hist.iterrows():
            # Estraiamo solo la data (YYYY-MM-DD) escludendo l'orario/fuso orario
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
            "andamento": cronologia_pulita  # <--- Questo array va dritto nel grafico del FE
        }
        
    except Exception as e:
        return {"status": "error", "message": f"Errore nel recupero della serie storica: {str(e)}"}
    


@app.get("/api/etf/{isin}/risk")
def get_etf_risk_analysis(isin: str):
    try:
        # 1. Traduciamo l'ISIN in Ticker (usando la funzione che avevi già scritto)
        ticker_symbol = get_ticker_from_isin(isin.strip().upper())
        
        if not ticker_symbol:
            return {
                "status": "error", 
                "message": f"Impossibile trovare un Ticker associato all'ISIN {isin}"
            }

        # 2. Richiamiamo il nostro calcolatore esterno
        # Di default calcola su uno storico di 3 anni ("3y")
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
    
