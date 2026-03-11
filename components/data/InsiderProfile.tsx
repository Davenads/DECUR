import { FC, useState } from 'react';
import { BurischData } from '../../types/data';
import burischData from '../../data/insiders/burisch.json';
import ProfileShell from './shared/ProfileShell';
import OverviewTab from './insiders/burisch/OverviewTab';
import EntityTab from './insiders/burisch/EntityTab';
import FacilityTab from './insiders/burisch/FacilityTab';
import ProjectsTab from './insiders/burisch/ProjectsTab';
import DocumentsTab from './insiders/burisch/DocumentsTab';
import TimelineTab from './insiders/burisch/TimelineTab';
import TestimoniesTab from './insiders/burisch/TestimoniesTab';
import MJ12Tab from './insiders/burisch/MJ12Tab';
import ConceptsTab from './insiders/burisch/ConceptsTab';
import AssessmentTab from './insiders/burisch/AssessmentTab';

const data = burischData as BurischData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'entity',     label: "Chi'el'ah" },
  { id: 'facility',   label: 'S-4 Facility' },
  { id: 'projects',   label: 'Projects' },
  { id: 'documents',  label: 'Documents' },
  { id: 'timeline',   label: 'Timeline' },
  { id: 'testimonies',label: 'Testimonies' },
  { id: 'mj12',       label: 'MJ-12' },
  { id: 'concepts',   label: 'Concepts' },
  { id: 'assessment', label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

interface InsiderProfileProps {
  id: string;
  onBack: () => void;
}

const InsiderProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':     return <OverviewTab />;
      case 'entity':       return <EntityTab />;
      case 'facility':     return <FacilityTab />;
      case 'projects':     return <ProjectsTab />;
      case 'documents':    return <DocumentsTab />;
      case 'timeline':     return <TimelineTab />;
      case 'testimonies':  return <TestimoniesTab />;
      case 'mj12':         return <MJ12Tab />;
      case 'concepts':     return <ConceptsTab />;
      case 'assessment':   return <AssessmentTab />;
    }
  };

  return (
    <ProfileShell
      name={data.profile.name}
      role={data.profile.roles[0]}
      period={data.profile.service_period}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as TabId)}
      onBack={onBack}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default InsiderProfile;
