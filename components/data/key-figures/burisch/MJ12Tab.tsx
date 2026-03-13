import { FC } from 'react';
import { BurischData, MJ12Member } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';

const data = burischData as BurischData;

const MJ12Tab: FC = () => {
  const { mj12 } = data;
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Majestic-12 Roster (2006)</h3>
        <p className="text-sm text-gray-500">
          Reported membership at time of Majestic-12 adjournment, as disclosed by Dan Burisch in May 2008.
        </p>
      </div>
      <div className="grid gap-3">
        {mj12.map((member: MJ12Member) => (
          <div key={member.seat} className="flex gap-4 border border-gray-200 rounded-lg p-4 items-start">
            <div className="shrink-0">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                {member.seat}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{member.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{member.roles.join(' · ')}</p>
              {member.notes && <p className="text-xs text-gray-400 mt-1 italic">{member.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MJ12Tab;
