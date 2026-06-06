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