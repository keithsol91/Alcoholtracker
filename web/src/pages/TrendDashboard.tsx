import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTrendData } from '../hooks/useTrendData';
import type { TrendRange } from '../api/types';

const windowOptions: Record<TrendRange, number[]> = {
  day: [1, 3, 5],
  week: [7, 14, 21],
  month: [30, 60, 90]
};

const TrendDashboard = ({ range, date }: { range: TrendRange; date?: string }) => {
  const [windowSize, setWindowSize] = useState(windowOptions[range][0]);
  useEffect(() => {
    setWindowSize(windowOptions[range][0]);
  }, [range]);
  const { data, isLoading, isError, refetch, isFetching } = useTrendData(range, date);

  const filteredPoints = useMemo(() => {
    if (!data) return [];
    return data.points.slice(-windowSize);
  }, [data, windowSize]);

  const summary = data?.summary;

  return (
    <section className="section">
      <header className="filters">
        <div>
          <h2>Trend Dashboard</h2>
          <p>Visualise drinks and cravings to understand patterns.</p>
        </div>
        <label>
          Time window
          <select value={windowSize} onChange={(event) => setWindowSize(Number(event.target.value))}>
            {windowOptions[range].map((option) => (
              <option key={option} value={option}>
                Last {option} days
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <div className="card-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <strong>Total drinks</strong>
          <p style={{ fontSize: '2rem', margin: 0 }}>{summary?.totalDrinks ?? '—'}</p>
        </div>
        <div className="card">
          <strong>Total calories</strong>
          <p style={{ fontSize: '2rem', margin: 0 }}>{summary?.totalCalories ?? '—'}</p>
        </div>
        <div className="card">
          <strong>Total cost</strong>
          <p style={{ fontSize: '2rem', margin: 0 }}>
            {summary ? `$${summary.totalCost.toFixed(2)}` : '—'}
          </p>
        </div>
        <div className="card">
          <strong>Avg craving intensity</strong>
          <p style={{ fontSize: '2rem', margin: 0 }}>
            {summary ? summary.averageCravingIntensity.toFixed(1) : '—'}
          </p>
        </div>
      </div>

      {isError && <p className="empty-state">Unable to load trend data. Please try again.</p>}
      {isLoading && <p className="empty-state">Loading trend data...</p>}

      {!isLoading && !isError && filteredPoints.length === 0 && (
        <p className="empty-state">No trend data available for the selected range yet.</p>
      )}

      {!isLoading && !isError && filteredPoints.length > 0 && (
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(parseISO(value), range === 'day' ? 'p' : 'MMM d')}
              />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
              <Tooltip
                labelFormatter={(value) => format(parseISO(value), 'PPPP')}
                formatter={(value: number, name) => {
                  if (name === 'drinks') return [value, 'Drinks'];
                  if (name === 'cravings') return [value, 'Cravings'];
                  if (name === 'calories') return [`${value} kcal`, 'Calories'];
                  if (name === 'cost') return [`$${value.toFixed(2)}`, 'Cost'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="drinks" stroke="#2563eb" strokeWidth={3} />
              <Line yAxisId="right" type="monotone" dataKey="cravings" stroke="#f97316" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default TrendDashboard;
