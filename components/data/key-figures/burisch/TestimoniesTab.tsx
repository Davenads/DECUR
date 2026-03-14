import { FC } from 'react';
import { BurischData, BurischTestimony } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';

const data = burischData as BurischData;

const TestimoniesTab: FC = () => {
  const { testimonies } = data;
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Corroborating accounts from independent witnesses whose testimony intersects with Burisch's narrative.
      </p>
      {testimonies.map((t: BurischTestimony) => (
        <div key={t.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{t.witness}</h4>
          {t.real_identity && <p className="text-xs text-gray-400 mb-1">{t.real_identity}</p>}
          {t.introduced_by && <p className="text-xs text-gray-400 mb-2">Introduced by: {t.introduced_by}</p>}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t.background}</p>

          <div className="mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Key Claims</p>
            <ul className="space-y-1">
              {t.key_claims.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-primary mt-0.5 shrink-0">›</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded p-3">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Burisch Connection</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{t.burisch_connection}</p>
          </div>

          {t.notes && <p className="text-xs text-gray-400 mt-2 italic">{t.notes}</p>}
          {t.source && <p className="text-xs text-gray-400 mt-1">Source: {t.source}</p>}
        </div>
      ))}
    </div>
  );
};

export default TestimoniesTab;
