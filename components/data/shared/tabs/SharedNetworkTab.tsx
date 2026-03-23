import { FC } from 'react';
import PersonCard from '../PersonCard';

interface Person {
  id: string;
  name: string;
  role: string;
  relationship: string;
}

interface SharedNetworkTabProps {
  people: Person[];
  introText?: string;
}

const SharedNetworkTab: FC<SharedNetworkTabProps> = ({ people, introText }) => (
  <div className="space-y-4">
    {introText && <p className="text-sm text-gray-500">{introText}</p>}
    {people.map(person => (
      <PersonCard key={person.id} person={person} />
    ))}
  </div>
);

export default SharedNetworkTab;
