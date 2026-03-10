import { FC, useState } from 'react';
import bigelowData from '../../data/insiders/bigelow.json';
import ProfileTabBar from './shared/ProfileTabBar';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';

const data = bigelowData as typeof bigelowData;

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'nids',       label: 'NIDS' },
  { id: 'baass',      label: 'BAASS / AAWSAP' },
  { id: 'skinwalker', label: 'Skinwalker Ranch' },
  { id: 'claims',     label: 'Claims' },
  { id: 'disclosures',label: 'Disclosures' },
  { id: 'network',    label: 'Network' },
  { id: 'assessment', label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

interface BigelowProfileProps {
  onBack: () => void;
}

/* ─── Tab components ──────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Research Patron</p>
        <p className="text-sm text-blue-900 leading-relaxed">
          Bigelow's profile differs from other DECUR insiders. He is not a government whistleblower
          or direct UAP witness - he is the institutional patron whose funding and organizational
          infrastructure made modern classified UAP research possible. His inclusion bridges the
          1990s Las Vegas research network with the post-2007 AAWSAP disclosure era.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Background</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Research Period</p>
          <p className="text-sm text-gray-800">{profile.service_period}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Clearance</p>
          <p className="text-sm text-gray-800">{profile.clearance}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Organizations</p>
          <p className="text-sm text-gray-800">{profile.organizations.join(' · ')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Roles</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.roles.map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Background</h3>
        <ul className="space-y-1.5">
          {profile.background.map((item, i) => (
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

const NidsTab: FC = () => {
  const { nids } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Founded</p>
          <p className="text-sm text-gray-800">{nids.founded}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Dissolved</p>
          <p className="text-sm text-gray-800">{nids.dissolved}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Location</p>
          <p className="text-sm text-gray-800">{nids.location}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Director</p>
          <p className="text-sm text-gray-800">{nids.director}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Funding</p>
          <p className="text-sm text-gray-800">{nids.funding}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Mission</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{nids.mission}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Notable Members</h3>
        <ul className="space-y-2">
          {nids.notable_members.map((m, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Key Outputs</h3>
        <ul className="space-y-1.5">
          {nids.key_outputs.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Bridge Significance</p>
        <p className="text-sm text-amber-900 leading-relaxed">{nids.significance}</p>
      </div>
    </div>
  );
};

const BaassTab: FC = () => {
  const { baass_aawsap } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Contract Award</p>
          <p className="text-sm text-gray-800">{baass_aawsap.contract_award}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Period</p>
          <p className="text-sm text-gray-800">{baass_aawsap.period}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Contracting Agency</p>
          <p className="text-sm text-gray-800">{baass_aawsap.contracting_agency}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Staff</p>
          <p className="text-sm text-gray-800">{baass_aawsap.staff}</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sm:col-span-2 flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">$22M</span>
          <div>
            <p className="text-sm font-medium text-gray-800">{baass_aawsap.contract_value}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Program Products</h3>
        <ul className="space-y-2">
          {baass_aawsap.products.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Congressional Nexus</p>
        <p className="text-sm text-gray-700 leading-relaxed">{baass_aawsap.congressional_nexus}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">TTSA Connection</p>
        <p className="text-sm text-blue-900 leading-relaxed">{baass_aawsap.ttsa_connection}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">FOIA Note</p>
        <p className="text-sm text-gray-700 leading-relaxed">{baass_aawsap.declassified_dird_note}</p>
      </div>
    </div>
  );
};

const SkinwalkerTab: FC = () => {
  const { skinwalker_ranch } = data;
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Scope Note</p>
        <p className="text-sm text-amber-900 leading-relaxed">{skinwalker_ranch.notes}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Location</p>
          <p className="text-sm text-gray-800">{skinwalker_ranch.location}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Research Period</p>
          <p className="text-sm text-gray-800">{skinwalker_ranch.research_period}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Purchased</p>
          <p className="text-sm text-gray-800">{skinwalker_ranch.purchased} from {skinwalker_ranch.seller} for {skinwalker_ranch.purchase_price}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Sold</p>
          <p className="text-sm text-gray-800">{skinwalker_ranch.sold} to {skinwalker_ranch.buyer_2016}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Documented Phenomena</h3>
        <ul className="space-y-2">
          {skinwalker_ranch.phenomena_reported.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Research Approach</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{skinwalker_ranch.research_approach}</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Published Account</p>
        <p className="text-sm text-gray-700 leading-relaxed">{skinwalker_ranch.published_account}</p>
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
          const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-gray-100 text-gray-600' };
          return (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900 leading-snug">{c.claim}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{c.basis}</p>
              {c.notes && (
                <p className="text-xs text-gray-400 italic">{c.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DisclosuresTab: FC = () => {
  const { disclosures } = data;
  return (
    <div className="space-y-4">
      {disclosures.map((d, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{d.date}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{d.type}</span>
            <span className="text-xs text-gray-400">{d.outlet}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{d.description}</p>
        </div>
      ))}
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Key relationships spanning both the 1990s research network and the modern disclosure ecosystem.</p>
      {associated_people.map((p, i) => (
        <div key={i} className="flex gap-3 border border-gray-200 rounded-lg p-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">{p.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500 leading-snug">{p.relation}</p>
          </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-2">Supporting</h3>
          <ul className="space-y-2">
            {credibility.supporting.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-green-500 mt-0.5 shrink-0">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-600 mb-2">Contradicting</h3>
          <ul className="space-y-2">
            {credibility.contradicting.map((c, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-red-400 mt-0.5 shrink-0">-</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────── */

const BigelowProfile: FC<BigelowProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1 shrink-0"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900">{data.profile.name}</h2>
          <p className="text-sm text-primary font-medium mt-0.5">{data.profile.roles[0]}</p>
          <p className="text-xs text-gray-400 mt-0.5">{data.profile.service_period}</p>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabBar
        tabs={TABS as unknown as Array<{ id: string; label: string }>}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      />

      {/* Tab content */}
      <div>{renderTab()}</div>
    </div>
  );
};

export default BigelowProfile;
