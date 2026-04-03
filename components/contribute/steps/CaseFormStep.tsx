import { FC, FormEvent, useState } from 'react';
import { CasePayloadSchema, type CasePayload } from '../../../lib/validation/contributions';
import { FormField, UrlListField, TextListField, StepNav, inputClass, textareaClass } from '../FormField';

interface Props {
  initial: Partial<CasePayload>;
  onBack: () => void;
  onNext: (payload: CasePayload) => void;
}

const CaseFormStep: FC<Props> = ({ initial, onBack, onNext }) => {
  const [title, setTitle]         = useState(initial.title ?? '');
  const [date, setDate]           = useState(initial.date ?? '');
  const [location, setLocation]   = useState(initial.location ?? '');
  const [summary, setSummary]     = useState(initial.summary ?? '');
  const [witnesses, setWitnesses] = useState<string[]>(initial.witnesses ?? []);
  const [sources, setSources]     = useState<string[]>(initial.source_urls?.length ? initial.source_urls : ['']);
  const [notes, setNotes]         = useState(initial.submitter_note ?? '');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = CasePayloadSchema.safeParse({
      title: title.trim(),
      date: date.trim(),
      location: location.trim(),
      summary: summary.trim(),
      witnesses: witnesses.filter(Boolean),
      source_urls: sources.filter(Boolean),
      submitter_note: notes.trim() || undefined,
    });

    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const mapped: Record<string, string> = {};
      Object.entries(flat).forEach(([k, v]) => { if (v?.[0]) mapped[k] = v[0]; });
      setErrors(mapped);
      return;
    }
    setErrors({});
    onNext(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Documented Case details</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Submit credible, documented UAP encounters. Sources are required.</p>
      </div>

      <FormField id="title" label="Case title" required error={errors.title}
        hint='e.g. "Nimitz Tic-Tac Encounter (2004)" or "Rendlesham Forest Incident (1980)"'>
        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Descriptive case title with year" className={inputClass} />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField id="date" label="Date" required error={errors.date} hint='e.g. "November 2004" or "Dec 26, 1980"'>
          <input id="date" type="text" value={date} onChange={e => setDate(e.target.value)}
            placeholder="Month Year or exact date" className={inputClass} />
        </FormField>
        <FormField id="location" label="Location" required error={errors.location}>
          <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Pacific Ocean near San Diego" className={inputClass} />
        </FormField>
      </div>

      <FormField id="summary" label="Summary" required error={errors.summary}
        hint="Describe the incident: what happened, who witnessed it, and why it is significant (50-1,500 characters).">
        <textarea id="summary" rows={5} value={summary} onChange={e => setSummary(e.target.value)}
          placeholder="Factual description of the encounter..." className={textareaClass} />
      </FormField>

      <FormField id="witnesses" label="Key witnesses (optional)" error={errors.witnesses}>
        <TextListField
          id="witnesses"
          label=""
          placeholder="e.g. Cmdr. David Fravor, USN"
          values={witnesses.length ? witnesses : ['']}
          onChange={v => setWitnesses(v.filter(Boolean))}
          addLabel="Add witness"
        />
      </FormField>

      <UrlListField
        id="sources"
        label="Source URLs"
        hint="Official reports, news coverage, Congressional records, or primary witness accounts."
        error={errors.source_urls}
        values={sources}
        onChange={setSources}
      />

      <FormField id="notes" label="Submitter note (optional)">
        <textarea id="notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Optional context for reviewers..." className={textareaClass} />
      </FormField>

      <StepNav onBack={onBack} nextLabel="Review submission" />
    </form>
  );
};

export default CaseFormStep;
