import { FC, useState } from 'react';
import barberData from '../../data/key-figures/barber.json';
import type { BarberData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import { InsiderProfileProps } from '../../types/components';
import PersonCard from './shared/PersonCard';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedCareerNetworkTab from './shared/tabs/SharedCareerNetworkTab';
import SharedOverviewTab from './shared/tabs/SharedOverviewTab';
import SharedClaimsTab from './shared/tabs/SharedClaimsTab';
import { ps } from './shared/profileStyles';

const data = barberData as unknown as BarberData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'disclosure',      label: 'Disclosure' },
  { id: 'claims',          label: 'Claims' },
  { id: 'evidence',        label: 'Evidence' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

const DisclosureTab: FC = () => {
  const { disclosures } = data;
  return (
    <div className="space-y-6">
      <div className={ps.accentBoxLg}>
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Disclosure Context</p>
        <p className={`${ps.body} leading-relaxed`}>
          Jake Barber's public disclosure was made through investigative journalist Ross Coulthart of NewsNation.
          Unlike institutional whistleblowers such as David Grusch who filed formal ICIG complaints, Barber chose
          a direct media path — providing operational details, corroborating witnesses, and previously unseen video
          footage of a retrieval operation in a single broadcast.
        </p>
      </div>

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

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Pentagon Response</p>
        <p className="text-sm text-amber-900 dark:text-amber-100">
          Following the NewsNation broadcast on January 18, 2025, the Pentagon confirmed it had opened an
          investigation into Barber's claims. This is a more direct institutional acknowledgment than was
          received for most prior disclosures.
        </p>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Associated People</h3>
        <div className="space-y-3">
          {data.associated_people.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </div>
    </div>
  );
};

const EvidenceTab: FC = () => (
  <div className="space-y-6">
    <div>
      <h3 className={`${ps.h3} mb-2`}>Retrieval Video Footage</h3>
      <p className={`${ps.body} leading-relaxed mb-3`}>
        Barber provided NewsNation with video footage of a UAP retrieval operation involving an egg-shaped white object.
        The footage was described by NewsNation as never-before-seen operational footage — the first time video of an
        alleged crash/retrieval operation has been broadcast in the modern disclosure era. The footage was partially
        obscured to protect operational security and the identities of personnel.
      </p>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Authentication Status</p>
        <p className="text-sm text-amber-900 dark:text-amber-100">
          As of the January 18, 2025 broadcast, the footage has been presented by NewsNation as genuine but has not
          been independently authenticated by a third party with verified chain of custody. The Pentagon's investigation
          announcement may eventually include a formal assessment.
        </p>
      </div>
    </div>

    <div>
      <h3 className={`${ps.h3} mb-3`}>On-Camera Corroboration</h3>
      <p className={`${ps.body} leading-relaxed mb-3`}>
        Three additional high-level military veterans appeared on camera during the NewsNation special to corroborate
        Barber's account. This is a qualitatively different form of corroboration than secondhand references — these
        individuals placed their identities and careers on the record in the same broadcast.
      </p>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Corroboration Level</p>
        <p className="text-sm text-green-900 dark:text-green-100">
          Four total on-record sources (Barber + three veterans) in a single broadcast. This represents a higher
          contemporaneous on-record corroboration count than most prior major UAP disclosures.
        </p>
      </div>
    </div>

    <div>
      <h3 className={`${ps.h3} mb-2`}>Pentagon Investigation</h3>
      <p className={`${ps.body} leading-relaxed`}>
        Following the January 18 broadcast, the Pentagon confirmed it had opened a formal investigation into Barber's
        claims. This institutional response — while not a confirmation of the program — is more direct than the
        Pentagon's typical response to UAP whistleblower disclosures, which historically has been no comment or
        categorical denial.
      </p>
    </div>
  </div>
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section presents documented arguments for and against Barber's credibility. DECUR does not adjudicate these claims; they are presented for methodological transparency."
  />
);

const BarberProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'overview':   return <SharedOverviewTab profile={data.profile as any} />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'career-network': return <SharedCareerNetworkTab profile={data.profile} career_connections={(data as any).career_connections} />;
      case 'disclosure': return <DisclosureTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'claims':     return <SharedClaimsTab claims={data.claims as any} />;
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

export default BarberProfile;
