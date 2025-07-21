
import React, { useState } from 'react';
import { SavedScenario } from '../../types';
import { Button } from '../ui/Button';
import { TrashIcon, PencilIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils';

interface ManageScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: SavedScenario[];
  onLoadScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
  onRenameScenario: (id: string, newName: string) => void;
}

export const ManageScenariosModal: React.FC<ManageScenariosModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onLoadScenario,
  onDeleteScenario,
  onRenameScenario,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  const handleStartRename = (scenario: SavedScenario) => {
    setRenamingId(scenario.id);
    setNewName(scenario.name);
  };

  const handleConfirmRename = () => {
    if (renamingId && newName.trim()) {
      onRenameScenario(renamingId, newName.trim());
      setRenamingId(null);
      setNewName('');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the scenario "${name}"? This action cannot be undone.`)) {
      onDeleteScenario(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-800">Manage Saved Scenarios</h2>
          <Button onClick={onClose} variant="secondary" size="sm" icon={<XMarkIcon className="h-5 w-5" />} className="!p-1.5">
             <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {scenarios.length === 0 ? (
          <p className="text-gray-600 text-center py-8">You have no saved scenarios yet.</p>
        ) : (
          <div className="overflow-y-auto custom-scrollbar flex-grow">
            <ul className="space-y-3">
              {scenarios.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(scenario => (
                <li key={scenario.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:shadow-md transition-shadow">
                  {renamingId === scenario.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-grow px-2 py-1.5 border border-blue-400 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
                      />
                      <Button onClick={handleConfirmRename} size="sm" variant="primary">Save</Button>
                      <Button onClick={() => setRenamingId(null)} size="sm" variant="outline">Cancel</Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-blue-700">{scenario.name}</p>
                          <p className="text-xs text-gray-500">
                            Last Saved: {formatDate(scenario.updatedAt)} (Created: {formatDate(scenario.createdAt)})
                          </p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                          <Button onClick={() => onLoadScenario(scenario.id)} variant="outline" size="sm" icon={<ArrowDownTrayIcon className="h-4 w-4"/>} title="Load Scenario">Load</Button>
                          <Button onClick={() => handleStartRename(scenario)} variant="outline" size="sm" icon={<PencilIcon className="h-4 w-4"/>} title="Rename Scenario"/>
                          <Button onClick={() => handleDelete(scenario.id, scenario.name)} variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4"/>} title="Delete Scenario"/>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
         <div className="mt-6 pt-4 border-t border-gray-200 text-right">
            <Button onClick={onClose} variant="primary">Close</Button>
        </div>
      </div>
    </div>
  );
};
