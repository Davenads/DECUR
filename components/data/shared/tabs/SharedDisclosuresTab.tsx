import { FC } from 'react';
import { ps } from '../profileStyles';
import { DISCLOSURE_TYPE_COLORS as TYPE_COLORS, DISCLOSURE_TYPE_DOT as TYPE_DOT, disclosureLabel } from '../disclosureTypes';

interface Disclosure {
  date: string;
  title?: string;
  outlet: string;
  type: string;
  interviewer?: string;
  /** Preferred field name per canonical schema */
  notes?: string;
  /** Legacy field used in some older bespoke JSON files */
  description?: string;
}

interface SharedDisclosuresTabProps {
  disclosures: Disclosure[];
  introText?: string;
  /**
   * 'timeline' — vertical left-border timeline with type badges (default)
   * 'card'     — flat card stack with inline date + gray badge
   */
  variant?: 'timeline' | 'card';
  /** Show disclosure count + type breakdown stats panel (Lazar-style) */
  showSummaryStats?: boolean;
}


const SharedDisclosuresTab: FC<SharedDisclosuresTabProps> = ({
  disclosures,
  introText,
  variant = 'timeline',
  showSummaryStats = false,
}) => {
  const text = (d: Disclosure): string => d.notes ?? d.description ?? '';

  if (variant === 'card') {
    return (
      <div className="space-y-3">
        {introText && <p className="text-sm text-gray-500">{introText}</p>}
        {disclosures.map((d, i) => (
          <div key={i} className={ps.borderCard}>
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-gray-400 whitespace-nowrap mt-0.5 w-16 shrink-0">{d.date}</span>
              <div className="flex-1 min-w-0">
                {d.title && <p className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">{d.title}</p>}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs text-gray-500">{d.outlet}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap ${TYPE_COLORS[d.type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {d.type.replace(/-/g, ' ')}
                  </span>
                </div>
                {d.interviewer && <p className="text-xs text-gray-500 mb-1">Interviewer: {d.interviewer}</p>}
                {text(d) && <p className="text-xs text-gray-500 italic">{text(d)}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Timeline variant (default)
  const years = disclosures.map(d => parseInt(d.date.slice(0, 4))).filter(y => !isNaN(y));
  const firstYear = years.length ? Math.min(...years) : null;
  const lastYear  = years.length ? Math.max(...years) : null;
  const typeCounts = disclosures.reduce<Record<string, number>>((acc, d) => {
    acc[d.type] = (acc[d.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {introText && <p className="text-sm text-gray-500">{introText}</p>}

      {showSummaryStats && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Disclosure Activity</p>
            {firstYear && lastYear && (
              <span className="text-xs text-gray-400">{disclosures.length} appearances · {firstYear}{firstYear !== lastYear ? `–${lastYear}` : ''}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[type] ?? 'bg-gray-400'}`} />
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{type.replace(/-/g, ' ')}</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-0.5 h-3 items-end">
            {disclosures.map((d, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${TYPE_DOT[d.type] ?? 'bg-gray-300'}`}
                style={{ minWidth: '6px', height: '100%' }}
                title={`${d.date} · ${d.type} · ${d.title}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className={`${ps.timelineLine} space-y-4`}>
        {disclosures.map((d, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-800" />
            <div className={ps.borderCard}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  {d.title && <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{d.title}</h4>}
                  <p className="text-xs text-gray-500 mt-0.5">{d.outlet}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-mono text-xs text-gray-400">{d.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[d.type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {d.type.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>
              {d.interviewer && <p className="text-xs text-gray-500 mb-1">Interviewer: {d.interviewer}</p>}
              {text(d) && <p className="text-xs text-gray-500 italic mt-2">{text(d)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedDisclosuresTab;
