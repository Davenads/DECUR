import { FC, ReactNode } from 'react';
import Link from 'next/link';
import ProfileTabBar from './ProfileTabBar';
import BookmarkButton from '../../bookmarks/BookmarkButton';

const CompareIcon: FC = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

interface ProfileShellProps {
  name: string;
  role: string;
  period: string;
  badge?: string;
  backLabel?: string;
  networkNodeId?: string;
  /** ID and name used to render the BookmarkButton. Pass both to enable bookmarking. */
  contentId?: string;
  contentName?: string;
  tabs: ReadonlyArray<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  onBack: () => void;
  children: ReactNode;
}

const BackIcon: FC = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ProfileShell: FC<ProfileShellProps> = ({
  name,
  role,
  period,
  badge = 'Case File',
  backLabel = 'Key Figures',
  networkNodeId,
  contentId,
  contentName,
  tabs,
  activeTab,
  onTabChange,
  onBack,
  children,
}) => {
  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
          >
            <BackIcon />
            {backLabel}
          </button>
          {networkNodeId && (
            <Link
              href={`/explore?node=${networkNodeId}#relationship-network`}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
            >
              View in Network →
            </Link>
          )}
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100">{name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{role}, {period}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {contentId && (
              <Link
                href={`/compare?a=${contentId}`}
                title="Compare with another figure"
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary dark:hover:text-primary-light hover:border-primary transition-colors"
              >
                <CompareIcon />
              </Link>
            )}
            {contentId && contentName && (
              <BookmarkButton contentType="figure" contentId={contentId} contentName={contentName} />
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {badge}
            </span>
          </div>
        </div>
      </div>

      <ProfileTabBar
        tabs={tabs as Array<{ id: string; label: string }>}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <div>{children}</div>
    </div>
  );
};

export default ProfileShell;
