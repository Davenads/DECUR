import { FC, useState } from 'react';
import fravorData from '../../data/key-figures/fravor.json';
import type { FravorData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import SharedCareerNetworkTab from './shared/tabs/SharedCareerNetworkTab';
import SharedOverviewTab from './shared/tabs/SharedOverviewTab';
import SharedClaimsTab from './shared/tabs/SharedClaimsTab';
import { ps } from './shared/profileStyles';

const data = fravorData as unknown as FravorData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'encounter',       label: 'The Encounter' },
  { id: 'claims',          label: 'Claims' },
  { id: 'evidence',        label: 'Evidence' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'network',         label: 'People' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* Tab components */

const EncounterTab: FC = () => {
  const { encounter } = data;
  return (
    <div className="space-y-6">
      <div className={ps.accentBoxLg}>
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Primary Incident</p>
        <h3 className={`${ps.h3} mb-1`}>The Tic Tac Encounter</h3>
        <p className={ps.muted}>{encounter.date} · {encounter.location}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Vessel</p>
          <p className={ps.value}>{encounter.vessel}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Aircraft</p>
          <p className={ps.value}>{encounter.fravor_aircraft}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Detection Platform</p>
          <p className={ps.value}>{encounter.detection_platform}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Prior Radar Tracking</p>
          <p className={ps.value}>{encounter.prior_tracking}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Wingman / Second Crew</p>
          <p className={ps.value}>{encounter.wingman}</p>
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Object Description</h4>
        <p className={`${ps.body} leading-relaxed`}>{encounter.object_description}</p>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Observed Behavior</h4>
        <ul className="space-y-2">
          {encounter.observed_behavior.map((b, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">FLIR Footage Note</p>
        <p className="text-sm text-amber-900 dark:text-amber-100">{encounter.flir_footage}</p>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Witnesses</h4>
        <div className="flex flex-wrap gap-1.5">
          {encounter.witnesses.map((w, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{w}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const EvidenceTab: FC = () => {
  const { encounter } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${ps.h3} mb-2`}>FLIR1 "Tic Tac" Video</h3>
        <p className={`${ps.body} leading-relaxed mb-3`}>
          The FLIR1 video — commonly called the "Tic Tac video" — was captured on November 14, 2004 by Lt. Chad Underwood
          aboard a separate F/A-18 on a different contact in the same exercise area. Fravor was not present for the filming.
          The Pentagon officially confirmed the footage as authentic Navy gun-camera footage of unidentified aerial phenomena in April 2019.
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
          <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Pentagon Status</p>
          <p className="text-sm text-green-900 dark:text-green-100">Officially authenticated as genuine U.S. Navy footage — April 2019</p>
        </div>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-2`}>Radar Tracking</h3>
        <p className={`${ps.body} leading-relaxed mb-3`}>
          USS Princeton's AN/SPY-1B Aegis Combat System — among the most advanced radar systems in the U.S. fleet —
          tracked unidentified objects for approximately two weeks before the November 14 visual intercept. The objects
          were observed descending from 80,000 feet to near sea-level and returning.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">AARO Assessment</p>
          <p className="text-sm text-amber-900 dark:text-amber-100">
            AARO's 2024 report suggested some radar anomalies may have been attributable to a radar mode switching software
            update — but did not account for the visual encounter or the object's behaviors observed by four aviators.
          </p>
        </div>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Witness Accounts</h3>
        <div className="space-y-3">
          <div className={ps.borderCard}>
            <h4 className={`${ps.h4Inline} mb-1`}>Commander David Fravor (Primary)</h4>
            <p className={ps.body}>Observed the object visually from his F/A-18F cockpit. Attempted to intercept; the object mirrored his movements, then accelerated beyond visual range instantaneously. Consistent testimony across six years of public interviews.</p>
          </div>
          <div className={ps.borderCard}>
            <h4 className={`${ps.h4Inline} mb-1`}>Lt. Commander Jim Slaight (Wingman)</h4>
            <p className={ps.body}>Fravor's wingman in the first aircraft. Corroborated the encounter in interviews and congressional record.</p>
          </div>
          <div className={ps.borderCard}>
            <h4 className={`${ps.h4Inline} mb-1`}>Lt. Commander Alex Dietrich (Second Aircraft Pilot)</h4>
            <p className={ps.body}>Piloted the second F/A-18. Went on the record publicly for the first time in a 2021 60 Minutes interview, corroborating the encounter from her own vantage point.</p>
          </div>
          <div className={ps.borderCard}>
            <h4 className={`${ps.h4Inline} mb-1`}>USS Princeton CIC Radar Operators</h4>
            <p className={ps.body}>Tracked the anomalous contacts on the Aegis radar system. Reported the object's return to the CAP point within seconds of Fravor's intercept attempt — approximately 60 miles in under 2 seconds.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-2`}>Congressional Record</h3>
        <p className={`${ps.body} leading-relaxed`}>
          The Nimitz encounter is referenced in closed-door classified briefings released in transcript form by Congress in
          December 2023, situating it within the broader program context described by other witnesses. Fravor's July 26, 2023
          sworn testimony before the House Oversight Subcommittee is part of the official congressional record.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Detection Platform</p>
        <p className={ps.body}>{encounter.detection_platform}</p>
      </div>
    </div>
  );
};

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section presents documented arguments for and against Fravor's credibility. DECUR does not adjudicate these claims; they are presented for methodological transparency."
  />
);

/* Main component */

const FravorProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'overview':   return <SharedOverviewTab profile={data.profile as any} />;
      case 'encounter':  return <EncounterTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'claims':     return <SharedClaimsTab claims={data.claims as any} />;
      case 'evidence':   return <EvidenceTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'career-network': return <SharedCareerNetworkTab profile={data.profile} career_connections={(data as any).career_connections} />;
      case 'network':    return <NetworkTab />;
      case 'assessment': return <AssessmentTab />;
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
      contentId={data.profile.id}
      contentName={data.profile.name}
      onBack={onBack}
      backLabel={backLabel}
      networkNodeId={networkNodeId}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default FravorProfile;
