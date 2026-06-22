/// <reference types="vite/client" />
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
export const SEARCH_ETF_API_URL = API_BASE_URL + "/api/etf";
export const ETF_INFO_API = API_BASE_URL + "/api/etf";

/**
 * HOLDING API
 */
// details
export const HOLDING_DETAIL_API = API_BASE_URL + "/api/holding/details";
export const HOLDING_MAIN_DETAIL_API = HOLDING_DETAIL_API + "/main";
export const HOLDING_FINANCIAL_DETAIL_API = HOLDING_DETAIL_API + "/financial";
export const HOLDING_FULL_API = API_BASE_URL + "/api/holding-full";
// history
export const HOLDING_HISTORY_API = API_BASE_URL + "/api/holding/history";
