# Avvia server
uv run uvicorn main:app --reload


# Recupera informazioni via API tramite ExtraETF
# Questo ci permetterà di "vedere" dentro ExtraETF se qualcosa manca ancora
# "debug_portfolio_keys": list(portfolio.keys()),
# "debug_all_root_keys": list(etf_data.keys())


# --- SEZIONE DEBUG --- 
        # Questo ci permetterà di "vedere" dentro ExtraETF se qualcosa manca ancora
        "debug_portfolio_keys": list(portfolio.keys()),
        "debug_all_root_keys": list(etf_data.keys())



Quindi, ricapitolando:
Ovunque tu sia: Lancia 

        gcloud config set project financialapp-c7cf0.

Verifica: Lancia gcloud config list per confermare che il progetto sia stato impostato.

Vai nella cartella backend: cd percorso/della/tua/cartella/backend

Crea i file: Assicurati che main.py, requirements.txt e Dockerfile siano tutti dentro quella cartella.

Solo ora, da dentro quella cartella: Lancia 
        
        gcloud run deploy etf-backend --source .

- Service URL: 
        https://etf-backend-629230247075.europe-west3.run.app/