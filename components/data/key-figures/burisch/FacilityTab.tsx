import { FC } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';
import { ps } from '../../shared/profileStyles';

const data = burischData as BurischData;

const FacilityTab: FC = () => {
  const { facility } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${ps.h3} mb-1`}>{facility.name}</h3>
        <p className={`${ps.muted} mb-1`}>
          {facility.aliases.join(' · ')}
        </p>
        <p className={ps.bodyMuted}>{facility.location}</p>
        <p className={ps.bodyMuted}>{facility.construction}</p>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Security Protocols</h4>
        <ul className="space-y-1.5">
          {facility.security.map((s, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-red-400 mt-0.5 shrink-0">■</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {facility.notable_equipment.map((eq, i) => {
        const equipment = eq as Record<string, unknown>;
        return (
          <div key={i} className={ps.borderCardLg}>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{equipment.name as string}</h4>
            <p className={`${ps.body} mb-3`}>{equipment.description as string}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(equipment)
                .filter(([k]) => !['name', 'description'].includes(k))
                .map(([key, val]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <p className={`${ps.label} mb-0.5`}>{key.replace(/_/g, ' ')}</p>
                    <p className={ps.value}>
                      {Array.isArray(val) ? (val as string[]).join(', ') : String(val)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        );
      })}

      <div>
        <h4 className={`${ps.h4} mb-2`}>Notable Visitors</h4>
        <ul className="space-y-1.5">
          {facility.notable_visitors.map((v, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5">›</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FacilityTab;
