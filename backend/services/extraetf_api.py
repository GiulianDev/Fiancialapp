import requests
import time
import threading

# Micro-cache in memoria per evitare chiamate ripetute a ExtraETF (validità 5 minuti)
_cache_extraetf = {}

# Dizionario per gestire i Lock sui singoli ISIN per richieste simultanee
_locks_extraetf = {}
# Lock globale per proteggere la creazione dei lock individuali
_global_extraetf_lock = threading.Lock()

def _get_lock_for_isin(isin: str):
    """Restituisce un Lock specifico per l'ISIN, creandolo se non esiste."""
    with _global_extraetf_lock:
        if isin not in _locks_extraetf:
            _locks_extraetf[isin] = threading.Lock()
        return _locks_extraetf[isin]

def sanitize_exposure_dict(exposure_dict):
    """
    Helper per pulire i dizionari di esposizione mantenendo il formato ORIGINALE della v2 (Dizionario puro).
    Sostituisce eventuali valori None con 0.0 per evitare il TypeError.
    """
    if not exposure_dict:
        return {}
    return {k: float(v) if v is not None else 0.0 for k, v in exposure_dict.items()}

def _get_extraetf_data(isin: str):
    """
    Funzione privata: Scarica i dati da ExtraETF, li parsa e li tiene in cache.
    Gestisce le richieste simultanee tramite Lock.
    """
    now = time.time()
    isin_upper = isin.strip().upper()
    
    # 1. Controllo ottimistico in cache
    if isin_upper in _cache_extraetf and (now - _cache_extraetf[isin_upper]['timestamp'] < 300):
        return _cache_extraetf[isin_upper]['data']
        
    # Recuperiamo il lock specifico per questo ISIN
    isin_lock = _get_lock_for_isin(isin_upper)
    
    # Coda per richieste parallele
    with isin_lock:
        # 2. Controllo post-attesa del lock
        now = time.time()
        if isin_upper in _cache_extraetf and (now - _cache_extraetf[isin_upper]['timestamp'] < 300):
            print(f"\nDati ExtraETF trovato in cache per {isin_upper} dopo l'attesa.\n")
            return _cache_extraetf[isin_upper]['data']
            
        # 3. Scaricamento reale
        print(f"\nScaricando dati da ExtraETF per {isin_upper}...\n")
        url = f"https://extraetf.com/api-v2/detail/?isin={isin_upper}&extraetf_locale=it"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            raise ValueError(f"Errore API ExtraETF. Status: {response.status_code}")

        res_json = response.json()
        if not res_json.get("results"):
            raise ValueError("Nessun asset finanziario compatibile trovato.")
            
        etf_data = res_json["results"][0]
        
        # --- LOGICA DI PARSING CENTRALIZZATA ---
        is_etf_flag = etf_data.get("is_etf", False) or etf_data.get("is_fund_of_funds", False)
        asset_class = etf_data.get("asset_class_name", "Sconosciuto")
        nome = (etf_data.get("fondname") or etf_data.get("shortname") or etf_data.get("name") or "Nome Sconosciuto")
        costo_annuo = etf_data.get("ter") if is_etf_flag else 0.0

        if is_etf_flag:
            totale_holdings = (etf_data.get("number_of_holding") or etf_data.get("number_of_stockholding") or etf_data.get("number_of_bondholding") or 0)
        else:
            totale_holdings = 1

        portfolio = etf_data.get("portfolio_breakdown", {})
        holdings_pulite = []
        raw_regions, raw_countries, raw_sectors = {}, {}, {}

        if is_etf_flag and portfolio:
            holdings_raw = portfolio.get("items", [])
            if isinstance(holdings_raw, list):
                for h in holdings_raw:
                    if isinstance(h, dict):
                        # Protezione aggiuntiva sul peso delle singole holdings
                        peso = h.get("weight")
                        holdings_pulite.append({
                            "nome": h.get("name", "Sconosciuto"),
                            "percentuale": float(peso) if peso is not None else 0.0,
                            "isin": h.get("isin", None)
                        })
            raw_regions = portfolio.get("region_stock_exposure") or portfolio.get("region_bond_exposure") or {}
            raw_countries = portfolio.get("country_stocks_exposure") or portfolio.get("country_bond_exposure") or {}
            raw_sectors = portfolio.get("global_stock_exposure") or portfolio.get("global_bond_exposure") or {}
        else:
            if etf_data.get("land_name"): raw_countries = {etf_data.get("land_name"): 100.0}
            if etf_data.get("sector_name"): raw_sectors = {etf_data.get("sector_name"): 100.0}
            if etf_data.get("region_name"): raw_regions = {etf_data.get("region_name"): 100.0}
            holdings_pulite = [{"nome": nome.strip(), "percentuale": 100.0, "isin": isin_upper}]

        # Salviamo in cache il dizionario con la struttura identica alla v2
        parsed_data = {
            "isin": isin_upper,
            "tipo_asset": asset_class,
            "nome": nome.strip(),
            "costo_annuo": costo_annuo,
            "totale_holdings": totale_holdings,
            "holdings": holdings_pulite,
            "regions": sanitize_exposure_dict(raw_regions),
            "countries": sanitize_exposure_dict(raw_countries),
            "sectors": sanitize_exposure_dict(raw_sectors)
        }

        _cache_extraetf[isin_upper] = {'data': parsed_data, 'timestamp': now}
        return parsed_data

