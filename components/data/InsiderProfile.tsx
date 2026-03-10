import { FC, useState } from 'react';
import { BurischData, BurischProject, BurischDocument, BurischTestimony, BurischConcept, MJ12Member } from '../../types/data';
import burischData from '../../data/insiders/burisch.json';

const data = burischData as BurischData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'entity',     label: 'Chi\'el\'ah' },
  { id: 'facility',   label: 'S-4 Facility' },
  { id: 'projects',   label: 'Projects' },
  { id: 'documents',  label: 'Documents' },
  { id: 'timeline',   label: 'Timeline' },
  { id: 'testimonies',label: 'Testimonies' },
  { id: 'mj12',       label: 'MJ-12' },
  { id: 'concepts',   label: 'Concepts' },
  { id: 'assessment', label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

interface InsiderProfileProps {
  id: string;
  onBack: () => void;
}

/* ─── Sub-views ──────────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Background</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Service Period</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Early Life</h3>
        <ul className="space-y-1.5">
          {profile.early_life.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Events</h3>
        <div className="space-y-2">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{ev.year}</span>
              <span className="text-gray-700">{ev.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EntityTab: FC = () => {
  const { entity } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{entity.name} <span className="text-gray-400 font-normal text-base">/ {entity.designation}</span></h3>
        <p className="text-xs text-gray-400">{entity.classification}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Origin</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(entity.origin).map(([key, val]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{key.replace(/_/g, ' ')}</p>
              <p className="text-sm text-gray-800">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Physical Description</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(entity.physical).map(([key, val]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{key.replace(/_/g, ' ')}</p>
              <p className="text-sm text-gray-800">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Medical Conditions</h4>
        <ul className="space-y-1.5">
          {entity.medical_conditions.map((c, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-amber-500 mt-0.5">⚠</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Communication</p>
          <p className="text-sm text-gray-800">{entity.communication}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Age / Name Meaning</p>
          <p className="text-sm text-gray-800">{entity.age}</p>
          <p className="text-sm text-gray-500 mt-1">{entity.name_meaning}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Containment</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-1">
          <p className="text-sm text-gray-800"><span className="font-medium">Facility: </span>{entity.containment.facility}</p>
          <p className="text-sm text-gray-800"><span className="font-medium">Environment: </span>{entity.containment.sphere}</p>
          <p className="text-sm text-gray-500 italic">{entity.containment.notes}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Mission Objectives</h4>
        <ul className="space-y-1.5">
          {entity.mission.map((m, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5">›</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Connection to Burisch</p>
        <p className="text-sm text-gray-700">{entity.connection_to_burisch}</p>
      </div>
    </div>
  );
};

const FacilityTab: FC = () => {
  const { facility } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{facility.name}</h3>
        <p className="text-xs text-gray-400 mb-1">
          {facility.aliases.join(' · ')}
        </p>
        <p className="text-sm text-gray-600">{facility.location}</p>
        <p className="text-sm text-gray-600">{facility.construction}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Security Protocols</h4>
        <ul className="space-y-1.5">
          {facility.security.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-red-400 mt-0.5 shrink-0">■</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {facility.notable_equipment.map((eq, i) => {
        const equipment = eq as Record<string, unknown>;
        return (
          <div key={i} className="border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-900 mb-3">{equipment.name as string}</h4>
            <p className="text-sm text-gray-700 mb-3">{equipment.description as string}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(equipment)
                .filter(([k]) => !['name', 'description'].includes(k))
                .map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded p-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-800">
                      {Array.isArray(val) ? (val as string[]).join(', ') : String(val)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        );
      })}

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Notable Visitors</h4>
        <ul className="space-y-1.5">
          {facility.notable_visitors.map((v, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5">›</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ProjectsTab: FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { projects } = data;

  const umbrella = projects.find(p => p.id === 'project-aquarius');
  const subProjects = projects.filter(p => p.id !== 'project-aquarius');

  return (
    <div className="space-y-5">
      {umbrella && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Umbrella Program</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{umbrella.name}</h3>
          {umbrella.established && (
            <p className="text-xs text-gray-400 mb-2">Est. {umbrella.established} · {umbrella.classification}</p>
          )}
          <p className="text-sm text-gray-700">{umbrella.purpose}</p>
          {umbrella.admin && <p className="text-xs text-gray-500 mt-2">{umbrella.admin}</p>}
        </div>
      )}

      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sub-Projects</h4>
      <div className="space-y-2">
        {subProjects.map((proj: BurischProject) => {
          const isOpen = expanded === proj.id;
          return (
            <div key={proj.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : proj.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="font-medium text-gray-900 text-sm">{proj.name}</span>
                  {proj.aliases && (
                    <span className="text-xs text-gray-400 ml-2">({proj.aliases.join(', ')})</span>
                  )}
                </div>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
                  <p className="text-sm text-gray-700 pt-3">{proj.purpose}</p>
                  {proj.key_personnel && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Key Personnel:</span> {proj.key_personnel.join(', ')}</p>
                  )}
                  {proj.location && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Location:</span> {proj.location}</p>
                  )}
                  {proj.discoveries && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Discoveries:</span> {proj.discoveries.join(', ')}</p>
                  )}
                  {proj.outcome && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Outcome:</span> {proj.outcome}</p>
                  )}
                  {proj.notes && (
                    <p className="text-xs text-gray-500 italic">{proj.notes}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DocumentsTab: FC = () => {
  const { documents } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Primary documents associated with Burisch's research and service record.</p>
      {documents.map((doc: BurischDocument) => (
        <div key={doc.id} className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-0.5">{doc.common_name}</h4>
              <p className="text-xs font-mono text-gray-400 mb-2">{doc.designation}</p>
              {doc.date && <p className="text-xs text-gray-400 mb-2">{doc.date}</p>}
              {doc.authors && (
                <p className="text-xs text-gray-500 mb-2"><span className="font-medium">Authors:</span> {doc.authors.join(', ')}</p>
              )}
              <p className="text-sm text-gray-700">{doc.significance}</p>
              {doc.leak_history && (
                <p className="text-xs text-gray-500 mt-2 italic">{doc.leak_history}</p>
              )}
            </div>
            {doc.source_url && (
              <a
                href={doc.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline whitespace-nowrap shrink-0"
              >
                Source ↗
              </a>
            )}
          </div>
          {doc.status && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Status: </span>
              <span className="text-xs text-gray-600">{doc.status}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TimelineTab: FC = () => {
  const { timeline } = data;
  const categories = Array.from(new Set(timeline.map(e => e.category)));
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? timeline : timeline.filter(e => e.category === filter);

  const categoryColors: Record<string, string> = {
    biography: 'bg-blue-100 text-blue-700',
    operations: 'bg-red-100 text-red-700',
    'entity-contact': 'bg-purple-100 text-purple-700',
    documents: 'bg-amber-100 text-amber-700',
    research: 'bg-green-100 text-green-700',
    archive: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize transition-colors ${
              filter === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <div className="relative pl-6 border-l-2 border-gray-100 space-y-4">
        {filtered.map((ev, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-gray-400 whitespace-nowrap pt-0.5">{ev.date}</span>
              <div>
                <p className="text-sm text-gray-800 leading-relaxed">{ev.event}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block font-medium ${categoryColors[ev.category] ?? 'bg-gray-100 text-gray-500'}`}>
                  {ev.category.replace(/-/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TestimoniesTab: FC = () => {
  const { testimonies } = data;
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Corroborating accounts from independent witnesses whose testimony intersects with Burisch's narrative.
      </p>
      {testimonies.map((t: BurischTestimony) => (
        <div key={t.id} className="border border-gray-200 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 mb-0.5">{t.witness}</h4>
          {t.real_identity && <p className="text-xs text-gray-400 mb-1">{t.real_identity}</p>}
          {t.introduced_by && <p className="text-xs text-gray-400 mb-2">Introduced by: {t.introduced_by}</p>}
          <p className="text-sm text-gray-600 mb-3">{t.background}</p>

          <div className="mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Key Claims</p>
            <ul className="space-y-1">
              {t.key_claims.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-primary mt-0.5 shrink-0">›</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded p-3">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Burisch Connection</p>
            <p className="text-sm text-gray-700">{t.burisch_connection}</p>
          </div>

          {t.notes && <p className="text-xs text-gray-400 mt-2 italic">{t.notes}</p>}
          {t.source && <p className="text-xs text-gray-400 mt-1">Source: {t.source}</p>}
        </div>
      ))}
    </div>
  );
};

const MJ12Tab: FC = () => {
  const { mj12 } = data;
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Majestic-12 Roster (2006)</h3>
        <p className="text-sm text-gray-500">
          Reported membership at time of Majestic-12 adjournment, as disclosed by Dan Burisch in May 2008.
        </p>
      </div>
      <div className="grid gap-3">
        {mj12.map((member: MJ12Member) => (
          <div key={member.seat} className="flex gap-4 border border-gray-200 rounded-lg p-4 items-start">
            <div className="shrink-0">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                {member.seat}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{member.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{member.roles.join(' · ')}</p>
              {member.notes && <p className="text-xs text-gray-400 mt-1 italic">{member.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConceptsTab: FC = () => {
  const { concepts } = data;
  const [expanded, setExpanded] = useState<string | null>(concepts[0]?.id ?? null);
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Theoretical frameworks and phenomena central to Burisch's research.
      </p>
      {concepts.map((c: BurischConcept) => {
        const isOpen = expanded === c.id;
        return (
          <div key={c.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : c.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-semibold text-gray-900 text-sm">{c.name}</h4>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 border-t border-gray-100 space-y-3">
                <p className="text-sm text-gray-700 pt-3">{c.summary}</p>
                {c.mechanics && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Mechanics</p>
                    <ul className="space-y-1">
                      {c.mechanics.map((m, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.key_claims && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Key Claims</p>
                    <ul className="space-y-1">
                      {c.key_claims.map((kc, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{kc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.factions && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Factions</p>
                    <ul className="space-y-1">
                      {c.factions.map((f, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.framework && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Framework</p>
                    <ul className="space-y-1">
                      {c.framework.map((f, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.genetic_component && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Genetic Component</p>
                    <ul className="space-y-1">
                      {c.genetic_component.map((g, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.properties && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Properties</p>
                    <ul className="space-y-1">
                      {c.properties.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.outcome && (
                  <div className="bg-green-50 border border-green-100 rounded p-3">
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Outcome</p>
                    <p className="text-sm text-gray-700">{c.outcome}</p>
                  </div>
                )}
                {c.implication && (
                  <div className="bg-amber-50 border border-amber-100 rounded p-3">
                    <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Implication</p>
                    <p className="text-sm text-gray-700">{c.implication}</p>
                  </div>
                )}
                {c.research_context && (
                  <p className="text-xs text-gray-400 italic">{c.research_context}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Credibility balance helpers ───────────────────────────── */

interface CredibilityBalanceProps {
  supporting: number;
  contradicting: number;
}

const CredibilityBalance: FC<CredibilityBalanceProps> = ({ supporting, contradicting }) => {
  const total = supporting + contradicting;
  const supPct = total > 0 ? (supporting / total) * 100 : 50;
  const conPct = total > 0 ? (contradicting / total) * 100 : 50;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Credibility Balance</p>
        <span className="text-xs text-gray-400">{total} arguments documented</span>
      </div>

      {/* Balance bar */}
      <div className="flex h-4 rounded-full overflow-hidden gap-px">
        <div
          className="bg-green-500 flex items-center justify-center transition-all"
          style={{ width: `${supPct}%` }}
          title={`Supporting: ${supporting}`}
        >
          {supPct > 15 && <span className="text-xs text-white font-bold">{supporting}</span>}
        </div>
        <div
          className="bg-red-400 flex items-center justify-center transition-all"
          style={{ width: `${conPct}%` }}
          title={`Contradicting: ${contradicting}`}
        >
          {conPct > 15 && <span className="text-xs text-white font-bold">{contradicting}</span>}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-gray-600">Supporting</span>
          <span className="font-semibold text-gray-800">{supporting}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-800">{contradicting}</span>
          <span className="text-gray-600">Against</span>
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
        </div>
      </div>
    </div>
  );
};

