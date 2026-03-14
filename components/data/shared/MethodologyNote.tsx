import { FC, ReactNode } from 'react';

interface MethodologyNoteProps {
  /** Box heading — defaults to "Methodology Note" */
  title?: string;
  children: ReactNode;
}

/**
 * Amber callout box used for methodology disclosures, contested claims,
 * and similar cautionary notes across profile Assessment tabs.
 */
const MethodologyNote: FC<MethodologyNoteProps> = ({ title = 'Methodology Note', children }) => (
  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4">
    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
      {title}
    </p>
    <p className="text-sm text-amber-900 dark:text-amber-300">{children}</p>
  </div>
);

export default MethodologyNote;
