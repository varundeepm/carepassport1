export type ColType = 'numeric' | 'categorical' | 'datetime';
export type ChartSpec =
  | { type: 'histogram'; x: string }
  | { type: 'bar-mean-by-category'; x: string; cat: string }
  | { type: 'scatter'; x: string; y: string }
  | { type: 'line'; x: string; y: string; isTime: boolean }
  | { type: 'area'; x: string; y: string; isTime: boolean }
  | { type: 'pie'; cat: string };

const isDate = (v: string) => !isNaN(Date.parse(v));
const isNum = (v: any) => typeof v === 'number' || (typeof v === 'string' && v !== '' && v.toUpperCase?.() !== 'NA' && Number.isFinite(Number(v)));

export function inferTypes(rows: Record<string, any>[]) {
  const cols = Object.keys(rows[0] || {});
  const types: Record<string, ColType> = {};
  for (const c of cols) {
    const vals = rows.map(r => r[c]).filter(v => v != null && v !== '');
    const nNum = vals.filter(v => isNum(v)).length;
    const nDate = vals.filter(v => typeof v === 'string' && isDate(v)).length;
    if (nNum >= vals.length * 0.8) types[c] = 'numeric';
    else if (nDate >= vals.length * 0.8) types[c] = 'datetime';
    else types[c] = 'categorical';
  }
  return types;
}

export function useAutoViz(rows: Record<string, any>[]) {
  if (!rows?.length) return { types: {}, charts: [] as ChartSpec[] };
  const types = inferTypes(rows);
  const numeric = Object.keys(types).filter(k => types[k] === 'numeric');
  const categorical = Object.keys(types).filter(k => types[k] === 'categorical');
  const datetime = Object.keys(types).filter(k => types[k] === 'datetime');

  const charts: ChartSpec[] = [];

  // Distributions
  numeric.slice(0, 6).forEach(x => charts.push({ type: 'histogram', x }));

  // Comparisons by category
  if (categorical.length) {
    const cat = categorical[0];
    numeric.slice(0, 6).forEach(x => charts.push({ type: 'bar-mean-by-category', x, cat }));
    charts.push({ type: 'pie', cat });
  }

  // Relationships
  if (numeric.length >= 2) {
    charts.push({ type: 'scatter', x: numeric[0], y: numeric[1] });
  }

  // Time-series
  if (datetime.length && numeric.length) {
    charts.push({ type: 'line', x: datetime[0], y: numeric[0], isTime: true });
    charts.push({ type: 'area', x: datetime[0], y: numeric[0], isTime: true });
  }

  return { types, charts };
}


