import { FC } from 'react';
import type { ContributionContentType, FigurePayload, CasePayload, TimelineEventPayload, CorrectionPayload } from '../../../lib/validation/contributions';

type AnyPayload = FigurePayload | CasePayload | TimelineEventPayload | CorrectionPayload;

interface Props {
  contentType: ContributionContentType;
  payload: AnyPayload;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}

const TYPE_LABELS: Record<ContributionContentType, string> = {
  figure:         'Key Figure',
  case:           'Documented Case',
  timeline_event: 'Timeline Event',
  correction:     'Correction / Source',
};

const ReviewStep: FC<Props> = ({ contentType, payload, onBack, onSubmit, submitting, submitError }) => {
  // Build a flat list of review rows from payload
  const rows = buildRows(contentType, payload);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Review your submission</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Review the details below before submitting. You can go back to make changes.
      </p>

      {/* Type badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {TYPE_LABELS[contentType]}
        </span>
      </div>

      {/* Field summary */}
      <dl className="space-y-3 mb-6">
        {rows.map(({ label, value, multi }) => (
          <div key={label} className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0">
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
            {multi ? (
              <ul className="space-y-1">
                {(value as string[]).map((v, i) => (
                  <li key={i} className="text-sm text-gray-800 dark:text-gray-200 break-all">{v}</li>
                ))}
              </ul>
            ) : (
              <dd className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{value as string}</dd>
            )}
          </div>
        ))}
      </dl>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
        By submitting, you confirm that this information is accurate to the best of your knowledge and is supported by the provided sources. Submissions are reviewed before being published.
      </p>

      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : 'Submit contribution'}
        </button>
      </div>
    </div>
  );
};

// Build labeled rows for review display
function buildRows(type: ContributionContentType, payload: AnyPayload): Array<{ label: string; value: string | string[]; multi?: boolean }> {
  switch (type) {
    case 'figure': {
      const p = payload as FigurePayload;
      return [
        { label: 'Name', value: p.name },
        { label: 'Roles', value: p.roles, multi: true },
        { label: 'Summary', value: p.summary },
        ...(p.organizations?.length ? [{ label: 'Organizations', value: p.organizations, multi: true }] : []),
        { label: 'Sources', value: p.source_urls, multi: true },
        ...(p.submitter_note ? [{ label: 'Submitter note', value: p.submitter_note }] : []),
      ];
    }
    case 'case': {
      const p = payload as CasePayload;
      return [
        { label: 'Title', value: p.title },
        { label: 'Date', value: p.date },
        { label: 'Location', value: p.location },
        { label: 'Summary', value: p.summary },
        ...(p.witnesses?.length ? [{ label: 'Witnesses', value: p.witnesses, multi: true }] : []),
        { label: 'Sources', value: p.source_urls, multi: true },
        ...(p.submitter_note ? [{ label: 'Submitter note', value: p.submitter_note }] : []),
      ];
    }
    case 'timeline_event': {
      const p = payload as TimelineEventPayload;
      return [
        { label: 'Year / Date', value: p.year },
        { label: 'Category', value: p.category },
        { label: 'Event description', value: p.event },
        { label: 'Sources', value: p.source_urls, multi: true },
        ...(p.submitter_note ? [{ label: 'Submitter note', value: p.submitter_note }] : []),
      ];
    }
    case 'correction': {
      const p = payload as CorrectionPayload;
      return [
        { label: 'Target type', value: p.target_type },
        { label: 'Content name', value: p.target_name },
        { label: 'Content ID', value: p.target_id },
        { label: 'What to correct', value: p.field_description },
        ...(p.current_value ? [{ label: 'Current value', value: p.current_value }] : []),
        { label: 'Suggested correction', value: p.suggested_value },
        { label: 'Sources', value: p.source_urls, multi: true },
        ...(p.submitter_note ? [{ label: 'Submitter note', value: p.submitter_note }] : []),
      ];
    }
  }
}

export default ReviewStep;
