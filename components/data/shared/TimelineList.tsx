import { FC } from 'react';
import { ps } from './profileStyles';

export interface TimelineEvent {
  year: string;
  event: string;
}

interface TimelineListProps {
  events: TimelineEvent[];
  className?: string;
}

/**
 * Reusable left-border timeline component.
 * Accepts a normalized { year, event }[] array and renders using ps.timelineLine / ps.timelineDot.
 * Use everywhere a vertical timeline list is needed (profile Timeline tab, legislation key_actions, etc.)
 */
const TimelineList: FC<TimelineListProps> = ({ events, className = '' }) => (
  <div className={`${ps.timelineLine} space-y-5 ${className}`.trim()}>
    {events.map((ev, i) => (
      <div key={i} className="relative">
        <div className={ps.timelineDot} />
        <span className="text-xs font-semibold text-primary">{ev.year}</span>
        <p className={`${ps.body} mt-0.5 leading-relaxed`}>{ev.event}</p>
      </div>
    ))}
  </div>
);

export default TimelineList;
