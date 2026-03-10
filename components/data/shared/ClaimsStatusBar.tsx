import { FC } from 'react';
import { statusBarConfig } from './profileConstants';

interface ClaimsStatusBarProps {
  claims: Array<{ status: string }>;
}

const ClaimsStatusBar: FC<ClaimsStatusBarProps> = ({ claims }) => {
  const total = claims.length;
  const counts = statusBarConfig.map(s => ({
    ...s,
    count: claims.filter(c => c.status === s.key).length,
  })).filter(s => s.count > 0);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Claims Verification Overview</p>
        <span className="text-xs text-gray-400">{total} total claims</span>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {counts.map(s => (
          <div
            key={s.key}
            className={`${s.bar} transition-all`}
            style={{ width: `${(s.count / total) * 100}%` }}
            title={`${s.label}: ${s.count}`}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {counts.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
            <span className="text-xs text-gray-600">{s.label}</span>
            <span className="text-xs font-semibold text-gray-800">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClaimsStatusBar;
