import { FC, ReactNode } from 'react';
import ProfileTabBar from './ProfileTabBar';

interface ProfileShellProps {
  name: string;
  role: string;
  period: string;
  badge?: string;
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
  tabs,
  activeTab,
  onTabChange,
  onBack,
  children,
}) => {
  return (
    <div>
      <div className="mb-5">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-primary transition-colors mb-3 flex items-center gap-1"
        >
          <BackIcon />
          Insiders
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{role}, {period}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0">
            {badge}
          </span>
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