interface CategoryArg { category: string; claim: string }

const CategoryBreakdown: FC<{ supporting: CategoryArg[]; against: CategoryArg[] }> = ({ supporting, against }) => {
  const allCategories = Array.from(
    new Set([...supporting.map(a => a.category), ...against.map(a => a.category)])
  ).sort();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Breakdown by Category</p>
      <div className="space-y-2">
        {allCategories.map(cat => {
          const sup = supporting.filter(a => a.category === cat).length;
          const agt = against.filter(a => a.category === cat).length;
          const total = sup + agt;
          const supPct = total > 0 ? (sup / total) * 100 : 0;
          return (
            <div key={cat} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">{cat}</span>
                <span className="text-xs text-gray-400">
                  {sup > 0 && <span className="text-green-600 font-medium">+{sup}</span>}
                  {sup > 0 && agt > 0 && <span className="text-gray-300 mx-1">·</span>}
                  {agt > 0 && <span className="text-red-500 font-medium">−{agt}</span>}
                </span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-red-200">
                <div className="bg-green-400 rounded-full" style={{ width: `${supPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AssessmentTab: FC = () => {
  const { arguments: args } = data;
  return (
    <div className="space-y-6">
      <CredibilityBalance
        supporting={args.supporting.length}
        contradicting={args.against.length}
      />

      <CategoryBreakdown supporting={args.supporting} against={args.against} />

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Methodology Note</p>
        <p className="text-sm text-amber-900">
          This section presents documented arguments for and against Burisch's credibility as compiled by researcher Brian Jackson over 13 years. DECUR does not adjudicate these claims; they are presented for methodological transparency.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-3">
          {args.supporting.map((a, i) => (
            <div key={i} className="border border-green-100 bg-green-50/50 rounded-lg p-4">
              <p className="text-xs font-medium text-green-700 mb-1">{a.category}</p>
              <p className="text-sm text-gray-700">{a.claim}</p>
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
          {args.against.map((a, i) => (
            <div key={i} className="border border-red-100 bg-red-50/50 rounded-lg p-4">
              <p className="text-xs font-medium text-red-600 mb-1">{a.category}</p>
              <p className="text-sm text-gray-700">{a.claim}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Profile Component ─────────────────────────────────── */

const InsiderProfile: FC<InsiderProfileProps> = ({ id, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':     return <OverviewTab />;
      case 'entity':       return <EntityTab />;
      case 'facility':     return <FacilityTab />;
      case 'projects':     return <ProjectsTab />;
      case 'documents':    return <DocumentsTab />;
      case 'timeline':     return <TimelineTab />;
      case 'testimonies':  return <TestimoniesTab />;
      case 'mj12':         return <MJ12Tab />;
      case 'concepts':     return <ConceptsTab />;
      case 'assessment':   return <AssessmentTab />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-primary transition-colors mb-3 flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Insiders
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading text-gray-900">{data.profile.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {data.profile.roles[0]}, {data.profile.service_period}
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0">
            Case File
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 flex-wrap mb-6 border-b border-gray-200 pb-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{renderTab()}</div>
    </div>
  );
};

export default InsiderProfile;
