import { FC, useState } from 'react';
import Link from 'next/link';
import { DocumentEntry } from '../../../types/data';
import ProfileTabBar from './ProfileTabBar';

/* ─── Shared config (also exported for DocumentsList) ──────────── */

export type AuthStatus = DocumentEntry['authenticity_status'];
export type DocType = DocumentEntry['document_type'];

export const authConfig: Record<AuthStatus, { label: string; classes: string }> = {
  'confirmed-official':     { label: 'Official Publication',    classes: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'  },
  'declassified-foia':      { label: 'Declassified / FOIA',     classes: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'   },
  'leaked-disputed':        { label: 'Leaked - Disputed',       classes: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  'confirmed-leaked':       { label: 'Leaked - Authenticated',  classes: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'   },
  'declassified-authentic': { label: 'Declassified',            classes: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'   },
  'confirmed-authentic':    { label: 'Confirmed Authentic',     classes: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  'documented-destroyed':   { label: 'Documented - Destroyed',  classes: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'     },
  'official-declassified':  { label: 'Official - Declassified', classes: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
};

export const docTypeLabel: Record<DocType, string> = {
  'government-report':               'Gov. Report',
  'government-memo':                 'Gov. Memo',
  'classified-memo':                 'Classified Memo',
  'intelligence-report':             'Intelligence Report',
  'academic-study':                  'Academic Study',
  'legislation':                     'Legislation',
  'military-memorandum':             'Military Memo',
  'intelligence-collection-directive': 'Intel Collection Directive',
  'intelligence-assessment':         'Intelligence Assessment',
  'government-assessment':           'Gov. Assessment',
};

/* ─── Detail Tabs ──────────────────────────────────────────────── */

const DETAIL_TABS = [
  { id: 'overview',      label: 'Overview' },
  { id: 'key-findings',  label: 'Key Findings' },
  { id: 'provenance',    label: 'Provenance' },
  { id: 'insider-links', label: 'Insider Links' },
  { id: 'limitations',   label: 'Limitations' },
] as const;

type DetailTabId = typeof DETAIL_TABS[number]['id'];

/* ─── Tab sub-components ───────────────────────────────────────── */

const OverviewTab: FC<{ d: DocumentEntry }> = ({ d }) => {
  const auth = authConfig[d.authenticity_status];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Date</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{d.date}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Document Type</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{docTypeLabel[d.document_type]}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Pages</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{d.page_count}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Authentication</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${auth.classes}`}>{auth.label}</span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Issuing Authority</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{d.issuing_authority}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Summary</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{d.summary}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Significance</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{d.significance}</p>
      </div>

      <div className="text-xs text-gray-400">
        <span className="font-medium">Source: </span>{d.public_url}
      </div>
    </div>
  );
};

const KeyFindingsTab: FC<{ d: DocumentEntry }> = ({ d }) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-500 dark:text-gray-400">Documented findings and conclusions from within the document.</p>
    <ul className="space-y-3">
      {d.key_findings.map((f, i) => (
        <li key={i} className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <span className="text-primary font-mono text-xs font-bold shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
          <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{f}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ProvenanceTab: FC<{ d: DocumentEntry }> = ({ d }) => (
  <div className="space-y-6">
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Authentication Status</p>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${authConfig[d.authenticity_status].classes}`}>
        {authConfig[d.authenticity_status].label}
      </span>
    </div>

    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Document History</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{d.provenance}</p>
    </div>
  </div>
);

const InsiderLinksTab: FC<{ d: DocumentEntry }> = ({ d }) => {
  if (d.insider_connections.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-400 dark:text-gray-500">No direct connections to DECUR insider profiles.</p>
      </div>
    );
  }

  const labels: Record<string, { name: string; role: string; note: string }> = {
    'eric-davis':    { name: 'Eric Davis',    role: 'Attributed author of the memo; subject of its contents',           note: 'Davis has not explicitly confirmed or denied the document\'s authenticity.' },
    'david-grusch':  { name: 'David Grusch',  role: 'Described the same oversight-denial mechanism in 2023 testimony',  note: 'Grusch\'s testimony corroborates the oversight failure described in multiple documents.' },
    'hal-puthoff':   { name: 'Hal Puthoff',   role: 'Named in Wilson-Davis as aware of the programs described',         note: 'Puthoff\'s long history in classified research programs intersects with multiple documents here.' },
    'chris-mellon':  { name: 'Chris Mellon',  role: 'Shaped NDAA UAP legislative language; cited Wilson-Davis in advocacy', note: 'Mellon is the primary legislative architect behind the UAP provisions.' },
    'luis-elizondo': { name: 'Luis Elizondo', role: 'AATIP director whose advocacy led directly to the UAPTF assessment', note: 'The UAPTF assessment is the institutionalized result of Elizondo\'s disclosure work.' },
    'garry-nolan':   { name: 'Garry Nolan',   role: 'Published peer-reviewed UAP methodology aligned with NASA study approach', note: 'Nolan\'s scientific methodology parallels the NASA study\'s recommendations.' },
    'nick-pope':     { name: 'Nick Pope',     role: 'UK MoD investigator who used the Halt Memo as a primary source',   note: 'Pope\'s 1993 reinvestigation relied on the Halt Memo and associated MoD classified file.' },
    'karl-nell':     { name: 'Karl Nell',     role: 'Disputed AARO Historical Record Report conclusions publicly',      note: 'Nell corroborated Grusch\'s testimony and disputed AARO\'s methodology.' },
    'jacques-vallee':{ name: 'Jacques Vallee', role: 'Scientific methodology approach aligned with NASA study recommendations', note: 'Vallee\'s decades of methodological advocacy for rigorous UAP science is echoed in the NASA study.' },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">Connections to DECUR insider profiles through direct involvement or corroborating testimony.</p>
      {d.insider_connections.map((id, i) => {
        const person = labels[id] ?? { name: id, role: 'DECUR insider', note: '' };
        return (
          <div key={i} className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{person.name.charAt(0)}</span>
            </div>
            <div>
              <Link href={`/figures/${id}`} className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">{person.name}</Link>
              <p className="text-xs text-primary leading-snug">{person.role}</p>
              {person.note && <p className="text-xs text-gray-400 mt-1 leading-snug">{person.note}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LimitationsTab: FC<{ d: DocumentEntry }> = ({ d }) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-500 dark:text-gray-400">Documented limitations, caveats, and contested aspects of this document.</p>
    <ul className="space-y-2">
      {d.limitations.map((lim, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-lg p-3">
          <span className="text-amber-400 mt-0.5 shrink-0 font-bold">!</span>
          <span className="leading-relaxed">{lim}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ─── DocumentDetail (exported) ────────────────────────────────── */

export interface DocumentDetailProps {
  d: DocumentEntry;
  onBack: () => void;
  backLabel?: string;
}

const DocumentDetail: FC<DocumentDetailProps> = ({ d, onBack, backLabel = 'Documents' }) => {
  const [activeTab, setActiveTab] = useState<DetailTabId>('overview');
  const auth = authConfig[d.authenticity_status];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewTab d={d} />;
      case 'key-findings':  return <KeyFindingsTab d={d} />;
      case 'provenance':    return <ProvenanceTab d={d} />;
      case 'insider-links': return <InsiderLinksTab d={d} />;
      case 'limitations':   return <LimitationsTab d={d} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-3 block"
        >
          ← {backLabel}
        </button>
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 leading-snug">{d.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${auth.classes}`}>{auth.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{docTypeLabel[d.document_type]}</span>
            <span className="text-xs text-gray-400">{d.date}</span>
          </div>
        </div>
      </div>

      <ProfileTabBar
        tabs={DETAIL_TABS as unknown as Array<{ id: string; label: string }>}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as DetailTabId)}
      />

      <div>{renderTab()}</div>
    </div>
  );
};

export default DocumentDetail;
