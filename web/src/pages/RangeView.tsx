import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  parseISO,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import DailyLogForm from './DailyLogForm';
import TrendDashboard from './TrendDashboard';
import HistoryList from './HistoryList';
import type { TrendRange } from '../api/types';

const getDefaultDate = (range: TrendRange) => {
  const now = new Date();
  if (range === 'day') return format(now, 'yyyy-MM-dd');
  if (range === 'week') return format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  return format(startOfMonth(now), 'yyyy-MM-dd');
};

const RangeView = ({ range }: { range: TrendRange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = useMemo(() => searchParams.get('date') ?? getDefaultDate(range), [searchParams, range]);

  useEffect(() => {
    if (!searchParams.get('date')) {
      setSearchParams({ date: selectedDate }, { replace: true });
    }
  }, [searchParams, selectedDate, setSearchParams]);

  const handleDateChange = (value: string) => {
    setSearchParams({ date: value });
  };

  const shiftRange = (direction: 1 | -1) => {
    const base = parseISO(selectedDate);
    let next: Date;
    switch (range) {
      case 'day':
        next = addDays(base, direction);
        break;
      case 'week':
        next = addWeeks(base, direction);
        break;
      case 'month':
      default:
        next = addMonths(base, direction);
    }
    handleDateChange(format(next, 'yyyy-MM-dd'));
  };

  const formattedTitle = useMemo(() => {
    const date = parseISO(selectedDate);
    if (range === 'day') return format(date, 'PPPP');
    if (range === 'week') {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      return `${format(start, 'PP')} – ${format(end, 'PP')}`;
    }
    return format(date, 'LLLL yyyy');
  }, [range, selectedDate]);

  return (
    <div>
      <section className="section">
        <header className="filters">
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>{formattedTitle}</h1>
            <p>Navigate through your {range} records.</p>
          </div>
          <div className="filters" style={{ marginBottom: 0 }}>
            <button type="button" onClick={() => shiftRange(-1)}>
              Previous
            </button>
            <label>
              Reference date
              <input type="date" value={selectedDate} onChange={(event) => handleDateChange(event.target.value)} />
            </label>
            <button type="button" onClick={() => shiftRange(1)}>
              Next
            </button>
          </div>
        </header>
      </section>

      {range === 'day' && <DailyLogForm />}

      <TrendDashboard range={range} date={selectedDate} />
      <HistoryList range={range} date={selectedDate} />
    </div>
  );
};

export default RangeView;
