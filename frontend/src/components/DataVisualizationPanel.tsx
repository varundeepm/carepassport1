import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ScatterChart, Scatter, CartesianGrid, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { useAutoViz, ChartSpec } from '../hooks/useAutoViz';

type Row = Record<string, any>;

type DataVisualizationPanelProps = {
  title?: string;
  initialCsvText?: string;
  hideUploader?: boolean;
};

const parseCSV = (text: string): Row[] => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headerLine = lines[0].replace(/^\s*\|/, '');
  const headers = headerLine.split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const clean = line.replace(/^\s*\|/, '');
    const cols = clean.split(',').map(c => c.trim());
    const obj: any = {};
    headers.forEach((h, i) => {
      const v = cols[i] ?? '';
      obj[h] = v?.toUpperCase?.() === 'NA' || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : v);
    });
    return obj as Row;
  });
};

const binsFor = (vals: number[], binCount = 8) => {
  if (!vals.length) return [] as any[];
  const min = Math.min(...vals), max = Math.max(...vals);
  const width = (max - min) || 1;
  const step = width / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    key: `${(min + i * step).toFixed(1)}–${(min + (i + 1) * step).toFixed(1)}`,
    from: min + i * step,
    to: min + (i + 1) * step,
    count: 0,
  }));
  vals.forEach(v => {
    let idx = Math.floor((v - min) / step);
    if (idx >= binCount) idx = binCount - 1;
    bins[idx].count += 1;
  });
  return bins;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];

const DataVisualizationPanel: React.FC<DataVisualizationPanelProps> = ({ title = 'Auto Visualization', initialCsvText, hideUploader }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const { charts } = useAutoViz(rows);

  useEffect(() => {
    if (initialCsvText) {
      try {
        const parsed = parseCSV(initialCsvText);
        setRows(parsed);
      } catch (_) {
        // ignore parse errors; UI will show empty state
      }
    }
  }, [initialCsvText]);

  // Build combined summaries across all numeric columns
  const numericCols = React.useMemo(() => {
    if (!rows.length) return [] as string[];
    const keys = Object.keys(rows[0]);
    return keys.filter(k => rows.some(r => typeof r[k] === 'number'));
  }, [rows]);

  const metricsMeanData = React.useMemo(() => {
    return numericCols.map(k => {
      const vals = rows.map(r => r[k]).filter((v: any) => typeof v === 'number') as number[];
      const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { metric: k, mean };
    });
  }, [rows, numericCols]);

  const metricsCountData = React.useMemo(() => {
    return numericCols.map(k => {
      const count = rows.filter(r => typeof r[k] === 'number').length;
      return { metric: k, count };
    });
  }, [rows, numericCols]);

  const onFile = async (f: File) => {
    const text = await f.text();
    const parsed = parseCSV(text);
    setRows(parsed);
  };

  const renderChart = (spec: ChartSpec, idx: number) => {
    switch (spec.type) {
      case 'histogram': {
        const vals = rows.map(r => r[spec.x]).filter((v: any) => v != null && typeof v === 'number');
        const data = binsFor(vals, 8);
        return (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="subtitle2">{`Histogram: ${spec.x}`}</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" angle={-25} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      }
      case 'bar-mean-by-category': {
        const groups: Record<string, number[]> = {};
        rows.forEach(r => {
          const cat = r[spec.cat];
          const v = r[spec.x];
          if (cat == null || v == null || typeof v !== 'number') return;
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(v);
        });
        const data = Object.entries(groups).map(([k, arr]) => ({
          [spec.cat]: k,
          mean: arr.reduce((a, b) => a + b, 0) / arr.length,
        }));
        return (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="subtitle2">{`Mean ${spec.x} by ${spec.cat}`}</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={spec.cat} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mean" fill={COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      }
      case 'scatter': {
        const data = rows
          .map(r => ({ x: r[spec.x], y: r[spec.y] }))
          .filter(p => typeof p.x === 'number' && typeof p.y === 'number');
        return (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="subtitle2">{`Scatter: ${spec.x} vs ${spec.y}`}</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name={spec.x} />
                <YAxis type="number" dataKey="y" name={spec.y} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Points" data={data} fill={COLORS[2]} />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        );
      }
      case 'line':
      case 'area': {
        const x = spec.x, y = spec.y;
        const data = rows
          .map(r => ({ x: r[x], y: r[y] }))
          .filter(d => (typeof d.x === 'number') && (typeof d.y === 'number'));
        const ChartC: any = spec.type === 'line' ? LineChart : AreaChart;
        const Series: any = spec.type === 'line' ? Line : Area;
        return (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="subtitle2">{`${spec.type === 'line' ? 'Line' : 'Area'}: ${y} over ${x}`}</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <ChartC data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                {spec.type === 'line'
                  ? <Series type="monotone" dataKey="y" stroke={COLORS[3]} dot={false} />
                  : <Series type="monotone" dataKey="y" stroke={COLORS[4]} fill={COLORS[4]} />}
              </ChartC>
            </ResponsiveContainer>
          </Box>
        );
      }
      case 'pie': {
        const counts: Record<string, number> = {};
        rows.forEach(r => { const k = r[spec.cat]; if (k != null) counts[k] = (counts[k] || 0) + 1; });
        const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
        return (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="subtitle2">{`Distribution of ${spec.cat}`}</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {!hideUploader && (
        <Button component="label" variant="outlined" size="small">
          Upload CSV
          <input hidden type="file" accept=".csv,text/csv" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }} />
        </Button>
      )}
      {/* Combined overview across all numeric labels */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Overall Metrics Summary (Mean)</Typography>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={metricsMeanData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" angle={-25} textAnchor="end" height={50} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="mean" name="Mean" fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Overall Metrics Coverage (Non-null Count)</Typography>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={metricsCountData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" angle={-25} textAnchor="end" height={50} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" name="Count" fill={COLORS[1]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box>
        {charts.map((spec, i) => renderChart(spec, i))}
        {!charts.length && (
          <Typography variant="body2" color="text.secondary">
            {hideUploader ? 'No CSV found for visualization.' : 'Upload a CSV to see auto-generated visuals.'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DataVisualizationPanel;


