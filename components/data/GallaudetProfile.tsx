import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import gallaudetData from '../../data/key-figures/gallaudet.json';
import type { GallaudetData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import PersonCard from './shared/PersonCard';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import { ps } from './shared/profileStyles';

const FigureCareerFlow = dynamic(() => import('./shared/FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

const data = gallaudetData as unknown as GallaudetData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'uso',             label: 'USO Research' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
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

      <div>
        <h3 className={`${ps.h3} mb-2`}>Education</h3>
        <ul className="space-y-1.5">
          {(profile.education ?? []).map((item, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Career Background</h3>
        <ul className="space-y-1.5">
          {profile.early_career.map((item, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Key Events</h3>
        <div className={`${ps.timelineLine} space-y-4`}>
          {profile.key_events.map((ev, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-800" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.date}</span>
                <span className={ps.body}>{ev.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UsoTab: FC = () => (
  <div className="space-y-6">
    <div className={ps.accentBoxLg}>
      <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Domain Expertise</p>
      <p className={`${ps.body} leading-relaxed`}>
        Gallaudet is the most credentialed UAP researcher in the oceanic domain. His 30-year Navy career in
        oceanography and ocean surveillance — including experience with SOSUS (Sound Surveillance System) and
        submarine acoustic tracking — gives him unique insight into Unidentified Submersible Objects (USOs).
        His time as Acting NOAA Administrator provided access to the broadest civilian ocean monitoring infrastructure
        in the world.
      </p>
    </div>

    <div>
      <h3 className={`${ps.h3} mb-3`}>The Submarine Incident</h3>
      <p className={`${ps.body} leading-relaxed mb-3`}>
        Gallaudet described an incident in which a U.S. nuclear submarine encountered an unidentified submersible
        object. The object tracked the submarine, stopped it, and followed it from the stern — maneuvers inconsistent
        with any known vessel. The crew initially assessed it as a Soviet (or Russian) attack submarine, a threat
        classification that itself indicates the object produced submarine-like acoustic signatures.
      </p>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Verification Status</p>
        <p className="text-sm text-amber-900 dark:text-amber-100">
          No official Navy record of this incident has been made public. No crew members have been independently
          identified as corroborating sources. The incident is documented only through Gallaudet's account.
        </p>
      </div>
    </div>

    <div>
      <h3 className={`${ps.h3} mb-3`}>Ocean as UAP Domain</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Ocean Floor Mapped</p>
          <p className="text-2xl font-bold text-primary">~25%</p>
          <p className="text-xs text-gray-500 mt-1">Of total ocean floor has been mapped at high resolution</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Ocean Volume Explored</p>
          <p className="text-2xl font-bold text-primary">&lt;10%</p>
          <p className="text-xs text-gray-500 mt-1">Of ocean volume has been directly explored by humans</p>
        </div>
      </div>
      <p className={`${ps.body} leading-relaxed`}>
        Gallaudet argues that the oceans represent the most plausible concealment environment for long-term NHI
        presence — vast, largely unexplored, and historically monitored by surveillance systems (SOSUS, hydrophone
        arrays) that are classified and unavailable to civilian researchers. His Sol Foundation white paper
        "Beneath the Surface" outlines the scientific case for prioritizing the oceanic domain in UAP investigation.
      </p>
    </div>

    <div>
      <h3 className={`${ps.h3} mb-3`}>NOAA Data Suppression Allegation</h3>
      <p className={`${ps.body} leading-relaxed`}>
        Gallaudet alleges that NOAA's ocean monitoring infrastructure — including hydrophone arrays, satellite
        altimetry, and deep-sea sensor networks — has recorded anomalous data potentially attributable to USO
        activity that is not being analyzed through a UAP lens. As former Acting NOAA Administrator, he had
        direct knowledge of these systems. He has called for a dedicated analytical framework within NOAA for
        assessing oceanic anomalies against the UAP hypothesis.
      </p>
    </div>
  </div>
);

const ClaimsTab: FC = () => {
  const { claims } = data;
  return (
    <div className="space-y-5">
      <ClaimsStatusBar claims={claims} />
      {claims.map(claim => {
        const cfg = statusConfig[claim.status] ?? { label: claim.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
        return (
          <div key={claim.id} className={`${ps.borderCardLg} space-y-3`}>
            <div className="flex items-start justify-between gap-3">
              <p className={ps.label}>{claim.category}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
            </div>
            <p className={`${ps.value} leading-relaxed`}>{claim.claim}</p>
            {claim.notes && (
              <p className="text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">{claim.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const DisclosuresTab: FC = () => {
  const { disclosures, associated_people } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${ps.h3} mb-4`}>Public Disclosures</h3>
        <div className="space-y-4">
          {disclosures.map((d, i) => (
            <div key={i} className={ps.borderCardLg}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className={ps.h4Inline}>{d.title}</h4>
                  <p className="text-xs text-primary mt-0.5">{d.outlet}</p>
                </div>
                <span className="font-mono text-xs text-gray-400 shrink-0">{d.date}</span>
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded p-2">{d.notes}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Associated People</h3>
        <div className="space-y-3">
          {associated_people.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section presents documented arguments for and against Gallaudet's credibility. DECUR does not adjudicate these claims; they are presented for methodological transparency."
  />
);

const GallaudetProfile: FC<InsiderProfileProps> = ({ onBack, backLabel }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'career-network': {
        const keyEvents = (data.profile.key_events ?? []).map((e: any) => ({ year: String(e.date ?? e.year ?? ''), event: e.event }));
        const careerConnections = (data as any).career_connections ?? [];
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Career timeline with key connections. Dashed edges show cross-figure and program relationships. Scroll or pinch to zoom.
            </p>
            <FigureCareerFlow keyEvents={keyEvents} careerConnections={careerConnections} />
          </div>
        );
      }
      case 'uso':         return <UsoTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
      case 'assessment':  return <AssessmentTab />;
    }
  };

  return (
    <ProfileShell
      name={data.profile.name}
      role={data.profile.roles[0]}
      period={data.profile.service_period}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as TabId)}
      onBack={onBack}
      backLabel={backLabel}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default GallaudetProfile;
