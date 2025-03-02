import { useState, FC, ChangeEvent } from 'react';

interface Material {
  id: number;
  title: string;
  type: string;
  author: string;
  year: string;
  description: string;
  url: string;
}

interface Transcript {
  id: number;
  title: string;
  interviewer?: string;
  date: string;
  description: string;
  url: string;
}

type ResourcesData = {
  materials: Material[];
  transcripts: Transcript[];
}

interface ResourceListProps {
  category: 'materials' | 'transcripts';
}

const ResourceList: FC<ResourceListProps> = ({ category }) => {
  // Mock resources data
  const resourcesData: ResourcesData = {
    materials: [
      {
        id: 1,
        title: "Eagles Disobey: The Case for Inca City, Mars",
        type: "Book",
        author: "Dan Burisch",
        year: "1998",
        description: "Initial publication detailing observations and theories regarding potential artificial structures on Mars.",
        url: "#"
      },
      {
        id: 2,
        title: "Project Lotus: Final Report",
        type: "Research Paper",
        author: "Dan Burisch",
        year: "2003",
        description: "Comprehensive documentation of the Project Lotus experiments, findings, and implications for cellular transformation.",
        url: "#"
      },
      {
        id: 3,
        title: "UAP: Preliminary Assessment Report",
        type: "Government Report",
        author: "Office of the Director of National Intelligence",
        year: "2021",
        description: "Official government assessment of UAP encounters by military personnel, acknowledging the existence of objects displaying advanced technology.",
        url: "#"
      },
      {
        id: 4,
        title: "Timeline Divergence Analysis",
        type: "Research Paper",
        author: "Dan Burisch",
        year: "2005",
        description: "Detailed examination of the Timeline 1 and Timeline 2 split-point theory and supporting evidence.",
        url: "#"
      },
      {
        id: 5,
        title: "House Oversight Committee UAP Hearing",
        type: "Congressional Testimony",
        author: "Multiple Witnesses",
        year: "2023",
        description: "David Grusch and other witnesses testify before Congress regarding UAP recovery programs and whistleblower protection issues.",
        url: "#"
      }
    ],
    transcripts: [
      {
        id: 1,
        title: "Dan Burisch Interview - Project Camelot",
        interviewer: "Kerry Cassidy",
        date: "June 2006",
        description: "Extensive interview covering J-Rod interactions, Project Lotus, and timeline mechanics.",
        url: "#"
      },
      {
        id: 2,
        title: "Testimony Before Majestic-12 Committee",
        date: "March 2001",
        description: "Transcript of formal testimony regarding P-45 and P-52 origins and motivations.",
        url: "#"
      },
      {
        id: 3,
        title: "Project Lotus Briefing",
        date: "November 2002",
        description: "Internal briefing on the progress and discoveries of the Project Lotus experiments.",
        url: "#"
      },
      {
        id: 4,
        title: "David Grusch - NewsNation Interview",
        interviewer: "Ross Coulthart",
        date: "June 2023",
        description: "Interview where Grusch first publicly disclosed information about UAP retrieval programs.",
        url: "#"
      },
      {
        id: 5,
        title: "Luis Elizondo - 60 Minutes Interview",
        interviewer: "Bill Whitaker",
        date: "May 2021",
        description: "Former AATIP director discusses Pentagon UAP program and encounters by Navy pilots.",
        url: "#"
      }
    ]
  };

  // Filter resources based on category
  const resources = resourcesData[category] || [];

  // Search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredResources = resources.filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    ((resource as Material).author && (resource as Material).author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {category === 'materials' ? 'Primary Materials' : 'Transcripts'}
      </h2>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${category}...`}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter note */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Note:</span> Currently displaying materials primarily from Dan Burisch's testimony. 
          Additional whistleblower materials from David Grusch, Luis Elizondo, and others will be added as our archive expands.
        </p>
      </div>
      
      {/* Resources list */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No resources found matching your search.</p>
        ) : (
          filteredResources.map(resource => (
            <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    {(resource as Material).type && <span className="mr-3">{(resource as Material).type}</span>}
                    {(resource as Material).author && <span className="mr-3">By: {(resource as Material).author}</span>}
                    {(resource as Transcript).interviewer && <span className="mr-3">Interviewer: {(resource as Transcript).interviewer}</span>}
                    <span>{(resource as Material).year || (resource as Transcript).date}</span>
                  </div>
                </div>
                <a 
                  href={resource.url} 
                  className="mt-3 md:mt-0 text-sm font-medium text-primary hover:text-primary-dark"
                >
                  View Document →
                </a>
              </div>
              <p className="mt-2 text-gray-600">{resource.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResourceList;