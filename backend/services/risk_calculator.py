import pandas as pd
import numpy as np
import yfinance as yf

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