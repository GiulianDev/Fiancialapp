import requests

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
                return quotes[0].get("symbol")
    except Exception as e:
        print(f"Errore nella conversione ISIN->Ticker: {e}")        
    return None