import { useState, FC } from 'react';
import { CategoryType, ExpandedSections } from '../../types/data';
import { DataNavigationProps } from '../../types/components';

const DataNavigation: FC<DataNavigationProps> = ({ activeCategory, setActiveCategory }) => {
  // Expanded state for nested navigation items
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    entities: true,
    technologies: false,
    programs: false,
    whistleblowers: false
  });

  // Toggle expanded state for a section
  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Handle category selection
  const handleCategoryClick = (category: CategoryType) => {
    setActiveCategory(category);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Data Categories</h2>
      
      <nav className="space-y-4">
        {/* Whistleblowers Section */}
        <div>
          <button 
            className="flex items-center justify-between w-full text-left font-medium text-gray-800 hover:text-primary"
            onClick={() => toggleSection('whistleblowers')}
          >
            <span className={activeCategory === 'whistleblowers' ? 'text-primary font-semibold' : ''}>
              Whistleblowers
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${expandedSections.whistleblowers ? 'transform rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.whistleblowers && (
            <ul className="ml-4 mt-2 space-y-1 text-sm">
              <li 
                onClick={() => handleCategoryClick('entities')}
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
              >
                Dr. Dan Burisch
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
              >
                David Grusch (Coming Soon)
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
              >
                Luis Elizondo (Coming Soon)
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
              >
                Bob Lazar (Coming Soon)
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
              >
                Military Personnel (Coming Soon)
              </li>
            </ul>
          )}
        </div>

        {/* Non-Human Intelligence */}
        <div>
          <button 
            className="flex items-center justify-between w-full text-left font-medium text-gray-800 hover:text-primary"
            onClick={() => toggleSection('entities')}
          >
            <span className={activeCategory === 'entities' ? 'text-primary font-semibold' : ''}>
              Non-Human Intelligence
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${expandedSections.entities ? 'transform rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.entities && (
            <ul className="ml-4 mt-2 space-y-1 text-sm">
              <li 
                onClick={() => handleCategoryClick('entities')}
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
              >
                P-45 J-Rods
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('entities')}
              >
                P-52 J-Rods
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('entities')}
              >
                P-52 Orions/Nordics
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('entities')}
              >
                Other Reported Types
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('entities')}
              >
                Human Interactions
              </li>
            </ul>
          )}
        </div>
        
        {/* Advanced Technologies */}
        <div>
          <button 
            className="flex items-center justify-between w-full text-left font-medium text-gray-800 hover:text-primary"
            onClick={() => toggleSection('technologies')}
          >
            <span className={activeCategory === 'timelines' ? 'text-primary font-semibold' : ''}>
              Advanced Technologies
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${expandedSections.technologies ? 'transform rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.technologies && (
            <ul className="ml-4 mt-2 space-y-1 text-sm">
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('timelines')}
              >
                Looking Glass Technology
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('timelines')}
              >
                Timeline Mechanics
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('timelines')}
              >
                Stargate Technology
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('timelines')}
              >
                Propulsion Systems
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
              >
                Recovered Materials (Coming Soon)
              </li>
            </ul>
          )}
        </div>
        
        {/* Special Access Programs */}
        <div>
          <button 
            className="flex items-center justify-between w-full text-left font-medium text-gray-800 hover:text-primary"
            onClick={() => toggleSection('programs')}
          >
            <span className={activeCategory === 'lotus' ? 'text-primary font-semibold' : ''}>
              Special Access Programs
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${expandedSections.programs ? 'transform rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.programs && (
            <ul className="ml-4 mt-2 space-y-1 text-sm">
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('lotus')}
              >
                Project Lotus
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick('lotus')}
              >
                Majestic-12
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
              >
                AATIP (Coming Soon)
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
              >
                Project Galileo (Coming Soon)
              </li>
              <li 
                className="py-1 px-2 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
              >
                Other Reported Programs (Coming Soon)
              </li>
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
};

export default DataNavigation;