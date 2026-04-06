import { FC } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';
import { ps } from '../../shared/profileStyles';

const data = burischData as BurischData;

const EntityTab: FC = () => {
  const { entity } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${ps.h3} mb-1`}>{entity.name} <span className="text-gray-400 font-normal text-base">/ {entity.designation}</span></h3>
        <p className={ps.muted}>{entity.classification}</p>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Origin</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(entity.origin).map(([key, val]) => (
            <div key={key} className={ps.infoCardSm}>
              <p className={`${ps.label} mb-0.5`}>{key.replace(/_/g, ' ')}</p>
              <p className={ps.value}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Physical Description</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(entity.physical).map(([key, val]) => (
            <div key={key} className={ps.infoCardSm}>
              <p className={`${ps.label} mb-0.5`}>{key.replace(/_/g, ' ')}</p>
              <p className={ps.value}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Medical Conditions</h4>
        <ul className="space-y-1.5">
          {entity.medical_conditions.map((c, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-amber-500 mt-0.5">⚠</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Communication</p>
          <p className={ps.value}>{entity.communication}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Age / Name Meaning</p>
          <p className={ps.value}>{entity.age}</p>
          <p className={`${ps.meta} mt-1`}>{entity.name_meaning}</p>
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Containment</h4>
        <div className={`${ps.infoCard} space-y-1`}>
          <p className={ps.value}><span className="font-medium">Facility: </span>{entity.containment.facility}</p>
          <p className={ps.value}><span className="font-medium">Environment: </span>{entity.containment.sphere}</p>
          <p className="text-sm text-gray-500 italic">{entity.containment.notes}</p>
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Mission Objectives</h4>
        <ul className="space-y-1.5">
          {entity.mission.map((m, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5">›</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={ps.accentBox}>
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Connection to Burisch</p>
        <p className={ps.body}>{entity.connection_to_burisch}</p>
      </div>
    </div>
  );
};

export default EntityTab;
