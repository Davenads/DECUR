import { FC } from 'react';
import Link from 'next/link';
import insidersIndex from '../../../data/key-figures/index.json';

interface Person {
  id: string;
  name: string;
  role: string;
  relationship: string;
}

interface PersonCardProps {
  person: Person;
}

// Derived once at module load - IDs that have a /figures/[id] profile page
const PROFILE_IDS = new Set(
  (insidersIndex as Array<{ id: string; status: string }>)
    .filter(e => e.status === 'detailed')
    .map(e => e.id)
);

const PersonCard: FC<PersonCardProps> = ({ person }) => {
  const hasProfile = PROFILE_IDS.has(person.id);

  const content = (
    <>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{person.name}</h4>
        {hasProfile && (
          <span className="text-xs text-primary shrink-0 flex items-center gap-0.5">
            View Profile
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
      <p className="text-xs text-primary font-medium mb-2">{person.role}</p>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{person.relationship}</p>
    </>
  );

  if (hasProfile) {
    return (
      <Link
        href={`/figures/${person.id}`}
        className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      {content}
    </div>
  );
};

export default PersonCard;
