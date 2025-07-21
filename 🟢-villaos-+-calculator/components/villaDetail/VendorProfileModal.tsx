
import React, { useMemo, useState } from 'react';
import { Vendor, Villa } from '../../types';
import { XMarkIcon, PhoneIcon, EnvelopeIcon, LinkIcon, HomeIcon, ClipboardDocumentIcon, CheckIcon } from '../Icons';
import Spinner from '../Spinner';

interface VendorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  isLoading: boolean;
  error: string | null;
  allVillas: Villa[];
  onVillaSelect: (villa: Villa) => void;
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

const VendorProfileModal: React.FC<VendorProfileModalProps> = ({ isOpen, onClose, vendor, isLoading, error, allVillas, onVillaSelect }) => {
  if (!isOpen) return null;

  const [copiedStatus, setCopiedStatus] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        setCopiedStatus({ [key]: true });
        setTimeout(() => setCopiedStatus(prev => ({ ...prev, [key]: false })), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const getFullVendorInfo = () => {
    if (!vendor) return '';
    const parts = [
      `Name: ${vendor.Name}`,
      vendor.Company ? `Company: ${vendor.Company}` : null,
      vendor.Service ? `Service: ${vendor.Service}` : null,
      vendor['Phone number'] ? `Phone: ${vendor['Phone number']}` : null,
      vendor.Email ? `Email: ${vendor.Email}` : null,
      vendor.Website ? `Website: ${vendor.Website}` : null,
    ];
    return parts.filter(Boolean).join('\n');
  };

  const relatedVillas = useMemo(() => {
    if (!vendor || !vendor['Related villa']) return [];
    const relatedVillaIds = vendor['Related villa'].split(',').map(id => id.trim().toLowerCase());
    return allVillas.filter(villa => relatedVillaIds.includes(villa.id.toLowerCase()));
  }, [vendor, allVillas]);

  const handleSelectVilla = (villa: Villa) => {
    onVillaSelect(villa);
    onClose();
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-10"><Spinner text="Fetching vendor profile..." size="medium" /></div>;
    }
    if (error) {
      return (
        <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Error</h3>
            <p className="mt-2 text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">{error}</p>
        </div>
      );
    }
    if (vendor) {
      return (
        <>
            <div className="p-6 text-center border-b border-ios-gray-200 dark:border-dark-ios-gray-400">
                <h3 className="text-xl font-bold text-black dark:text-dark-ios-gray-800">{vendor.Name}</h3>
                <p className="text-sm text-ios-gray-600 dark:text-dark-ios-gray-600">{vendor.Company || vendor.Service || 'Vendor'}</p>
            </div>
            <div className="px-4 py-4 space-y-3">
                 <p className="text-xs text-center font-semibold text-ios-gray-500 dark:text-dark-ios-gray-500 uppercase tracking-wider">Contact Information</p>
                <div className="divide-y divide-ios-gray-200 dark:divide-dark-ios-gray-300">
                    {vendor['Phone number'] && (
                         <ContactInfoRow 
                            href={`tel:${vendor['Phone number']}`} 
                            icon={<PhoneIcon className="w-5 h-5"/>} 
                            label="Phone"
                            value={vendor['Phone number']}
                            onCopy={() => handleCopy(vendor['Phone number']!, 'phone')}
                            isCopied={!!copiedStatus.phone}
                        />
                    )}
                    {vendor.Email && (
                        <ContactInfoRow 
                            href={`mailto:${vendor.Email}`} 
                            icon={<EnvelopeIcon className="w-5 h-5"/>} 
                            label="Email"
                            value={vendor.Email}
                            onCopy={() => handleCopy(vendor.Email!, 'email')}
                            isCopied={!!copiedStatus.email}
                        />
                    )}
                    {vendor.Website && (
                         <ContactInfoRow 
                            href={vendor.Website} 
                            icon={<LinkIcon className="w-5 h-5"/>} 
                            label="Website"
                            value={vendor.Website}
                            onCopy={() => handleCopy(vendor.Website!, 'website')}
                            isCopied={!!copiedStatus.website}
                        />
                    )}
                </div>
                 <button
                    onClick={() => handleCopy(getFullVendorInfo(), 'all')}
                    className="w-full flex items-center justify-center gap-2 mt-4 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out bg-ios-gray-200 dark:bg-dark-ios-gray-300 text-black dark:text-dark-ios-gray-800 hover:bg-ios-gray-300 dark:hover:bg-dark-ios-gray-400"
                >
                    {copiedStatus.all ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                    {copiedStatus.all ? 'All Info Copied' : 'Copy All Info'}
                </button>
            </div>
            {relatedVillas.length > 0 && (
                 <div className="border-t border-ios-gray-200 dark:border-dark-ios-gray-400">
                    <h4 className="px-4 pt-3 pb-2 text-sm font-semibold text-black dark:text-dark-ios-gray-800 flex items-center">
                        <HomeIcon className="w-5 h-5 mr-2 text-ios-gray-500 dark:text-dark-ios-gray-500" />
                        Properties from this Vendor
                    </h4>
                     <ul className="divide-y divide-ios-gray-200 dark:divide-dark-ios-gray-400 max-h-60 overflow-y-auto">
                        {relatedVillas.map(villa => (
                            <li 
                                key={villa.id} 
                                onClick={() => handleSelectVilla(villa)}
                                className="p-3 hover:bg-ios-gray-200/50 dark:hover:bg-dark-ios-gray-300/50 cursor-pointer transition-colors flex items-center space-x-4"
                            >
                                <img 
                                    src={villa.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"} 
                                    alt={villa.name}
                                    className="w-16 h-12 object-cover rounded-md bg-ios-gray-300 dark:bg-dark-ios-gray-400"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-black dark:text-dark-ios-gray-800 truncate">{villa.name}</p>
                                    <p className="text-xs text-ios-gray-600 dark:text-dark-ios-gray-600">{villa.bedrooms} BR | {villa.propertyType}</p>
                                </div>
                                <div className="text-right">
                                     <p className="text-sm font-bold text-apple-blue dark:text-apple-blue-light">${villa.price.toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                 </div>
            )}
        </>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/75 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-ios-gray-100 dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-modal dark:shadow-dark-ios-modal w-full max-w-lg flex flex-col transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-2 text-right relative z-10">
          <button onClick={onClose} className="p-1.5 text-ios-gray-500 dark:text-dark-ios-gray-500 hover:bg-ios-gray-200 dark:hover:bg-dark-ios-gray-300 rounded-full">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </header>
        
        <div className="-mt-10">
             {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VendorProfileModal;