# ===================================================================
# FUNZIONI SPECIFICHE PUBBLICHE (Espongono solo i dati richiesti)
# ===================================================================

def get_etf_base_info(isin: str):
    data = _get_extraetf_data(isin)
    return {
        "status": "success",
        "isin": data["isin"],
        "nome": data["nome"],
        "tipo_asset": data["tipo_asset"],
        "costo_annuo": data["costo_annuo"],
        "totale_holdings": data["totale_holdings"]
    }

def get_etf_holdings(isin: str):
    data = _get_extraetf_data(isin)
    return {"status": "success", "isin": data["isin"], "nome": data["nome"], "totale": data["totale_holdings"], "holdings": data["holdings"]}

def get_etf_countries(isin: str):
    data = _get_extraetf_data(isin)
    return {"status": "success", "isin": data["isin"], "nome": data["nome"], "countries": data["countries"]}

def get_etf_sectors(isin: str):
    data = _get_extraetf_data(isin)
    return {"status": "success", "isin": data["isin"], "nome": data["nome"], "sectors": data["sectors"]}

def get_etf_regions(isin: str):
    data = _get_extraetf_data(isin)
    return {"status": "success", "isin": data["isin"], "nome": data["nome"], "regions": data["regions"]}

def get_etf_full_data(isin: str):
    """Restituisce tutto l'oggetto completo in un'unica chiamata, con le stesse chiavi della fetch_data_from_extraetf_v2."""
    data = _get_extraetf_data(isin)
    return {"status": "success", **data}


# def format_exposure(exposure_dict):
#     if not exposure_dict:
#         return []
#     # Converte {"Italia": 10.5, "USA": 40.2} in [{"nome": "Italia", "peso": 10.5}, {"nome": "USA", "peso": 40.2}]
#     return [{"nome": k, "peso": float(v)} for k, v in exposure_dict.items()]


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
        "totale_holdings": totale_holdings,
        "holdings": holdings_pulite,
        "regions": regions,
        "countries": countries,
        "sectors": sectors
    }

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
                        "isin": h.get("isin", None)
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

        holdings_pulite = [{"nome": nome.strip(), "peso_percentuale": 100.0, "isin": isin}]

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


def fetch_data_from_extraetf_v3(isin: str):
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
    
    # Inizializziamo come dizionari temporanei
    raw_regions = {}
    raw_countries = {}
    raw_sectors = {}

    if is_etf_flag and portfolio:
        holdings_raw = portfolio.get("items", [])
        if isinstance(holdings_raw, list):
            for h in holdings_raw:
                if isinstance(h, dict):
                    holdings_pulite.append({
                        "nome": h.get("name", "Sconosciuto"),
                        "peso_percentuale": h.get("weight", 0),
                        "isin": h.get("isin", None)
                    })

        raw_regions = (portfolio.get("region_stock_exposure") or portfolio.get("region_bond_exposure") or {})
        raw_countries = (portfolio.get("country_stocks_exposure") or portfolio.get("country_bond_exposure") or {})
        raw_sectors = (portfolio.get("global_stock_exposure") or portfolio.get("global_bond_exposure") or {})

    else:
        singolo_paese = etf_data.get("land_name")
        singolo_settore = etf_data.get("sector_name")
        singola_regione = etf_data.get("region_name")

        if singolo_paese: raw_countries = {singolo_paese: 100.0}
        if singolo_settore: raw_sectors = {singolo_settore: 100.0}
        if singola_regione: raw_regions = {singola_regione: 100.0}

        holdings_pulite = [{"nome": nome.strip(), "peso_percentuale": 100.0, "isin": isin}]

    return {
        "status": "success",
        "isin": isin,
        "tipo_asset": asset_class, 
        "nome": nome.strip(),
        "costo_annuo": costo_annuo,
        "totale_holdings": totale_holdings,
        "holdings": holdings_pulite,
        # 🎯 Usiamo l'helper per restituire direttamente Array di Oggetti
        "regions": format_exposure(raw_regions),
        "countries": format_exposure(raw_countries),
        "sectors": format_exposure(raw_sectors)
    }


