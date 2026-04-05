import { FC } from 'react';
import type { ContributionContentType } from '../../../lib/validation/contributions';

const TYPES: { type: ContributionContentType; label: string; description: string }[] = [
  { type: 'figure',         label: 'Key Figure',          description: 'A person with firsthand testimony or significant research' },
  { type: 'case',           label: 'Documented Case',     description: 'A credible UAP encounter with witnesses or physical evidence' },
  { type: 'timeline_event', label: 'Timeline Event',      description: 'A historically significant event for the record' },
  { type: 'correction',     label: 'Correction / Source', description: 'Fix a factual error or add a missing source' },
];

interface Props {
  onSelect: (type: ContributionContentType) => void;
}

const TypeSelectStep: FC<Props> = ({ onSelect }) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">What are you submitting?</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose the category that best describes your contribution.</p>
    <div className="space-y-3">
      {TYPES.map(({ type, label, description }) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  </div>
);

export default TypeSelectStep;
