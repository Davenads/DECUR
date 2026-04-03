import { useState, FC } from 'react';
import { useRouter } from 'next/router';
import type {
  ContributionContentType,
  FigurePayload,
  CasePayload,
  TimelineEventPayload,
  CorrectionPayload,
} from '../../lib/validation/contributions';

// ── Step sub-components ───────────────────────────────────────────────────────
import TypeSelectStep from './steps/TypeSelectStep';
import FigureFormStep from './steps/FigureFormStep';
import CaseFormStep from './steps/CaseFormStep';
import TimelineEventFormStep from './steps/TimelineEventFormStep';
import CorrectionFormStep from './steps/CorrectionFormStep';
import ReviewStep from './steps/ReviewStep';

type StepId = 'type' | 'details' | 'review';

type FormPayload = FigurePayload | CasePayload | TimelineEventPayload | CorrectionPayload;

interface WizardState {
  step: StepId;
  contentType: ContributionContentType | null;
  payload: Partial<FormPayload>;
}

interface Props {
  /**
   * Passed from the page component AFTER router.isReady is true.
   * This keeps the wizard free of any useRouter() subscription so that
   * iOS virtual keyboard events (which can trigger router re-renders) never
   * cause the wizard to remount and lose form state.
   */
  initialType?: ContributionContentType;
}

const STEP_LABELS: Record<StepId, string> = {
  type:    '1. Type',
  details: '2. Details',
  review:  '3. Review',
};

const SubmissionWizard: FC<Props> = ({ initialType }) => {
  // useRouter only for programmatic navigation (router.push), NOT for reading query.
  const router = useRouter();

  const [state, setState] = useState<WizardState>({
    step: initialType ? 'details' : 'type',
    contentType: initialType ?? null,
    payload: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function goToType() {
    setState(s => ({ ...s, step: 'type', payload: {} }));
  }

  function handleTypeSelect(type: ContributionContentType) {
    setState(s => ({ ...s, contentType: type, step: 'details' }));
  }

  function handleDetailsComplete(payload: FormPayload) {
    setState(s => ({ ...s, payload, step: 'review' }));
  }

  function handleBackToDetails() {
    setState(s => ({ ...s, step: 'details' }));
  }

  async function handleSubmit() {
    if (!state.contentType || !state.payload) return;
    setSubmitting(true);
    setSubmitError(null);

    const { contentType, payload } = state;
    const titleKey = contentType === 'figure' ? 'name' : contentType === 'case' ? 'title' : contentType === 'timeline_event' ? 'event' : 'target_name';
    const title = (payload as Record<string, string>)[titleKey]?.slice(0, 200) ?? 'Untitled';

    const res = await fetch('/api/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_type: contentType, title, payload }),
    });

    const json = await res.json() as { error?: string };

    if (!res.ok) {
      setSubmitError(json.error ?? 'Submission failed. Please try again.');
      setSubmitting(false);
      return;
    }

    router.push('/contribute/submitted');
  }

  const steps = Object.keys(STEP_LABELS) as StepId[];
  const currentIndex = steps.indexOf(state.step);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              i < currentIndex ? 'text-primary dark:text-primary-light' :
              i === currentIndex ? 'text-gray-900 dark:text-gray-100' :
              'text-gray-400 dark:text-gray-500'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < currentIndex ? 'bg-primary text-white' :
                i === currentIndex ? 'bg-primary text-white' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {i < currentIndex ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block">{STEP_LABELS[step].replace(/^\d+\. /, '')}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${i < currentIndex ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
        {state.step === 'type' && (
          <TypeSelectStep onSelect={handleTypeSelect} />
        )}

        {state.step === 'details' && state.contentType === 'figure' && (
          <FigureFormStep
            initial={state.payload as Partial<FigurePayload>}
            onBack={goToType}
            onNext={p => handleDetailsComplete(p as FormPayload)}
          />
        )}

        {state.step === 'details' && state.contentType === 'case' && (
          <CaseFormStep
            initial={state.payload as Partial<CasePayload>}
            onBack={goToType}
            onNext={p => handleDetailsComplete(p as FormPayload)}
          />
        )}

        {state.step === 'details' && state.contentType === 'timeline_event' && (
          <TimelineEventFormStep
            initial={state.payload as Partial<TimelineEventPayload>}
            onBack={goToType}
            onNext={p => handleDetailsComplete(p as FormPayload)}
          />
        )}

        {state.step === 'details' && state.contentType === 'correction' && (
          <CorrectionFormStep
            initial={state.payload as Partial<CorrectionPayload>}
            onBack={goToType}
            onNext={p => handleDetailsComplete(p as FormPayload)}
          />
        )}

        {state.step === 'review' && state.contentType && (
          <ReviewStep
            contentType={state.contentType}
            payload={state.payload as FormPayload}
            onBack={handleBackToDetails}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  );
};

export default SubmissionWizard;
