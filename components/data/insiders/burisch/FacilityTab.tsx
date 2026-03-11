import { FC } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/insiders/burisch.json';

const data = burischData as BurischData;

const FacilityTab: FC = () => {
  const { facility } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{facility.name}</h3>
        <p className="text-xs text-gray-400 mb-1">
          {facility.aliases.join(' · ')}
        </p>
        <p className="text-sm text-gray-600">{facility.location}</p>
        <p className="text-sm text-gray-600">{facility.construction}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Security Protocols</h4>
        <ul className="space-y-1.5">
          {facility.security.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-red-400 mt-0.5 shrink-0">■</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {facility.notable_equipment.map((eq, i) => {
        const equipment = eq as Record<string, unknown>;
        return (
          <div key={i} className="border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-900 mb-3">{equipment.name as string}</h4>
            <p className="text-sm text-gray-700 mb-3">{equipment.description as string}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(equipment)
                .filter(([k]) => !['name', 'description'].includes(k))
                .map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded p-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-800">
                      {Array.isArray(val) ? (val as string[]).join(', ') : String(val)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        );
      })}

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Notable Visitors</h4>
        <ul className="space-y-1.5">
          {facility.notable_visitors.map((v, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
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
