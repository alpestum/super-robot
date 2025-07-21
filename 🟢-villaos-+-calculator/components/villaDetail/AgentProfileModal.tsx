
import React, { useState } from 'react';
import { Agent } from '../../types';
import { XMarkIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, ClipboardDocumentIcon, CheckIcon } from '../Icons';
import Spinner from '../Spinner';

interface AgentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  isLoading: boolean;
  error: string | null;
}

const ContactInfoRow: React.FC<{ href: string; icon: React.ReactNode; label: string; value: string; onCopy: () => void; isCopied: boolean }> = 
({ href, icon, label, value, onCopy, isCopied }) => (
    <div className="flex items-center justify-between text-sm py-2">
        <div className="flex items-center gap-3 min-w-0">
            <div className="text-ios-gray-500 dark:text-dark-ios-gray-500 flex-shrink-0">{icon}</div>
            <div className="flex flex-col min-w-0">
                <span className="text-xs text-ios-gray-600 dark:text-dark-ios-gray-600">{label}</span>
                <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-black dark:text-dark-ios-gray-800 hover:text-apple-blue dark:hover:text-apple-blue-light break-words">
                    {value}
                </a>
            </div>
        </div>
        <button
            onClick={onCopy}
            className="p-1.5 ml-2 text-ios-gray-500 dark:text-dark-ios-gray-500 hover:bg-ios-gray-200 dark:hover:bg-dark-ios-gray-300 rounded-full transition-colors duration-150 flex-shrink-0"
            aria-label={`Copy ${label}`}
        >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
        </button>
    </div>
);


const AgentProfileModal: React.FC<AgentProfileModalProps> = ({ isOpen, onClose, agent, isLoading, error }) => {
  if (!isOpen) return null;
  
  const [copiedStatus, setCopiedStatus] = useState<Record<string, boolean>>({});

  const placeholderImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        setCopiedStatus({ [key]: true });
        setTimeout(() => setCopiedStatus(prev => ({ ...prev, [key]: false })), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const getFullAgentInfo = () => {
    if (!agent) return '';
    const parts = [
      `Name: ${agent.Name}`,
      agent.Role ? `Role: ${agent.Role}` : null,
      agent['Phone number'] ? `Phone: ${agent['Phone number']}` : null,
      agent.Email ? `Email: ${agent.Email}` : null,
      agent.WhatsApp ? `WhatsApp: ${agent.WhatsApp}` : null,
    ];
    return parts.filter(Boolean).join('\n');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-10"><Spinner text="Fetching agent profile..." size="medium" /></div>;
    }
    if (error) {
      return (
        <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Error</h3>
            <p className="mt-2 text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">{error}</p>
        </div>
      );
    }
    if (agent) {
      return (
        <>
            <div className="p-6 text-center">
                <img
                    src={agent['Profile photo'] || placeholderImageUrl}
                    alt={agent.Name}
                    className="w-24 h-24 mx-auto rounded-full object-cover ring-4 ring-white dark:ring-dark-ios-gray-300 shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholderImageUrl; }}
                />
                <h3 className="mt-4 text-xl font-bold text-black dark:text-dark-ios-gray-800">{agent.Name}</h3>
                <p className="text-sm text-ios-gray-600 dark:text-dark-ios-gray-600">{agent.Role || 'Agent'}</p>
            </div>
            <div className="border-t border-ios-gray-200 dark:border-dark-ios-gray-400 px-4 py-4 space-y-3">
                 <p className="text-xs text-center font-semibold text-ios-gray-500 dark:text-dark-ios-gray-500 uppercase tracking-wider">Contact Information</p>
                <div className="divide-y divide-ios-gray-200 dark:divide-dark-ios-gray-300">
                    {agent['Phone number'] && (
                        <ContactInfoRow 
                            href={`tel:${agent['Phone number']}`} 
                            icon={<PhoneIcon className="w-5 h-5"/>} 
                            label="Phone"
                            value={agent['Phone number']}
                            onCopy={() => handleCopy(agent['Phone number']!, 'phone')}
                            isCopied={!!copiedStatus.phone}
                        />
                    )}
                    {agent.Email && (
                        <ContactInfoRow 
                            href={`mailto:${agent.Email}`} 
                            icon={<EnvelopeIcon className="w-5 h-5"/>} 
                            label="Email"
                            value={agent.Email}
                            onCopy={() => handleCopy(agent.Email!, 'email')}
                            isCopied={!!copiedStatus.email}
                        />
                    )}
                    {agent.WhatsApp && (
                         <ContactInfoRow 
                            href={agent.WhatsApp} 
                            icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} 
                            label="WhatsApp"
                            value={agent.WhatsApp}
                            onCopy={() => handleCopy(agent.WhatsApp!, 'whatsapp')}
                            isCopied={!!copiedStatus.whatsapp}
                        />
                    )}
                </div>
                <button
                    onClick={() => handleCopy(getFullAgentInfo(), 'all')}
                    className="w-full flex items-center justify-center gap-2 mt-4 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out bg-ios-gray-200 dark:bg-dark-ios-gray-300 text-black dark:text-dark-ios-gray-800 hover:bg-ios-gray-300 dark:hover:bg-dark-ios-gray-400"
                >
                    {copiedStatus.all ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                    {copiedStatus.all ? 'All Info Copied' : 'Copy All Info'}
                </button>
            </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/75 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-ios-gray-100 dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-modal dark:shadow-dark-ios-modal w-full max-w-sm flex flex-col transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-2 text-right">
          <button onClick={onClose} className="p-1.5 text-ios-gray-500 dark:text-dark-ios-gray-500 hover:bg-ios-gray-200 dark:hover:bg-dark-ios-gray-300 rounded-full">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </header>
        
        <div className="pb-4">
             {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AgentProfileModal;
