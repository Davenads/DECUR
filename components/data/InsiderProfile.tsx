import { FC, useState } from 'react';
import { BurischData } from '../../types/data';
import burischData from '../../data/key-figures/burisch.json';
import ProfileShell from './shared/ProfileShell';
import OverviewTab from './key-figures/burisch/OverviewTab';
import EntityTab from './key-figures/burisch/EntityTab';
import FacilityTab from './key-figures/burisch/FacilityTab';
import ProjectsTab from './key-figures/burisch/ProjectsTab';
import DocumentsTab from './key-figures/burisch/DocumentsTab';
import TimelineTab from './key-figures/burisch/TimelineTab';
import TestimoniesTab from './key-figures/burisch/TestimoniesTab';
import MJ12Tab from './key-figures/burisch/MJ12Tab';
import ConceptsTab from './key-figures/burisch/ConceptsTab';
import AssessmentTab from './key-figures/burisch/AssessmentTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';

const data = burischData as BurischData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'entity',     label: "Chi'el'ah" },
  { id: 'facility',   label: 'S-4 Facility' },
  { id: 'projects',   label: 'Projects' },
  { id: 'documents',  label: 'Documents' },
  { id: 'timeline',   label: 'Timeline' },
  { id: 'testimonies',label: 'Testimonies' },
  { id: 'mj12',        label: 'MJ-12' },
  { id: 'concepts',    label: 'Concepts' },
  { id: 'people',      label: 'People' },
  { id: 'disclosures', label: 'Disclosures' },
  { id: 'assessment',  label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

interface InsiderProfileProps {
  onBack: () => void;
  backLabel?: string;
  networkNodeId?: string;
}

const InsiderProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
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
      case 'people':       return <SharedNetworkTab people={data.associated_people} />;
      case 'disclosures':  return <SharedDisclosuresTab disclosures={data.disclosures} />;
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
      backLabel={backLabel}
      networkNodeId={networkNodeId}
      contentId={data.profile.id}
      contentName={data.profile.name}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default InsiderProfile;
