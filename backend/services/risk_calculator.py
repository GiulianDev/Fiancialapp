import pandas as pd
import numpy as np
import yfinance as yf
import time

# Micro-cache in memoria per evitare di scaricare 4 volte di fila gli stessi dati
_cache_storico = {}

# Scarica lo storico una sola volta per poi calcolare le varie metriche
def _get_dati_storici(ticker_symbol: str, period: str = "3y"):
    """Scarica i dati storici una sola volta e li tiene in cache per 5 minuti."""
    now = time.time()
    
    # Se abbiamo già scaricato i dati da meno di 300 secondi (5 minuti), usiamo quelli
    if ticker_symbol in _cache_storico and (now - _cache_storico[ticker_symbol]['timestamp'] < 300):
        return _cache_storico[ticker_symbol]['hist'], _cache_storico[ticker_symbol]['info']
    
    stock = yf.Ticker(ticker_symbol)
    hist = stock.history(period=period)
    info = stock.info
    
    if hist.empty:
        raise ValueError(f"Dati storici insufficienti per {ticker_symbol}")
        
    # Salviamo in cache
    _cache_storico[ticker_symbol] = {'hist': hist, 'info': info, 'timestamp': now}
    return hist, info


def calcola_volatilita(ticker_symbol: str, period: str = "3y"):
    hist, _ = _get_dati_storici(ticker_symbol, period)
    rendimenti = hist['Close'].pct_change().dropna()
    volatilita_annua = rendimenti.std() * np.sqrt(252)
    return {"valore": round(volatilita_annua * 100, 2)}

def calcola_drawdown(ticker_symbol: str):
    hist, _ = _get_dati_storici(ticker_symbol)
    rendimenti = hist['Close'].pct_change().dropna()
    rendimenti_cumulati = (1 + rendimenti).cumprod()
    drawdown = (rendimenti_cumulati - rendimenti_cumulati.cummax()) / rendimenti_cumulati.cummax()
    return {"valore": round(drawdown.min() * 100, 2)}

def calcola_sharpe(ticker_symbol: str):
    hist, _ = _get_dati_storici(ticker_symbol)
    rendimenti = hist['Close'].pct_change().dropna()
    volatilita_annua = rendimenti.std() * np.sqrt(252)
    
    rendimenti_cumulati = (1 + rendimenti).cumprod()
    cagr = (1 + (rendimenti_cumulati.iloc[-1] - 1)) ** (1 / (len(hist) / 252)) - 1
    
    sharpe_ratio = (cagr - 0.02) / volatilita_annua if volatilita_annua > 0 else 0
    return {"valore": round(sharpe_ratio, 2)}

def calcola_beta(ticker_symbol: str):
    _, info = _get_dati_storici(ticker_symbol)
    beta = info.get("beta") or info.get("beta3Year") or info.get("threeYearAverageReturn")
    if isinstance(beta, (int, float)):
        return {"valore": round(beta, 2)}
    raise ValueError("Beta di mercato non disponibile")

# vecchia funzione monolitica
def calcola_metriche_rischio(ticker_symbol: str, period: str = "3y"):
    """
    Scarica lo storico dei prezzi e calcola le metriche di rischio.
    Usa pandas per calcoli vettoriali ultra-veloci.
    """
    stock = yf.Ticker(ticker_symbol)
    hist = stock.history(period=period)
    
    if hist.empty:
        raise ValueError(f"Nessun dato storico sufficiente per il ticker {ticker_symbol}")

    # 1. Calcolo dei rendimenti giornalieri (variazione % da un giorno all'altro)
    hist['Daily_Return'] = hist['Close'].pct_change()
    
    # Rimuoviamo i valori nulli (il primo giorno non ha un giorno precedente)
    rendimenti = hist['Daily_Return'].dropna()

    # 2. VOLATILITÀ ANNUA (Deviazione Standard)
    # Moltiplichiamo per la radice quadrata di 252 (i giorni medi di borsa aperta in un anno)
    volatilita_giornaliera = rendimenti.std()
    volatilita_annua = volatilita_giornaliera * np.sqrt(252)

    # 3. MAXIMUM DRAWDOWN (Peggior caduta dal picco massimo)
    rendimenti_cumulati = (1 + rendimenti).cumprod()
    picco_massimo = rendimenti_cumulati.cummax()
    drawdown = (rendimenti_cumulati - picco_massimo) / picco_massimo
    max_drawdown = drawdown.min()

    # 4. RENDIMENTO ANNUO MEDIO (CAGR)
    rendimento_totale = rendimenti_cumulati.iloc[-1] - 1
    anni_totali = len(hist) / 252
    cagr = (1 + rendimento_totale) ** (1 / anni_totali) - 1

    # 5. SHARPE RATIO
    # Assumiamo un tasso privo di rischio (Risk-Free Rate) del 2% (0.02)
    risk_free_rate = 0.02
    if volatilita_annua > 0:
        sharpe_ratio = (cagr - risk_free_rate) / volatilita_annua
    else:
        sharpe_ratio = 0.0

    # 6. BETA (Sensibilità al mercato)
    # yfinance spesso lo fornisce già calcolato nell'oggetto info. Se manca, fallback.
    info = stock.info
    beta = info.get("beta") or info.get("beta3Year") or info.get("threeYearAverageReturn")

    return {
        "volatilita_annua": round(volatilita_annua * 100, 2),
        "max_drawdown": round(max_drawdown * 100, 2),
        "rendimento_annuo_medio": round(cagr * 100, 2),
        "sharpe_ratio": round(sharpe_ratio, 2),
        "beta": round(beta, 2) if isinstance(beta, (int, float)) else "N/A"
    }




