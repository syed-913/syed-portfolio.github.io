import { useState } from 'react';
import type { VisitStats } from '../../types/analytics';

type Props = { days: VisitStats['last7Days'] };

const dateLabel = (date: string, full = false) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: full ? 'long' : 'short',
    ...(full ? { day: 'numeric', month: 'short' } as const : {}),
    timeZone: 'UTC',
  });

export function TrafficChart({ days }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const ceiling = Math.max(4, Math.ceil(Math.max(0, ...days.map(day => day.count)) / 4) * 4);
  const points = days.map((day, index) => ({
    ...day,
    x: days.length === 1 ? 50 : index / (days.length - 1) * 100,
    y: 100 - day.count / ceiling * 100,
  }));
  const selected = active === null ? null : points[active];

  if (!days.length) {
    return <div className="traffic-chart traffic-chart-empty" role="status">
      <p>No daily traffic data yet.</p>
      <span>The line will appear when pageviews are recorded.</span>
    </div>;
  }

  return <div className="traffic-chart" role="group" aria-label="Daily pageviews, last 7 days">
    <div className="traffic-chart-readout">
      <span>{selected ? dateLabel(selected.date, true) : 'Daily pageviews'}</span>
      <output aria-live="polite">
        {selected ? <><strong>{selected.count}</strong> {selected.count === 1 ? 'pageview' : 'pageviews'}</> : 'Select a day'}
      </output>
    </div>
    <div className="traffic-chart-plot">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {[0, 50, 100].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} className="traffic-chart-guide" vectorEffect="non-scaling-stroke" />)}
        {points.length > 1 && <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} className="traffic-chart-line" vectorEffect="non-scaling-stroke" />}
      </svg>
      {[ceiling, ceiling / 2, 0].map((value, index) => <span key={value} className="traffic-chart-tick" style={{ top: `${index * 50}%` }} aria-hidden="true">{value}</span>)}
      {points.map((point, index) => <button
        key={point.date}
        type="button"
        className={`traffic-chart-point ${active === index ? 'is-active' : ''}`}
        style={{ left: `${point.x}%`, top: `${point.y}%` }}
        aria-label={`${dateLabel(point.date, true)}: ${point.count} ${point.count === 1 ? 'pageview' : 'pageviews'}`}
        onFocus={() => setActive(index)}
        onBlur={() => setActive(null)}
        onPointerEnter={() => setActive(index)}
        onPointerLeave={event => { if (document.activeElement !== event.currentTarget) setActive(null); }}
        onClick={() => setActive(index)}
      ><span aria-hidden="true" /></button>)}
      {points.map(point => <span key={point.date} className="traffic-chart-date" style={{ left: `${point.x}%` }} aria-hidden="true">{dateLabel(point.date)}</span>)}
    </div>
  </div>;
}
