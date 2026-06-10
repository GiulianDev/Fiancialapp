/// <reference types="vite/client" />
export const API_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
export const SEARCH_ETF_API_URL = API_URL + "/api/v2/etf";
