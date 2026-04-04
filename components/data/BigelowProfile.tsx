import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import bigelowData from '../../data/key-figures/bigelow.json';
import type { BigelowData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import { ps } from './shared/profileStyles';
import BookmarkButton from '../bookmarks/BookmarkButton';

const FigureCareerFlow = dynamic(() => import('./shared/FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

const data = bigelowData as unknown as BigelowData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'nids',            label: 'NIDS' },
  { id: 'baass',           label: 'BAASS / AAWSAP' },
  { id: 'skinwalker',      label: 'Skinwalker Ranch' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'network',         label: 'People' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tab components ──────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Research Patron</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
          Bigelow's profile differs from other DECUR insiders. He is not a government whistleblower
          or direct UAP witness - he is the institutional patron whose funding and organizational
          infrastructure made modern classified UAP research possible. His inclusion bridges the
          1990s Las Vegas research network with the post-2007 AAWSAP disclosure era.
        </p>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-2`}>Background</h3>
        <p className={`${ps.body} leading-relaxed`}>{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Research Period</p>
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
        <h3 className={`${ps.h3} mb-3`}>Background</h3>
        <ul className="space-y-1.5">
          {profile.background.map((item, i) => (
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

const NidsTab: FC = () => {
  const { nids } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Founded</p>
          <p className={ps.value}>{nids.founded}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Dissolved</p>
          <p className={ps.value}>{nids.dissolved}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Location</p>
          <p className={ps.value}>{nids.location}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Director</p>
          <p className={ps.value}>{nids.director}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Funding</p>
          <p className={ps.value}>{nids.funding}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Mission</h3>
        <p className={`${ps.body} leading-relaxed`}>{nids.mission}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Notable Members</h3>
        <ul className="space-y-2">
          {nids.notable_members.map((m, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Outputs</h3>
        <ul className="space-y-1.5">
          {nids.key_outputs.map((o, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Bridge Significance</p>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{nids.significance}</p>
      </div>
    </div>
  );
};

const BaassTab: FC = () => {
  const { baass_aawsap } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Contract Award</p>
          <p className={ps.value}>{baass_aawsap.contract_award}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Period</p>
          <p className={ps.value}>{baass_aawsap.period}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Contracting Agency</p>
          <p className={ps.value}>{baass_aawsap.contracting_agency}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Staff</p>
          <p className={ps.value}>{baass_aawsap.staff}</p>
        </div>
        <div className={`${ps.accentBox} sm:col-span-2 flex items-center gap-3`}>
          <span className="text-2xl font-bold text-primary">$22M</span>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{baass_aawsap.contract_value}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Program Products</h3>
        <ul className="space-y-2">
          {baass_aawsap.products.map((p, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={ps.infoCard}>
        <p className={`${ps.label} mb-1`}>Congressional Nexus</p>
        <p className={`${ps.body} leading-relaxed`}>{baass_aawsap.congressional_nexus}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">TTSA Connection</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{baass_aawsap.ttsa_connection}</p>
      </div>

      <div className={ps.infoCard}>
        <p className={`${ps.label} mb-1`}>FOIA Note</p>
        <p className={`${ps.body} leading-relaxed`}>{baass_aawsap.declassified_dird_note}</p>
      </div>
    </div>
  );
};

const SkinwalkerTab: FC = () => {
  const { skinwalker_ranch } = data;
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Scope Note</p>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{skinwalker_ranch.notes}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Location</p>
          <p className={ps.value}>{skinwalker_ranch.location}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Research Period</p>
          <p className={ps.value}>{skinwalker_ranch.research_period}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Purchased</p>
          <p className={ps.value}>{skinwalker_ranch.purchased} from {skinwalker_ranch.seller} for {skinwalker_ranch.purchase_price}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Sold</p>
          <p className={ps.value}>{skinwalker_ranch.sold} to {skinwalker_ranch.buyer_2016}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Documented Phenomena</h3>
        <ul className="space-y-2">
          {skinwalker_ranch.phenomena_reported.map((p, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Research Approach</h3>
        <p className={`${ps.body} leading-relaxed`}>{skinwalker_ranch.research_approach}</p>
      </div>

      <div className={ps.borderCard}>
        <p className={`${ps.label} mb-1`}>Published Account</p>
        <p className={`${ps.body} leading-relaxed`}>{skinwalker_ranch.published_account}</p>
      </div>
    </div>
  );
};

const ClaimsTab: FC = () => {
  const { claims } = data;
  return (
    <div className="space-y-6">
      <ClaimsStatusBar claims={claims} />
      <div className="space-y-4">
        {claims.map((c, i) => {
          const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
          return (
            <div key={i} className={`${ps.borderCard} space-y-2`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{c.claim}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{c.basis}</p>
              {c.notes && (
                <p className={`${ps.muted} italic`}>{c.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DisclosuresTab: FC = () => (
  <SharedDisclosuresTab disclosures={data.disclosures} />
);

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} introText="Key relationships spanning both the 1990s research network and the modern disclosure ecosystem." />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab credibility={data.credibility} variant="compact" />
);

/* ─── Main component ──────────────────────────────────────────── */

const BigelowProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
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
      case 'nids':        return <NidsTab />;
      case 'baass':       return <BaassTab />;
      case 'skinwalker':  return <SkinwalkerTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
      case 'network':     return <NetworkTab />;
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
      actions={<BookmarkButton contentType="figure" contentId={data.profile.id} contentName={data.profile.name} />}
      onBack={onBack}
      backLabel={backLabel}
      networkNodeId={networkNodeId}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default BigelowProfile;
