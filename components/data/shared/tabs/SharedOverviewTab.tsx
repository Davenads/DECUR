import { FC, ReactNode } from 'react';
import { ps } from '../profileStyles';

interface KeyEvent {
  year?: string;
  date?: string;
  event: string;
}

interface SharedOverviewProfile {
  summary: string;
  service_period: string;
  clearance: string;
  organizations: string[];
  roles: string[];
  early_career?: string[];
  background?: string[];
  education?: string[];
  key_events: KeyEvent[];
}

interface SharedOverviewTabProps {
  profile: SharedOverviewProfile;
  headerBanner?: ReactNode;
}

const SharedOverviewTab: FC<SharedOverviewTabProps> = ({ profile, headerBanner }) => {
  const careerItems = profile.early_career ?? profile.background ?? [];

  return (
    <div className="space-y-6">
      {headerBanner}

      <div>
        <h3 className={`${ps.h3} mb-2`}>Background</h3>
        <p className={`${ps.body} leading-relaxed`}>{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Service Period</p>
          <p className={ps.value}>{profile.service_period}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Clearance</p>
          <p className={ps.value}>{profile.clearance}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Organizations</p>
          <p className={ps.value}>{profile.organizations.join(' · ')}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Roles</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.roles.map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>

      {profile.education && profile.education.length > 0 && (
        <div>
          <h3 className={`${ps.h3} mb-3`}>Education</h3>
          <ul className="space-y-1.5">
            {profile.education.map((item, i) => (
              <li key={i} className={ps.listItem}>
                <span className="text-primary mt-0.5 shrink-0">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {careerItems.length > 0 && (
        <div>
          <h3 className={`${ps.h3} mb-3`}>Career Background</h3>
          <ul className="space-y-1.5">
            {careerItems.map((item, i) => (
              <li key={i} className={ps.listItem}>
                <span className="text-primary mt-0.5 shrink-0">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className={`${ps.h3} mb-3`}>Key Events</h3>
        <div className={`${ps.timelineLine} space-y-4`}>
          {profile.key_events.map((ev, i) => (
            <div key={i} className="relative">
              <div className={ps.timelineDot} />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">
                  {ev.year ?? ev.date}
                </span>
                <span className={ps.body}>{ev.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharedOverviewTab;
