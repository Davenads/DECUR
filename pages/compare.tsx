import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { FC } from 'react';
import SeoHead from '../components/SeoHead';
import { insiderRegistry } from '../data/key-figures/registry';
import insiderIndex from '../data/key-figures/index.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IndexEntry {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  status: string;
  summary: string;
}

interface KeyEvent {
  year: string;
  event: string;
}

interface AssociatedPerson {
  id: string;
  name: string;
  role: string;
  relationship?: string;
}

interface Disclosure {
  date: string;
  type: string;
  title: string;
  outlet?: string;
}

interface ProfileData {
  id: string;
  name: string;
  roles?: string[];
  service_period?: string;
  organizations?: string[];
  clearance?: string;
  summary?: string;
  key_events?: KeyEvent[];
}

interface FigureData {
  profile: ProfileData;
  associated_people?: AssociatedPerson[];
  disclosures?: Disclosure[];
  credibility?: { supporting?: string[]; contradicting?: string[] };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const detailedFigures = (insiderIndex as IndexEntry[]).filter(e => e.status === 'detailed');

function getProfileData(id: string): FigureData | null {
  const raw = insiderRegistry[id];
  if (!raw || !raw.profile) return null;
  return raw as FigureData;
}

function getIndexEntry(id: string): IndexEntry | null {
  return detailedFigures.find(e => e.id === id) ?? null;
}

function sharedOrgs(a: string[], b: string[]): Set<string> {
  const bLower = new Set(b.map(o => o.toLowerCase()));
  return new Set(a.filter(o => bLower.has(o.toLowerCase())));
}

function sharedPeopleIds(a: AssociatedPerson[], b: AssociatedPerson[]): Set<string> {
  const bIds = new Set(b.map(p => p.id));
  return new Set(a.filter(p => bIds.has(p.id)).map(p => p.id));
}

interface MergedEvent { year: string; event: string; side: 'a' | 'b' | 'both'; }

function mergeTimelines(eventsA: KeyEvent[], eventsB: KeyEvent[]): MergedEvent[] {
  const all: MergedEvent[] = [
    ...eventsA.map(e => ({ year: e.year, event: e.event, side: 'a' as const })),
    ...eventsB.map(e => ({ year: e.year, event: e.event, side: 'b' as const })),
  ];
  all.sort((x, y) => x.year.localeCompare(y.year));
  return all;
}

function disclosureTypeCounts(disclosures: Disclosure[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const d of disclosures) {
    const t = d.type ?? 'other';
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}

const DISCLOSURE_LABEL: Record<string, string> = {
  'congressional-testimony': 'Testimony',
  'congressional-briefing': 'Briefing',
  'interview': 'Interview',
  'article': 'Article',
  'written': 'Written',
  'print': 'Print',
  'television': 'TV',
  'podcast': 'Podcast',
  'radio': 'Radio',
  'speech': 'Speech',
  'academic-paper': 'Academic',
  'documentary': 'Documentary',
  'film': 'Film',
  'conference': 'Conference',
  'declassification': 'Declassified',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FigurePickerProps {
  label: string;
  selectedId: string;
  otherSelectedId: string;
  onChange: (id: string) => void;
}

const FigurePicker: FC<FigurePickerProps> = ({ label, selectedId, otherSelectedId, onChange }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return detailedFigures.filter(
      e => e.id !== otherSelectedId && (
        !q || e.name.toLowerCase().includes(q) || e.role?.toLowerCase().includes(q) || e.affiliation?.toLowerCase().includes(q)
      )
    );
  }, [query, otherSelectedId]);

  const selected = getIndexEntry(selectedId);

  const handleSelect = useCallback((id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  }, [onChange]);

  return (
    <div className="relative flex-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{label}</p>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 hover:border-primary transition-colors"
      >
        {selected ? (
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selected.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{selected.role}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">Select a figure...</p>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              autoFocus
              type="text"
              placeholder="Search by name or role..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded outline-none focus:border-primary"
            />
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.slice(0, 40).map(e => (
              <button
                key={e.id}
                onClick={() => handleSelect(e.id)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{e.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{e.role}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Shared badge
const SharedBadge: FC = () => (
  <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:text-primary-light uppercase tracking-wide">
    shared
  </span>
);

interface CompareColumnProps {
  data: FigureData;
  indexEntry: IndexEntry;
  sharedOrgSet: Set<string>;
  sharedPeopleSet: Set<string>;
  side: 'a' | 'b';
  mergedEvents: MergedEvent[];
}

const CompareColumn: FC<CompareColumnProps> = ({ data, indexEntry, sharedOrgSet, sharedPeopleSet, side, mergedEvents }) => {
  const p = data.profile;
  const disclosures = data.disclosures ?? [];
  const credibility = data.credibility;
  const assocPeople = data.associated_people ?? [];

  const discCounts = useMemo(() => disclosureTypeCounts(disclosures), [disclosures]);
  const myEvents = mergedEvents.filter(e => e.side === side || e.side === 'both');

  return (
    <div className="space-y-5 min-w-0">

      {/* Identity */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Summary</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">{p.summary || indexEntry.summary}</p>
        </div>
        {p.service_period && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">Service Period</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{p.service_period}</p>
          </div>
        )}
        {p.clearance && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">Clearance</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{p.clearance}</p>
          </div>
        )}
      </div>

      {/* Roles */}
      {p.roles && p.roles.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Roles</p>
          <ul className="space-y-1">
            {p.roles.map((r, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Organizations */}
      {p.organizations && p.organizations.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Organizations</p>
          <div className="flex flex-wrap gap-1.5">
            {p.organizations.map((org, i) => {
              const isShared = sharedOrgSet.has(org);
              return (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isShared
                      ? 'bg-primary/10 text-primary dark:text-primary-light ring-1 ring-primary/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {org}
                  {isShared && ' ✦'}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline (this figure's events only) */}
      {myEvents.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Key Events</p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {myEvents.map((e, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0 pt-0.5 w-16">{e.year}</span>
                <span className="text-gray-700 dark:text-gray-300 leading-snug">{e.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated People */}
      {assocPeople.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Associated People</p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {assocPeople.map((person, i) => {
              const isShared = sharedPeopleSet.has(person.id);
              return (
                <div key={i} className={`text-sm flex items-start gap-2 ${isShared ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                  <span className="shrink-0 mt-0.5">{isShared ? '✦' : '·'}</span>
                  <span>
                    {person.name}
                    {isShared && <SharedBadge />}
                    <span className="block text-xs text-gray-400 dark:text-gray-500 font-normal">{person.role}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disclosures */}
      {disclosures.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
            Disclosures <span className="ml-1 text-gray-400">({disclosures.length})</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(discCounts).map(([type, count]) => (
              <span key={type} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                {DISCLOSURE_LABEL[type] ?? type} {count > 1 && <span className="font-semibold text-gray-900 dark:text-gray-100 ml-0.5">×{count}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Credibility signals */}
      {credibility && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Credibility Signals</p>
          <div className="flex gap-4">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 font-mono">
                {credibility.supporting?.length ?? 0}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Supporting</p>
            </div>
            <div className="w-px bg-gray-100 dark:bg-gray-800" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-red-400 dark:text-red-400 font-mono">
                {credibility.contradicting?.length ?? 0}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Contradicting</p>
            </div>
          </div>
        </div>
      )}

      {/* Link to full profile */}
      <Link
        href={`/figures/${p.id}`}
        className="block text-center text-xs text-primary dark:text-primary-light hover:underline py-2"
      >
        View full profile →
      </Link>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const ComparePage: FC = () => {
  const router = useRouter();

  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const [mobileTab, setMobileTab] = useState<'a' | 'b'>('a');
  const [mounted, setMounted] = useState(false);

  // Sync from URL on mount
  useEffect(() => {
    setMounted(true);
    if (!router.isReady) return;
    const a = typeof router.query.a === 'string' ? router.query.a : '';
    const b = typeof router.query.b === 'string' ? router.query.b : '';
    if (a) setIdA(a);
    if (b) setIdB(b);
  }, [router.isReady, router.query.a, router.query.b]);

  // Push URL when both are selected
  useEffect(() => {
    if (!mounted || !router.isReady) return;
    if (idA && idB) {
      const current = { a: router.query.a, b: router.query.b };
      if (current.a !== idA || current.b !== idB) {
        router.replace(`/compare?a=${idA}&b=${idB}`, undefined, { shallow: true });
      }
    }
  }, [idA, idB, mounted, router]);

  const dataA = useMemo(() => (idA ? getProfileData(idA) : null), [idA]);
  const dataB = useMemo(() => (idB ? getProfileData(idB) : null), [idB]);
  const entryA = useMemo(() => (idA ? getIndexEntry(idA) : null), [idA]);
  const entryB = useMemo(() => (idB ? getIndexEntry(idB) : null), [idB]);

  const bothSelected = !!(idA && idB && dataA && dataB && entryA && entryB);

  const sharedOrgSet = useMemo(() => {
    if (!dataA?.profile.organizations || !dataB?.profile.organizations) return new Set<string>();
    return sharedOrgs(dataA.profile.organizations, dataB.profile.organizations);
  }, [dataA, dataB]);

  const sharedPeopleSet = useMemo(() => {
    if (!dataA?.associated_people || !dataB?.associated_people) return new Set<string>();
    return sharedPeopleIds(dataA.associated_people, dataB.associated_people);
  }, [dataA, dataB]);

  const mergedEvents = useMemo(() => {
    if (!dataA?.profile.key_events || !dataB?.profile.key_events) return [];
    return mergeTimelines(dataA.profile.key_events, dataB.profile.key_events);
  }, [dataA, dataB]);

  const handleSwap = () => {
    const tmp = idA;
    setIdA(idB);
    setIdB(tmp);
  };

  return (
    <>
      <SeoHead
        title={bothSelected ? `Compare: ${entryA!.name} vs. ${entryB!.name} - DECUR` : 'Compare Figures - DECUR'}
        description="Side-by-side comparison of key figures in UAP and NHI research."
        path="/compare"
      />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Compare Figures</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select two figures to compare their backgrounds, connections, and credibility signals side-by-side.
          </p>
        </div>

        {/* Pickers row */}
        <div className="flex items-end gap-3">
          <FigurePicker label="Figure A" selectedId={idA} otherSelectedId={idB} onChange={setIdA} />

          {/* Swap button */}
          <button
            onClick={handleSwap}
            disabled={!idA || !idB}
            title="Swap figures"
            className="mb-0.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 hover:text-primary dark:hover:text-primary-light hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <FigurePicker label="Figure B" selectedId={idB} otherSelectedId={idA} onChange={setIdB} />
        </div>

        {/* Empty state */}
        {!bothSelected && (
          <div className="py-16 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {!idA && !idB
                ? 'Select two figures above to begin comparing.'
                : 'Select a second figure to begin comparing.'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Try: Elizondo &amp; Grusch, Puthoff &amp; Davis, Lacatski &amp; Bigelow
            </p>
          </div>
        )}

        {/* Comparison view */}
        {bothSelected && dataA && dataB && entryA && entryB && (
          <>
            {/* Shared signal bar */}
            {(sharedOrgSet.size > 0 || sharedPeopleSet.size > 0) && (
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg px-5 py-3 flex flex-wrap gap-4 text-sm">
                {sharedOrgSet.size > 0 && (
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-primary dark:text-primary-light">{sharedOrgSet.size}</span> shared organization{sharedOrgSet.size !== 1 ? 's' : ''}{' '}
                    <span className="text-gray-400 dark:text-gray-500">({Array.from(sharedOrgSet).join(', ')})</span>
                  </span>
                )}
                {sharedPeopleSet.size > 0 && (
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-primary dark:text-primary-light">{sharedPeopleSet.size}</span> shared connection{sharedPeopleSet.size !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}

            {/* Column headers - desktop */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              <div className="border-b-2 border-primary pb-3">
                <Link href={`/figures/${entryA.id}`} className="hover:text-primary transition-colors">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{entryA.name}</h2>
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{entryA.role}</p>
              </div>
              <div className="border-b-2 border-gray-300 dark:border-gray-600 pb-3">
                <Link href={`/figures/${entryB.id}`} className="hover:text-primary transition-colors">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{entryB.name}</h2>
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{entryB.role}</p>
              </div>
            </div>

            {/* Mobile tab toggle */}
            <div className="md:hidden flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setMobileTab('a')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mobileTab === 'a' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'}`}
              >
                {entryA.name.split(' ').slice(-1)[0]}
              </button>
              <button
                onClick={() => setMobileTab('b')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mobileTab === 'b' ? 'bg-gray-600 text-white dark:bg-gray-500' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'}`}
              >
                {entryB.name.split(' ').slice(-1)[0]}
              </button>
            </div>

            {/* Desktop: two columns */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              <CompareColumn
                data={dataA} indexEntry={entryA}
                sharedOrgSet={sharedOrgSet} sharedPeopleSet={sharedPeopleSet}
                side="a" mergedEvents={mergedEvents}
              />
              <CompareColumn
                data={dataB} indexEntry={entryB}
                sharedOrgSet={sharedOrgSet} sharedPeopleSet={sharedPeopleSet}
                side="b" mergedEvents={mergedEvents}
              />
            </div>

            {/* Mobile: single column, tab-controlled */}
            <div className="md:hidden">
              {mobileTab === 'a' ? (
                <CompareColumn
                  data={dataA} indexEntry={entryA}
                  sharedOrgSet={sharedOrgSet} sharedPeopleSet={sharedPeopleSet}
                  side="a" mergedEvents={mergedEvents}
                />
              ) : (
                <CompareColumn
                  data={dataB} indexEntry={entryB}
                  sharedOrgSet={sharedOrgSet} sharedPeopleSet={sharedPeopleSet}
                  side="b" mergedEvents={mergedEvents}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ComparePage;
