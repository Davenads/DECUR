import { FC, FormEvent, useState } from 'react';
import { CorrectionPayloadSchema, type CorrectionPayload } from '../../../lib/validation/contributions';
import { FormField, UrlListField, StepNav, inputClass, textareaClass } from '../FormField';

const TARGET_TYPES = [
  { value: 'figure',   label: 'Key Figure' },
  { value: 'case',     label: 'Documented Case' },
  { value: 'document', label: 'Document' },
  { value: 'program',  label: 'Program' },
  { value: 'timeline', label: 'Timeline Event' },
];

interface Props {
  initial: Partial<CorrectionPayload>;
  onBack: () => void;
  onNext: (payload: CorrectionPayload) => void;
}

const CorrectionFormStep: FC<Props> = ({ initial, onBack, onNext }) => {
  const [targetType, setTargetType]   = useState(initial.target_type ?? '');
  const [targetId, setTargetId]       = useState(initial.target_id ?? '');
  const [targetName, setTargetName]   = useState(initial.target_name ?? '');
  const [fieldDesc, setFieldDesc]     = useState(initial.field_description ?? '');
  const [current, setCurrent]         = useState(initial.current_value ?? '');
  const [suggested, setSuggested]     = useState(initial.suggested_value ?? '');
  const [sources, setSources]         = useState<string[]>(initial.source_urls?.length ? initial.source_urls : ['']);
  const [notes, setNotes]             = useState(initial.submitter_note ?? '');
  const [errors, setErrors]           = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = CorrectionPayloadSchema.safeParse({
      target_type: targetType,
      target_id: targetId.trim(),
      target_name: targetName.trim(),
      field_description: fieldDesc.trim(),
      current_value: current.trim() || undefined,
      suggested_value: suggested.trim(),
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Correction / Source details</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Identify the content to correct and provide a sourced replacement value.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField id="targetType" label="Content type" required error={errors.target_type}>
          <select id="targetType" value={targetType} onChange={e => setTargetType(e.target.value)} className={inputClass}>
            <option value="">Select type...</option>
            {TARGET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </FormField>
        <FormField id="targetName" label="Content name" required error={errors.target_name}
          hint='e.g. "Luis Elizondo"'>
          <input id="targetName" type="text" value={targetName} onChange={e => setTargetName(e.target.value)}
            placeholder="Display name of the item" className={inputClass} />
        </FormField>
      </div>

      <FormField id="targetId" label="Content ID / slug" required error={errors.target_id}
        hint='The URL slug, e.g. "luis-elizondo" from /figures/luis-elizondo'>
        <input id="targetId" type="text" value={targetId} onChange={e => setTargetId(e.target.value)}
          placeholder="url-slug-from-page" className={inputClass} />
      </FormField>

      <FormField id="fieldDesc" label="What needs to be corrected?" required error={errors.field_description}
        hint='Be specific: e.g. "Birth year is listed as 1969 but should be 1971"'>
        <input id="fieldDesc" type="text" value={fieldDesc} onChange={e => setFieldDesc(e.target.value)}
          placeholder="Describe the error or missing information" className={inputClass} />
      </FormField>

      <FormField id="current" label="Current (incorrect) value (optional)" error={errors.current_value}
        hint="Quote the existing text that is wrong, if applicable.">
        <textarea id="current" rows={2} value={current} onChange={e => setCurrent(e.target.value)}
          placeholder="The text currently shown on the site..." className={textareaClass} />
      </FormField>

      <FormField id="suggested" label="Suggested correction" required error={errors.suggested_value}>
        <textarea id="suggested" rows={3} value={suggested} onChange={e => setSuggested(e.target.value)}
          placeholder="The correct value that should replace it..." className={textareaClass} />
      </FormField>

      <UrlListField
        id="sources"
        label="Source URLs"
        hint="Link to the source that verifies your correction."
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

export default CorrectionFormStep;
