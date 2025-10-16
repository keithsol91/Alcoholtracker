import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useTrendData } from '../hooks/useTrendData';
import type { TrendRange } from '../api/types';

const HistoryList = ({ range, date }: { range: TrendRange; date?: string }) => {
  const { data, isLoading, isError } = useTrendData(range, date);
  const [minDrinks, setMinDrinks] = useState(0);
  const [maxCravings, setMaxCravings] = useState(10);

  const filteredPoints = useMemo(() => {
    if (!data) return [];
    return data.points.filter((point) => point.drinks >= minDrinks && point.cravings <= maxCravings);
  }, [data, minDrinks, maxCravings]);

  return (
    <section className="section">
      <header className="filters">
        <div>
          <h2>History</h2>
          <p>Browse your historical records with flexible filters.</p>
        </div>
        <label>
          Min drinks
          <input
            type="number"
            min={0}
            value={minDrinks}
            onChange={(event) => setMinDrinks(Number(event.target.value))}
          />
        </label>
        <label>
          Max cravings
          <input
            type="number"
            min={0}
            value={maxCravings}
            onChange={(event) => setMaxCravings(Number(event.target.value))}
          />
        </label>
      </header>

      {isLoading && <p className="empty-state">Loading history…</p>}
      {isError && <p className="empty-state">Unable to load history at the moment.</p>}

      {!isLoading && !isError && filteredPoints.length === 0 && (
        <p className="empty-state">No records match the selected filters.</p>
      )}

      {!isLoading && !isError && filteredPoints.length > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Drinks</th>
                <th>Cravings</th>
                <th>Calories</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredPoints.map((point) => (
                <tr key={point.date}>
                  <td>{format(parseISO(point.date), 'PP')}</td>
                  <td>{point.drinks}</td>
                  <td>{point.cravings}</td>
                  <td>{Math.round(point.calories)}</td>
                  <td>${point.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default HistoryList;
