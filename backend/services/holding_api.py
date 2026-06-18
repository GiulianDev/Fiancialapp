import yfinance as yf
import time
import threading # Aggiungi l'import per i Lock

# NB. yfinance fornisce i dati tutti insieme
# Per esporre i singoli fattori di rischio come microservizi sonos tati creati:
# - dei lock per evitare di scaricare più volte lo stesso storico in caso di richieste simultanee.
# - un sistema di cache in memoria per evitare di scaricare più volte lo stesso storico

# Micro-cache in memoria per evitare di scaricare 4 volte di fila gli stessi dati
_cache_storico = {}

# Dizionario per tenere traccia dei Lock per ogni singolo ticker
_locks_storico = {}
# Lock globale per proteggere la creazione dei lock individuali
_global_lock = threading.Lock()

def _get_lock_for_ticker(ticker_symbol: str):
    """Restituisce un Lock specifico per il ticker, creandolo se non esiste."""
    with _global_lock:
        if ticker_symbol not in _locks_storico:
            _locks_storico[ticker_symbol] = threading.Lock()
        return _locks_storico[ticker_symbol]

# Scarica lo storico una sola volta per poi calcolare le varie metriche
def _get_holding_info(ticker_symbol: str):
    """Scarica i dati storici una sola volta e li tiene in cache per 5 minuti."""
    now = time.time()
    
    # 1. Controllo ottimistico: restituisci SOLO 'info'
    if ticker_symbol in _cache_storico and (now - _cache_storico[ticker_symbol]['timestamp'] < 300):
        return _cache_storico[ticker_symbol]['info']
    
    # Recuperiamo il "semaforo" per questo specifico ticker
    ticker_lock = _get_lock_for_ticker(ticker_symbol)
    
    # Mettiamo in coda le altre richieste per questo ticker
    with ticker_lock:
        # 2. Quando è il nostro turno, ricontrolliamo! 
        now = time.time()
        if ticker_symbol in _cache_storico and (now - _cache_storico[ticker_symbol]['timestamp'] < 300):
            print(f"\nDati trovati in cache per {ticker_symbol} dopo l'attesa.\n")
            return _cache_storico[ticker_symbol]['info'] # <-- CORRETTO: solo info
        
        # 3. Se siamo i primi ad arrivare qui, scarichiamo davvero i dati
        print(f"\nScaricando dati storici per {ticker_symbol}...\n")
        stock = yf.Ticker(ticker_symbol)
        info = stock.info
        
        if not info:
            raise ValueError("Dati societari non restituiti da Yahoo Finance")
            
        # Salviamo in cache 
        _cache_storico[ticker_symbol] = {'info': info, 'timestamp': now}
        
        return info # <-- CORRETTO: restituisce il dizionario

def get_main_holding_info(ticker_symbol: str):
    info = _get_holding_info(ticker_symbol)
    return {
        "ticker": ticker_symbol,
        "nome": info.get("shortName") or info.get("longName"),
        "settore": info.get("sector", "Sconosciuto"),
        "industria": info.get("industry", "Sconosciuta"),
        "descrizione": info.get("longBusinessSummary"),
        "paese": info.get("country", "Sconosciuto"),
        "dipendenti": info.get("fullTimeEmployees")
    }

def get_holding_financial_data(ticker_symbol: str):
    info = _get_holding_info(ticker_symbol)
    return {
        "ticker": ticker_symbol,
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


