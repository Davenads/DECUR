import { FC } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';
import CredibilityBalance from '../../shared/CredibilityBalance';
import CategoryBreakdown from '../../shared/CategoryBreakdown';

const data = burischData as BurischData;

const AssessmentTab: FC = () => {
  const { arguments: args } = data;
  return (
    <div className="space-y-6">
      <CredibilityBalance
        supporting={args.supporting.length}
        contradicting={args.against.length}
      />

      <CategoryBreakdown supporting={args.supporting} against={args.against} />

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Methodology Note</p>
        <p className="text-sm text-amber-900 dark:text-amber-300">
          This section presents documented arguments for and against Burisch&apos;s credibility as compiled by researcher Brian Jackson over 13 years. DECUR does not adjudicate these claims; they are presented for methodological transparency.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-3">
          {args.supporting.map((a, i) => (
            <div key={i} className="border border-green-100 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 rounded-lg p-4">
              <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">{a.category}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{a.claim}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Arguments Against
        </h4>
        <div className="space-y-3">
          {args.against.map((a, i) => (
            <div key={i} className="border border-red-100 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 rounded-lg p-4">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">{a.category}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{a.claim}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentTab;
