import { FC, useState } from 'react';
import gallaudetData from '../../data/key-figures/gallaudet.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = gallaudetData as typeof gallaudetData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'uso',         label: 'USO Research' },
  { id: 'claims',      label: 'Claims' },
  { id: 'disclosures', label: 'Disclosures' },
  { id: 'assessment',  label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Background</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Service Period</p>
          <p className="text-sm text-gray-800">{profile.service_period}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Clearance</p>
          <p className="text-sm text-gray-800">{profile.clearance}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Organizations</p>
          <p className="text-sm text-gray-800">{profile.organizations.join(' · ')}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Roles</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.roles.map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Education</h3>
        <ul className="space-y-1.5">
          {profile.education.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Background</h3>
        <ul className="space-y-1.5">
          {profile.early_career.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Events</h3>
        <div className="relative pl-6 border-l-2 border-gray-100 space-y-4">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.date}</span>
                <span className="text-sm text-gray-700">{ev.event}</span>
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
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
      <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Domain Expertise</p>
      <p className="text-sm text-gray-700 leading-relaxed">
        Gallaudet is the most credentialed UAP researcher in the oceanic domain. His 30-year Navy career in
        oceanography and ocean surveillance — including experience with SOSUS (Sound Surveillance System) and
        submarine acoustic tracking — gives him unique insight into Unidentified Submersible Objects (USOs).
        His time as Acting NOAA Administrator provided access to the broadest civilian ocean monitoring infrastructure
        in the world.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">The Submarine Incident</h3>
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        Gallaudet described an incident in which a U.S. nuclear submarine encountered an unidentified submersible
        object. The object tracked the submarine, stopped it, and followed it from the stern — maneuvers inconsistent
        with any known vessel. The crew initially assessed it as a Soviet (or Russian) attack submarine, a threat
        classification that itself indicates the object produced submarine-like acoustic signatures.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Verification Status</p>
        <p className="text-sm text-amber-900">
          No official Navy record of this incident has been made public. No crew members have been independently
          identified as corroborating sources. The incident is documented only through Gallaudet's account.
        </p>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Ocean as UAP Domain</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Ocean Floor Mapped</p>
          <p className="text-2xl font-bold text-primary">~25%</p>
          <p className="text-xs text-gray-500 mt-1">Of total ocean floor has been mapped at high resolution</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Ocean Volume Explored</p>
          <p className="text-2xl font-bold text-primary">&lt;10%</p>
          <p className="text-xs text-gray-500 mt-1">Of ocean volume has been directly explored by humans</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">
        Gallaudet argues that the oceans represent the most plausible concealment environment for long-term NHI
        presence — vast, largely unexplored, and historically monitored by surveillance systems (SOSUS, hydrophone
        arrays) that are classified and unavailable to civilian researchers. His Sol Foundation white paper
        "Beneath the Surface" outlines the scientific case for prioritizing the oceanic domain in UAP investigation.
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">NOAA Data Suppression Allegation</h3>
      <p className="text-sm text-gray-700 leading-relaxed">
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
          <div key={claim.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{claim.category}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{claim.claim}</p>
            {claim.notes && (
              <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{claim.notes}</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Disclosures</h3>
        <div className="space-y-4">
          {disclosures.map((d, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{d.title}</h4>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Associated People</h3>
        <div className="space-y-3">
          {associated_people.map(person => (
            <div key={person.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-0.5">{person.name}</h4>
              <p className="text-xs text-primary mb-2">{person.role}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{person.relationship}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AssessmentTab: FC = () => {
  const { credibility } = data;
  return (
    <div className="space-y-6">
      <CredibilityBalance
        supporting={credibility.supporting.length}
        contradicting={credibility.contradicting.length}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Methodology Note</p>
        <p className="text-sm text-amber-900">
          This section documents arguments for and against Gallaudet's credibility based on publicly available evidence,
          official statements, and independent corroboration. DECUR does not adjudicate these claims.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-3">
          {credibility.supporting.map((arg, i) => (
            <div key={i} className="border border-green-100 bg-green-50/50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{arg}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Arguments Against
        </h4>
        <div className="space-y-3">
          {credibility.contradicting.map((arg, i) => (
            <div key={i} className="border border-red-100 bg-red-50/50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{arg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GallaudetProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
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
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default GallaudetProfile;
