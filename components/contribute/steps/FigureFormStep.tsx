import { FC, FormEvent, useState } from 'react';
import { FigurePayloadSchema, type FigurePayload } from '../../../lib/validation/contributions';
import { FormField, UrlListField, TextListField, StepNav, inputClass, textareaClass } from '../FormField';

interface Props {
  initial: Partial<FigurePayload>;
  onBack: () => void;
  onNext: (payload: FigurePayload) => void;
}

const FigureFormStep: FC<Props> = ({ initial, onBack, onNext }) => {
  const [name, setName]             = useState(initial.name ?? '');
  const [roles, setRoles]           = useState<string[]>(initial.roles?.length ? initial.roles : ['']);
  const [summary, setSummary]       = useState(initial.summary ?? '');
  const [orgs, setOrgs]             = useState<string[]>(initial.organizations ?? []);
  const [sources, setSources]       = useState<string[]>(initial.source_urls?.length ? initial.source_urls : ['']);
  const [notes, setNotes]           = useState(initial.submitter_note ?? '');
  const [errors, setErrors]         = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = FigurePayloadSchema.safeParse({
      name: name.trim(),
      roles: roles.filter(Boolean),
      summary: summary.trim(),
      organizations: orgs.filter(Boolean),
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Key Figure details</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Provide accurate, sourced information. Do not include unsupported speculation.</p>
      </div>

      <FormField id="name" label="Full name" required error={errors.name}>
        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Dr. Jane Smith" className={inputClass} />
      </FormField>

      <TextListField
        id="roles"
        label="Role(s)"
        placeholder="e.g. Senior Intelligence Officer, DIA"
        hint="List official titles, positions, or descriptions — one per row."
        error={errors.roles}
        values={roles}
        onChange={setRoles}
        addLabel="Add another role"
      />

      <FormField id="summary" label="Summary" required error={errors.summary}
        hint="2-3 sentences explaining who this person is and why they are relevant (50-1,000 characters).">
        <textarea id="summary" rows={4} value={summary} onChange={e => setSummary(e.target.value)}
          placeholder="Concise biographical summary..." className={textareaClass} />
      </FormField>

      <FormField id="orgs" label="Organizations (optional)" error={errors.organizations}>
        <TextListField
          id="orgs"
          label=""
          placeholder="e.g. Defense Intelligence Agency"
          values={orgs.length ? orgs : ['']}
          onChange={v => setOrgs(v.filter(Boolean))}
          addLabel="Add organization"
        />
      </FormField>

      <UrlListField
        id="sources"
        label="Source URLs"
        hint="Link to primary sources — Wikipedia, official bios, news articles, congressional records, etc."
        error={errors.source_urls}
        values={sources}
        onChange={setSources}
      />

      <FormField id="notes" label="Submitter note (optional)" error={errors.submitter_note}
        hint="Anything the review team should know about this submission.">
        <textarea id="notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Optional context for reviewers..." className={textareaClass} />
      </FormField>

      <StepNav onBack={onBack} nextLabel="Review submission" />
    </form>
  );
};

export default FigureFormStep;
