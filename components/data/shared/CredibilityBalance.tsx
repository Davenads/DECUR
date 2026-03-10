import { FC } from 'react';

interface CredibilityBalanceProps {
  supporting: number;
  contradicting: number;
}

const CredibilityBalance: FC<CredibilityBalanceProps> = ({ supporting, contradicting }) => {
  const total = supporting + contradicting;
  const supPct = total > 0 ? (supporting / total) * 100 : 50;
  const conPct = total > 0 ? (contradicting / total) * 100 : 50;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Credibility Balance</p>
        <span className="text-xs text-gray-400">{total} arguments documented</span>
      </div>

      <div className="flex h-4 rounded-full overflow-hidden gap-px">
        <div
          className="bg-green-500 flex items-center justify-center transition-all"
          style={{ width: `${supPct}%` }}
          title={`Supporting: ${supporting}`}
        >
          {supPct > 15 && <span className="text-xs text-white font-bold">{supporting}</span>}
        </div>
        <div
          className="bg-red-400 flex items-center justify-center transition-all"
          style={{ width: `${conPct}%` }}
          title={`Contradicting: ${contradicting}`}
        >
          {conPct > 15 && <span className="text-xs text-white font-bold">{contradicting}</span>}
        </div>
      </div>

      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-gray-600">Supporting</span>
          <span className="font-semibold text-gray-800">{supporting}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-800">{contradicting}</span>
          <span className="text-gray-600">Contradicting</span>
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default CredibilityBalance;
