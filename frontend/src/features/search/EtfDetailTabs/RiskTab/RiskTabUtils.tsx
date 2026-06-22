// Definisce i colori da mostrare in base alvalore per l'indice considerato

export function  getVolatilitaColor(val: number) {
  if (val < 10) return 'text-green-400'; // Rischio basso
  if (val <= 20) return 'text-blue-400'; // Rischio medio / Mercato azionario standard
  return 'text-red-400';                 // Rischio alto
};

export function  getSharpeColor(val: number) {
  if (val >= 1) return 'text-green-400'; // Ottimo rendimento corretto per il rischio
  if (val >= 0) return 'text-blue-400';  // Positivo ma migliorabile
  return 'text-red-400';                 // Il rischio preso non è stato ripagato
};

export function  getDrawdownColor(val: number) {
  // Il drawdown è solitamente un valore negativo (es: -25%)
  if (val >= -15) return 'text-green-400'; // Tenuta forte nelle crisi
  if (val >= -30) return 'text-blue-400';  // Crollo fisiologico di mercato
  return 'text-red-400';                   // Crollo grave
};

export function  getBetaColor(val: number) {
  if (val < 0.8) return 'text-green-400';  // Difensivo, oscilla meno del mercato
  if (val <= 1.2) return 'text-blue-400';  // Neutro, si muove in tandem col mercato
  return 'text-red-400';                   // Aggressivo, amplifica i movimenti
};

