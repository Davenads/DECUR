import { FC } from 'react';
import { BurischData, BurischTestimony } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';
import { ps } from '../../shared/profileStyles';

const data = burischData as BurischData;

const TestimoniesTab: FC = () => {
  const { testimonies } = data;
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Corroborating accounts from independent witnesses whose testimony intersects with Burisch's narrative.
      </p>
      {testimonies.map((t: BurischTestimony) => (
        <div key={t.id} className={ps.borderCardLg}>
          <h4 className={`${ps.h4Inline} mb-0.5`}>{t.witness}</h4>
          {t.real_identity && <p className={`${ps.muted} mb-1`}>{t.real_identity}</p>}
          {t.introduced_by && <p className={`${ps.muted} mb-2`}>Introduced by: {t.introduced_by}</p>}
          <p className={`${ps.bodyMuted} mb-3`}>{t.background}</p>

          <div className="mb-3">
            <p className={`${ps.label} mb-1.5`}>Key Claims</p>
            <ul className="space-y-1">
              {t.key_claims.map((c, i) => (
                <li key={i} className={ps.listItem}>
                  <span className="text-primary mt-0.5 shrink-0">›</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded p-3">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Burisch Connection</p>
            <p className={ps.body}>{t.burisch_connection}</p>
          </div>

          {t.notes && <p className={`${ps.muted} mt-2 italic`}>{t.notes}</p>}
          {t.source && <p className={`${ps.muted} mt-1`}>Source: {t.source}</p>}
        </div>
      ))}
    </div>
  );
};

export default TestimoniesTab;
