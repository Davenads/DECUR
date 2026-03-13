import { FC, useState } from 'react';
import barberData from '../../data/key-figures/barber.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = barberData as typeof barberData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'disclosure',  label: 'Disclosure' },
  { id: 'claims',      label: 'Claims' },
  { id: 'evidence',    label: 'Evidence' },
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

const DisclosureTab: FC = () => {
  const { disclosures } = data;
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Disclosure Context</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Jake Barber's public disclosure was made through investigative journalist Ross Coulthart of NewsNation.
          Unlike institutional whistleblowers such as David Grusch who filed formal ICIG complaints, Barber chose
          a direct media path — providing operational details, corroborating witnesses, and previously unseen video
          footage of a retrieval operation in a single broadcast.
        </p>
      </div>

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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Pentagon Response</p>
        <p className="text-sm text-amber-900">
          Following the NewsNation broadcast on January 18, 2025, the Pentagon confirmed it had opened an
          investigation into Barber's claims. This is a more direct institutional acknowledgment than was
          received for most prior disclosures.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Associated People</h3>
        <div className="space-y-3">
          {data.associated_people.map(person => (
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

const EvidenceTab: FC = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Retrieval Video Footage</h3>
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        Barber provided NewsNation with video footage of a UAP retrieval operation involving an egg-shaped white object.
        The footage was described by NewsNation as never-before-seen operational footage — the first time video of an
        alleged crash/retrieval operation has been broadcast in the modern disclosure era. The footage was partially
        obscured to protect operational security and the identities of personnel.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Authentication Status</p>
        <p className="text-sm text-amber-900">
          As of the January 18, 2025 broadcast, the footage has been presented by NewsNation as genuine but has not
          been independently authenticated by a third party with verified chain of custody. The Pentagon's investigation
          announcement may eventually include a formal assessment.
        </p>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">On-Camera Corroboration</h3>
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        Three additional high-level military veterans appeared on camera during the NewsNation special to corroborate
        Barber's account. This is a qualitatively different form of corroboration than secondhand references — these
        individuals placed their identities and careers on the record in the same broadcast.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Corroboration Level</p>
        <p className="text-sm text-green-900">
          Four total on-record sources (Barber + three veterans) in a single broadcast. This represents a higher
          contemporaneous on-record corroboration count than most prior major UAP disclosures.
        </p>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Pentagon Investigation</h3>
      <p className="text-sm text-gray-700 leading-relaxed">
        Following the January 18 broadcast, the Pentagon confirmed it had opened a formal investigation into Barber's
        claims. This institutional response — while not a confirmation of the program — is more direct than the
        Pentagon's typical response to UAP whistleblower disclosures, which historically has been no comment or
        categorical denial.
      </p>
    </div>
  </div>
);

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
          Barber's disclosure is recent (January 2025) and still developing. The evidentiary record documented here
          reflects the state of public information at time of broadcast. DECUR does not adjudicate these claims.
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

const BarberProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewTab />;
      case 'disclosure': return <DisclosureTab />;
      case 'claims':     return <ClaimsTab />;
      case 'evidence':   return <EvidenceTab />;
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

export default BarberProfile;
