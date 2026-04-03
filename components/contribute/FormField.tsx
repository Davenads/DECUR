import { FC, ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormField: FC<FormFieldProps> = ({ id, label, hint, error, required, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

export const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';

export const textareaClass =
  'w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y transition-colors';

// Repeating URL list field (add/remove rows)
interface UrlListFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  values: string[];
  onChange: (values: string[]) => void;
}

export const UrlListField: FC<UrlListFieldProps> = ({ id, label, hint, error, values, onChange }) => {
  function update(i: number, val: string) {
    const next = [...values];
    next[i] = val;
    onChange(next);
  }
  function add() { onChange([...values, '']); }
  function remove(i: number) { onChange(values.filter((_, idx) => idx !== i)); }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}<span className="text-red-500 ml-0.5">*</span>
      </label>
      <div className="space-y-2">
        {values.map((url, i) => (
          <div key={i} className="flex gap-2">
            <input
              id={i === 0 ? id : undefined}
              type="url"
              value={url}
              onChange={e => update(i, e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 px-2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove URL"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-xs text-primary hover:underline dark:text-primary-light flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add another source
      </button>
      {hint && !error && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

// Repeating text list (roles, witnesses, organizations)
interface TextListFieldProps {
  id: string;
  label: string;
  placeholder: string;
  hint?: string;
  error?: string;
  values: string[];
  onChange: (values: string[]) => void;
  addLabel?: string;
}

export const TextListField: FC<TextListFieldProps> = ({ id, label, placeholder, hint, error, values, onChange, addLabel = 'Add another' }) => {
  function update(i: number, val: string) {
    const next = [...values];
    next[i] = val;
    onChange(next);
  }
  function add() { onChange([...values, '']); }
  function remove(i: number) { onChange(values.filter((_, idx) => idx !== i)); }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}<span className="text-red-500 ml-0.5">*</span>
      </label>
      <div className="space-y-2">
        {values.map((val, i) => (
          <div key={i} className="flex gap-2">
            <input
              id={i === 0 ? id : undefined}
              type="text"
              value={val}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 px-2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-xs text-primary hover:underline dark:text-primary-light flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {addLabel}
      </button>
      {hint && !error && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

// Nav buttons for wizard steps
interface StepNavProps {
  onBack?: () => void;
  backLabel?: string;
  nextLabel?: string;
  disabled?: boolean;
}

export const StepNav: FC<StepNavProps> = ({
  onBack,
  backLabel = 'Back',
  nextLabel = 'Continue',
  disabled,
}) => (
  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {backLabel}
      </button>
    ) : <span />}
    <button
      type="submit"
      disabled={disabled}
      className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {nextLabel}
    </button>
  </div>
);
