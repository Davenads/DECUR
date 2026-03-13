import { FC } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';

const data = burischData as BurischData;

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Background</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Service Period</p>
          <p className="text-sm text-gray-800">{profile.service_period}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Clearance</p>
          <p className="text-sm text-gray-800">{profile.clearance}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Organizations</p>
          <p className="text-sm text-gray-800">{profile.organizations.join(' · ')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Roles</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.roles.map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Early Life</h3>
        <ul className="space-y-1.5">
          {profile.early_life.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Events</h3>
        <div className="space-y-2">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{ev.year}</span>
              <span className="text-gray-700">{ev.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
