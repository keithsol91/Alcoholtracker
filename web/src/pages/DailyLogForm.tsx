import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { submitDailyLog } from '../api/logs';
import type { DrinkEntry, CravingEntry, DailyLogPayload } from '../api/types';
import { invalidateTrendCache } from '../api/trends';

const defaultDrink = (): DrinkEntry => ({
  beverage: '',
  quantity: 1,
  abv: 5,
  calories: 150,
  cost: 5
});

const defaultCraving = (): CravingEntry => ({
  intensity: 5,
  triggers: ''
});

type DailyLogFormProps = {
  selectedDate?: string;
  onDateChange?: (value: string) => void;
};

const DailyLogForm = ({ selectedDate, onDateChange }: DailyLogFormProps) => {
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const [date, setDate] = useState(selectedDate ?? today);
  const [drinks, setDrinks] = useState<DrinkEntry[]>([defaultDrink()]);
  const [cravings, setCravings] = useState<CravingEntry[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: (payload: DailyLogPayload) => submitDailyLog(payload),
    onSuccess: (_, variables) => {
      invalidateTrendCache();
      setDrinks([defaultDrink()]);
      setCravings([]);
      setNotes('');
      setDate(variables.date);
      onDateChange?.(variables.date);
    }
  });

  const handleDrinkChange = (index: number, field: keyof DrinkEntry, value: string | number) => {
    setDrinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: field === 'beverage' ? value : Number(value) };
      return next;
    });
  };

  const handleCravingChange = (index: number, field: keyof CravingEntry, value: string | number) => {
    setCravings((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'triggers' ? value : Number(value)
      };
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: DailyLogPayload = {
      date,
      drinks: drinks.filter((drink) => drink.beverage.trim().length > 0),
      cravings: cravings.filter((craving) => craving.intensity > 0),
      notes: notes.trim() || undefined
    };
    await mutateAsync(payload);
  };

  return (
    <div className="section">
      <h2>Daily Log</h2>
      <p>Capture your alcohol intake and cravings to monitor patterns over time.</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="log-date">Log Date</label>
          <input
            id="log-date"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              onDateChange?.(event.target.value);
            }}
            max={today}
          />
        </div>

        <div className="form-group">
          <header>
            <strong>Drinks</strong>
          </header>
          {drinks.map((drink, index) => (
            <div key={index} className="card" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Beverage</label>
                <input
                  value={drink.beverage}
                  onChange={(event) => handleDrinkChange(index, 'beverage', event.target.value)}
                  placeholder="Beer, Wine, Cocktail..."
                  required
                />
              </div>
              <div className="filters">
                <label>
                  Quantity (servings)
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={drink.quantity}
                    onChange={(event) => handleDrinkChange(index, 'quantity', event.target.value)}
                  />
                </label>
                <label>
                  ABV %
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={drink.abv}
                    onChange={(event) => handleDrinkChange(index, 'abv', event.target.value)}
                  />
                </label>
                <label>
                  Calories
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={drink.calories}
                    onChange={(event) => handleDrinkChange(index, 'calories', event.target.value)}
                  />
                </label>
                <label>
                  Cost ($)
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={drink.cost}
                    onChange={(event) => handleDrinkChange(index, 'cost', event.target.value)}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDrinks((prev) => prev.filter((_, drinkIndex) => drinkIndex !== index))
                }
                disabled={drinks.length === 1}
                style={{ background: '#e12d39' }}
              >
                Remove drink
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setDrinks((prev) => [...prev, defaultDrink()])}>
            Add drink
          </button>
        </div>

        <div className="form-group">
          <header>
            <strong>Cravings</strong>
          </header>
          {cravings.length === 0 && <p className="empty-state">No cravings recorded yet.</p>}
          {cravings.map((craving, index) => (
            <div key={index} className="card" style={{ marginBottom: '1rem' }}>
              <div className="filters">
                <label>
                  Intensity (1-10)
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={craving.intensity}
                    onChange={(event) => handleCravingChange(index, 'intensity', event.target.value)}
                  />
                </label>
                <label>
                  Triggers
                  <input
                    type="text"
                    value={craving.triggers ?? ''}
                    onChange={(event) => handleCravingChange(index, 'triggers', event.target.value)}
                    placeholder="Stress, social event..."
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCravings((prev) => prev.filter((_, cravingIndex) => cravingIndex !== index))
                }
                style={{ background: '#e12d39' }}
              >
                Remove craving
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setCravings((prev) => [...prev, defaultCraving()])}>
            Add craving
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="How did you feel today? Any observations?"
          />
        </div>

        <button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save daily log'}
        </button>
        {isSuccess && (
          <p className="badge" style={{ marginTop: '0.5rem' }}>
            Log saved for {format(parseISO(date), 'PP')}!
          </p>
        )}
      </form>
    </div>
  );
};

export default DailyLogForm;
