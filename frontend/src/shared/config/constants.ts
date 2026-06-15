/// <reference types="vite/client" />
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
export const SEARCH_ETF_API_URL = API_BASE_URL + "/api/etf";
export const HOLDING_DETAIL_API = API_BASE_URL + "/api/holding-details";
export const HOLDING_HISTORY_API = API_BASE_URL + "/api/holding-history";
