import { FC } from 'react';
import CredibilityBalance from '../CredibilityBalance';

interface Source {
  title: string;
  url: string;
  type: string;
  notes?: string;
}

interface Credibility {
  supporting: string[];
  contradicting: string[];
}

interface SharedAssessmentTabProps {
  credibility: Credibility;
  /**
   * 'baseline' — CredibilityBalance + methodology note + bordered card boxes per argument (default)
   * 'compact'  — 2-column grid with +/- inline symbols, no methodology note, no balance bar
   */
  variant?: 'baseline' | 'compact';
  /** Optional contextual note shown in amber box above the arguments. Baseline variant only. */
  methodologyNote?: string;
  /** Optional sources list rendered at the bottom of the tab. */
  sources?: Source[];
}

const SharedAssessmentTab: FC<SharedAssessmentTabProps> = ({
  credibility,
  variant = 'baseline',
  methodologyNote,
  sources,
}) => {
  if (variant === 'compact') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3">
              Supporting
            </h4>
            <ul className="space-y-1.5">
              {credibility.supporting.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-0.5 shrink-0">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3">
              Contradicting
            </h4>
            <ul className="space-y-1.5">
              {credibility.contradicting.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <span className="text-red-400 mt-0.5 shrink-0">-</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Baseline variant
  return (
    <div className="space-y-6">
      <CredibilityBalance
        supporting={credibility.supporting.length}
        contradicting={credibility.contradicting.length}
      />

      {methodologyNote && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
            Methodology Note
          </p>
          <p className="text-sm text-amber-900 dark:text-amber-100">{methodologyNote}</p>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-2">
          {credibility.supporting.map((item, i) => (
            <div key={i} className="flex gap-2 border border-green-100 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/20 rounded-lg p-3">
              <span className="text-green-500 mt-0.5 shrink-0">✓</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Arguments Against
        </h4>
        <div className="space-y-2">
          {credibility.contradicting.map((item, i) => (
            <div key={i} className="flex gap-2 border border-red-100 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/20 rounded-lg p-3">
              <span className="text-red-400 mt-0.5 shrink-0">✗</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {sources && sources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sources</h4>
          <div className="space-y-2">
            {sources.map((src, i) => (
              <div key={i} className="flex items-start justify-between gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{src.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {src.type.replace(/-/g, ' ')}{src.notes ? ` · ${src.notes}` : ''}
                  </p>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline whitespace-nowrap shrink-0"
                >
                  View ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedAssessmentTab;
