import { FC } from 'react';
import dynamic from 'next/dynamic';
import type { CareerConnection } from '../FigureCareerFlow';

const FigureCareerFlow = dynamic(() => import('../FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] rounded-lg bg-gray-900 animate-pulse" />,
});

interface KeyEvent {
  year?: string;
  date?: string;
  event: string;
}

interface SharedCareerNetworkTabProps {
  profile: { key_events?: KeyEvent[] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  career_connections?: CareerConnection[] | any[];
}

const SharedCareerNetworkTab: FC<SharedCareerNetworkTabProps> = ({ profile, career_connections = [] }) => {
  const keyEvents = (profile.key_events ?? []).map(e => ({
    year: String(e.date ?? e.year ?? ''),
    event: e.event,
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Career timeline with key connections. Dashed edges show cross-figure and program relationships. Scroll or pinch to zoom.
      </p>
      <FigureCareerFlow keyEvents={keyEvents} careerConnections={career_connections} />
    </div>
  );
};

export default SharedCareerNetworkTab;
