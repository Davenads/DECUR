import { FC, useState } from 'react';
import fravorData from '../../data/insiders/fravor.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = fravorData as typeof fravorData;

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'encounter',  label: 'The Encounter' },
  { id: 'claims',     label: 'Claims' },
  { id: 'evidence',   label: 'Evidence' },
  { id: 'network',    label: 'Network' },
  { id: 'assessment', label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* Tab components */

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

const EncounterTab: FC = () => {
  const { encounter } = data;
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Primary Incident</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">The Tic Tac Encounter</h3>
        <p className="text-xs text-gray-400">{encounter.date} · {encounter.location}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Vessel</p>
          <p className="text-sm text-gray-800">{encounter.vessel}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Aircraft</p>
          <p className="text-sm text-gray-800">{encounter.fravor_aircraft}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Detection Platform</p>
          <p className="text-sm text-gray-800">{encounter.detection_platform}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Prior Radar Tracking</p>
          <p className="text-sm text-gray-800">{encounter.prior_tracking}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Wingman / Second Crew</p>
          <p className="text-sm text-gray-800">{encounter.wingman}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Object Description</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{encounter.object_description}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Observed Behavior</h4>
        <ul className="space-y-2">
          {encounter.observed_behavior.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">FLIR Footage Note</p>
        <p className="text-sm text-amber-900">{encounter.flir_footage}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Witnesses</h4>
        <div className="flex flex-wrap gap-1.5">
          {encounter.witnesses.map((w, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{w}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

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

const EvidenceTab: FC = () => {
  const { encounter } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">FLIR1 "Tic Tac" Video</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          The FLIR1 video — commonly called the "Tic Tac video" — was captured on November 14, 2004 by Lt. Chad Underwood
          aboard a separate F/A-18 on a different contact in the same exercise area. Fravor was not present for the filming.
          The Pentagon officially confirmed the footage as authentic Navy gun-camera footage of unidentified aerial phenomena in April 2019.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Pentagon Status</p>
          <p className="text-sm text-green-900">Officially authenticated as genuine U.S. Navy footage — April 2019</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Radar Tracking</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          USS Princeton's AN/SPY-1B Aegis Combat System — among the most advanced radar systems in the U.S. fleet —
          tracked unidentified objects for approximately two weeks before the November 14 visual intercept. The objects
          were observed descending from 80,000 feet to near sea-level and returning.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">AARO Assessment</p>
          <p className="text-sm text-amber-900">
            AARO's 2024 report suggested some radar anomalies may have been attributable to a radar mode switching software
            update — but did not account for the visual encounter or the object's behaviors observed by four aviators.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Witness Accounts</h3>
        <div className="space-y-3">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">Commander David Fravor (Primary)</h4>
            <p className="text-sm text-gray-700">Observed the object visually from his F/A-18F cockpit. Attempted to intercept; the object mirrored his movements, then accelerated beyond visual range instantaneously. Consistent testimony across six years of public interviews.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">Lt. Commander Jim Slaight (Wingman)</h4>
            <p className="text-sm text-gray-700">Fravor's wingman in the first aircraft. Corroborated the encounter in interviews and congressional record.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">Lt. Commander Alex Dietrich (Second Aircraft Pilot)</h4>
            <p className="text-sm text-gray-700">Piloted the second F/A-18. Went on the record publicly for the first time in a 2021 60 Minutes interview, corroborating the encounter from her own vantage point.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">USS Princeton CIC Radar Operators</h4>
            <p className="text-sm text-gray-700">Tracked the anomalous contacts on the Aegis radar system. Reported the object's return to the CAP point within seconds of Fravor's intercept attempt — approximately 60 miles in under 2 seconds.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Congressional Record</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          The Nimitz encounter is referenced in closed-door classified briefings released in transcript form by Congress in
          December 2023, situating it within the broader program context described by other witnesses. Fravor's July 26, 2023
          sworn testimony before the House Oversight Subcommittee is part of the official congressional record.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Detection Platform</p>
        <p className="text-sm text-gray-700">{encounter.detection_platform}</p>
      </div>
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      {associated_people.map(person => (
        <div key={person.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 mb-0.5">{person.name}</h4>
          <p className="text-xs text-primary mb-2">{person.role}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{person.relationship}</p>
        </div>
      ))}
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
          This section documents arguments for and against Fravor's credibility based on publicly available evidence, official statements, and independent corroboration. DECUR does not adjudicate these claims.
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

/* Main component */

const FravorProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewTab />;
      case 'encounter':  return <EncounterTab />;
      case 'claims':     return <ClaimsTab />;
      case 'evidence':   return <EvidenceTab />;
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
      onBack={onBack}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default FravorProfile;
