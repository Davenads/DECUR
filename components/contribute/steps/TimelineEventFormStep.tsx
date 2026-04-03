import { FC, FormEvent, useState } from 'react';
import { TimelineEventPayloadSchema, type TimelineEventPayload } from '../../../lib/validation/contributions';
import { FormField, UrlListField, StepNav, inputClass, textareaClass } from '../FormField';

const CATEGORIES = [
  { value: 'government',   label: 'Government' },
  { value: 'military',     label: 'Military' },
  { value: 'civilian',     label: 'Civilian' },
  { value: 'scientific',   label: 'Scientific' },
  { value: 'legislative',  label: 'Legislative' },
  { value: 'media',        label: 'Media' },
  { value: 'ufo',          label: 'UFO / UAP' },
  { value: 'nhi',          label: 'NHI' },
  { value: 'other',        label: 'Other' },
];

interface Props {
  initial: Partial<TimelineEventPayload>;
  onBack: () => void;
  onNext: (payload: TimelineEventPayload) => void;
}

const TimelineEventFormStep: FC<Props> = ({ initial, onBack, onNext }) => {
  const [year, setYear]           = useState(initial.year ?? '');
  const [event, setEvent]         = useState(initial.event ?? '');
  const [category, setCategory]   = useState(initial.category ?? '');
  const [sources, setSources]     = useState<string[]>(initial.source_urls?.length ? initial.source_urls : ['']);
  const [notes, setNotes]         = useState(initial.submitter_note ?? '');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = TimelineEventPayloadSchema.safeParse({
      year: year.trim(),
      event: event.trim(),
      category,
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Timeline Event details</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Add a historically significant event to the DECUR timeline. Must be verifiable.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField id="year" label="Year / Date" required error={errors.year}
          hint='e.g. "1947" or "Jul 1947"'>
          <input id="year" type="text" value={year} onChange={e => setYear(e.target.value)}
            placeholder="YYYY or Mon YYYY" className={inputClass} />
        </FormField>
        <FormField id="category" label="Category" required error={errors.category}>
          <select
            id="category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="event" label="Event description" required error={errors.event}
        hint="Describe what happened factually. Include key names, locations, and outcomes (10-1,000 characters).">
        <textarea id="event" rows={5} value={event} onChange={e => setEvent(e.target.value)}
          placeholder="Factual description of the event..." className={textareaClass} />
      </FormField>

      <UrlListField
        id="sources"
        label="Source URLs"
        hint="Primary sources — government records, news archives, academic papers."
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

export default TimelineEventFormStep;
