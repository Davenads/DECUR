import { FC } from 'react';

interface CategoryArg {
  category: string;
  claim: string;
}

interface CategoryBreakdownProps {
  supporting: CategoryArg[];
  against: CategoryArg[];
}

const CategoryBreakdown: FC<CategoryBreakdownProps> = ({ supporting, against }) => {
  const allCategories = Array.from(
    new Set([...supporting.map(a => a.category), ...against.map(a => a.category)])
  ).sort();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Breakdown by Category</p>
      <div className="space-y-2">
        {allCategories.map(cat => {
          const sup = supporting.filter(a => a.category === cat).length;
          const agt = against.filter(a => a.category === cat).length;
          const total = sup + agt;
          const supPct = total > 0 ? (sup / total) * 100 : 0;
          return (
            <div key={cat} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">{cat}</span>
                <span className="text-xs text-gray-400">
                  {sup > 0 && <span className="text-green-600 font-medium">+{sup}</span>}
                  {sup > 0 && agt > 0 && <span className="text-gray-300 mx-1">·</span>}
                  {agt > 0 && <span className="text-red-500 font-medium">-{agt}</span>}
                </span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-red-200">
                <div className="bg-green-400 rounded-full" style={{ width: `${supPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
