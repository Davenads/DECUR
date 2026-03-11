import { FC } from 'react';
import { BurischData, BurischDocument } from '../../../../types/data';
import burischData from '../../../../data/insiders/burisch.json';

const data = burischData as BurischData;

const DocumentsTab: FC = () => {
  const { documents } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Primary documents associated with Burisch's research and service record.</p>
      {documents.map((doc: BurischDocument) => (
        <div key={doc.id} className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-0.5">{doc.common_name}</h4>
              <p className="text-xs font-mono text-gray-400 mb-2">{doc.designation}</p>
              {doc.date && <p className="text-xs text-gray-400 mb-2">{doc.date}</p>}
              {doc.authors && (
                <p className="text-xs text-gray-500 mb-2"><span className="font-medium">Authors:</span> {doc.authors.join(', ')}</p>
              )}
              <p className="text-sm text-gray-700">{doc.significance}</p>
              {doc.leak_history && (
                <p className="text-xs text-gray-500 mt-2 italic">{doc.leak_history}</p>
              )}
            </div>
            {doc.source_url && (
              <a
                href={doc.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline whitespace-nowrap shrink-0"
              >
                Source ↗
              </a>
            )}
          </div>
          {doc.status && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Status: </span>
              <span className="text-xs text-gray-600">{doc.status}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentsTab;
