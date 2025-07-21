

import React, { useMemo, useState } from 'react';
import { Villa, MarketAnalytics, AdvancedAnalytics, Agent, Vendor } from '../types';
import { ChevronLeftIcon, PencilSquareIcon, HomeIcon, DocumentTextIcon, LinkIcon, BanknotesIcon, UserGroupIcon, LocationMarkerIcon, ChartBarIcon, SparklesIcon } from '../components/Icons';
import MetricCard from '../components/villaDetail/MetricCard';
import { generateMarketAnalytics, findSimilarVillas, calculateLeaseholdValueScore, generateAdvancedAnalytics } from '../services/analyticsService';
import AnalyticsCard from '../components/villaDetail/AnalyticsCard';
import { useTheme } from '../contexts/ThemeContext';
import SimilarVillasList from '../components/villaDetail/SimilarVillasList';
import AdvancedAnalyticsCard from '../components/villaDetail/AdvancedAnalyticsCard';
import { fetchAgents } from '../services/agentService';
import AgentProfileModal from '../components/villaDetail/AgentProfileModal';
import { fetchVendors } from '../services/vendorService';
import VendorProfileModal from '../components/villaDetail/VendorProfileModal';

interface VillaDetailPageProps {
    villa: Villa;
    allVillas: Villa[];
    onEdit: (villa: Villa) => void;
    onVillaSelect: (villa: Villa) => void;
    onBack: () => void;
    onNavigateToCalculator: (villa: Villa) => void;
}

const formatDisplayVillaTitle = (villa: Villa): string => {
  const { bedrooms, propertyType, district, districtArea, name } = villa;
  if (name && name !== 'Unnamed Villa' && !name.startsWith('Villa Ref') && name.length > 5) return name;

  const locationPart = districtArea || district || 'N/A';
  let title = `${bedrooms}BR`;
  if (propertyType && propertyType.toLowerCase() !== 'n/a' && propertyType.trim() !== '') {
    title += ` ${propertyType}`;
  }
  title += ` in ${locationPart}`;
  return title.replace(/\s-\s*$/, '').trim();
};

const formatIDRPrice = (price?: string | number): string => {
    if (price === undefined || price === null || price === '') return 'N/A';
    
    let priceStr = String(price);

    if (priceStr.startsWith('Rp') && (priceStr.includes('.') || priceStr.includes(','))) {
        return priceStr;
    }

    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) {
        return priceStr;
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

const MarkdownContent: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
    const createMarkup = (text: string) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gm, '<li class="list-disc list-inside ml-2">$1</li>')
            .replace(/(<li.*>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
            .replace(/<\/ul>\s*<ul>/g, ''); // Merge consecutive lists
        return { __html: html };
    };
    return <div className={className} dangerouslySetInnerHTML={createMarkup(content || '')} />;
};


const VillaDetailPage: React.FC<VillaDetailPageProps> = ({ villa, allVillas, onEdit, onVillaSelect, onBack, onNavigateToCalculator }) => {
    const { theme } = useTheme();
    const displayTitle = formatDisplayVillaTitle(villa);
    const placeholderImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23e5e5ea'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='48px' fill='%23aeaebe'%3ENo Image Available%3C/text%3E%3C/svg%3E";
    
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isFetchingAgent, setIsFetchingAgent] = useState(false);
    const [agentError, setAgentError] = useState<string | null>(null);

    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isFetchingVendor, setIsFetchingVendor] = useState(false);
    const [vendorError, setVendorError] = useState<string | null>(null);

    const displayROI = villa.percentROI ? (villa.percentROI > 1 ? villa.percentROI : villa.percentROI * 100) : null;

    const { marketAnalytics, similarVillas, leaseholdValueScore, advancedAnalytics } = useMemo(() => {
        const baseAnalytics = generateMarketAnalytics(allVillas, villa);
        return {
            marketAnalytics: baseAnalytics,
            similarVillas: findSimilarVillas(allVillas, villa),
            leaseholdValueScore: calculateLeaseholdValueScore(villa),
            advancedAnalytics: generateAdvancedAnalytics(allVillas, villa, baseAnalytics),
        };
    }, [allVillas, villa]);

    const handleAgentClick = async (agentName: string) => {
        if (!agentName) return;
        setIsAgentModalOpen(true);
        setIsFetchingAgent(true);
        setAgentError(null);
        setSelectedAgent(null);

        try {
            const allAgents = await fetchAgents();
            const agent = allAgents.find(a => a.Name.toLowerCase() === agentName.toLowerCase());
            if (agent) {
                setSelectedAgent(agent);
            } else {
                setAgentError(`Profile for agent "${agentName}" not found.`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Could not fetch agent data.';
            setAgentError(errorMessage);
        } finally {
            setIsFetchingAgent(false);
        }
    };

    const handleVendorClick = async (vendorName: string) => {
        if (!vendorName) return;
        setIsVendorModalOpen(true);
        setIsFetchingVendor(true);
        setVendorError(null);
        setSelectedVendor(null);

        try {
            const allVendors = await fetchVendors();
            const vendor = allVendors.find(v => v.Name.toLowerCase() === vendorName.toLowerCase());
            if (vendor) {
                setSelectedVendor(vendor);
            } else {
                setVendorError(`Profile for vendor "${vendorName}" not found.`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Could not fetch vendor data.';
            setVendorError(errorMessage);
        } finally {
            setIsFetchingVendor(false);
        }
    };


    return (
        <div className="bg-ios-gray-100 dark:bg-dark-ios-gray-100 min-h-screen">
            <div className="bg-ios-gray-100/80 dark:bg-dark-ios-gray-100/80 backdrop-blur-lg z-30 border-b border-ios-gray-200/70 dark:border-dark-ios-gray-300/70">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-14">
                        <button 
                            onClick={onBack} 
                            className="inline-flex items-center text-apple-blue dark:text-apple-blue-light hover:text-apple-blue/80 dark:hover:text-apple-blue-light/80 text-sm font-medium transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            Back to Listings
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                <div className="mb-4 pt-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-apple-blue dark:text-apple-blue-light font-medium">{villa.propertyType} in {villa.district}</p>
                            <h1 className="text-3xl font-bold text-black dark:text-dark-ios-gray-800 mt-1">{displayTitle}</h1>
                        </div>
                        <div className="flex-shrink-0 ml-4 mt-2 flex items-center gap-2">
                             <button 
                                onClick={() => onNavigateToCalculator(villa)} 
                                className="flex items-center justify-center px-3 py-2 bg-apple-blue dark:bg-apple-blue-dark text-white font-medium rounded-ios-button shadow-ios-subtle dark:shadow-dark-ios-subtle hover:bg-apple-blue/90 dark:hover:bg-apple-blue-dark/90 focus:outline-none focus:ring-2 focus:ring-apple-blue dark:focus:ring-apple-blue-light focus:ring-opacity-75 transition duration-150 ease-in-out text-sm"
                                title="Analyze with ROI Calculator"
                            >
                                <ChartBarIcon className="w-4 h-4 mr-1.5"/>
                                ROI
                            </button>
                            <button onClick={() => onEdit(villa)} className="p-2.5 bg-white dark:bg-dark-ios-gray-300 rounded-lg hover:bg-ios-gray-200 dark:hover:bg-dark-ios-gray-400 transition-colors shadow-ios-subtle dark:shadow-dark-ios-subtle" title="Edit Villa">
                                <PencilSquareIcon className="w-5 h-5 text-black dark:text-dark-ios-gray-800"/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card overflow-hidden">
                       <img src={villa.image_url || placeholderImageUrl} alt={displayTitle} className="w-full h-96 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = placeholderImageUrl; }}/>
                    </div>
                    
                    {/* 1. Investment Highlights */}
                    <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
                        <h2 className="text-xl font-semibold text-black dark:text-dark-ios-gray-800 mb-4">Investment Highlights</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <MetricCard title="Reference Code" value={villa.id} />
                            <MetricCard title="Price (USD)" value={`$${villa.price.toLocaleString()}`} />
                            <MetricCard title="Location" value={`${villa.districtArea || ''}, ${villa.district || ''}`.replace(/^, /,'')} />
                            <MetricCard title="Property Type" value={villa.propertyType || 'N/A'} />
                            <MetricCard title="Potential ROI" value={displayROI ? `${displayROI.toFixed(1)}%` : 'N/A'} />
                            <MetricCard title="Potential Net Income" value={villa.dollarROI ? `$${villa.dollarROI.toLocaleString()}`: 'N/A'} />
                        </div>
                    </div>

                    {/* 2. Links & Media */}
                    <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
                        <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center"><LinkIcon className="w-5 h-5 mr-2"/>Links & Media</h3>
                         <div className="flex flex-col space-y-2 mt-2">
                            {villa.locationPin && <a href={villa.locationPin} target="_blank" rel="noopener noreferrer" className="flex items-center text-apple-blue dark:text-apple-blue-light text-sm hover:underline"><LocationMarkerIcon className="w-4 h-4 mr-2"/>Google Maps Link</a>}
                            {villa.driveLink && <a href={villa.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-apple-blue dark:text-apple-blue-light text-sm hover:underline"><LinkIcon className="w-4 h-4 mr-2"/>Google Drive Link</a>}
                            {villa.webListingLink && <a href={villa.webListingLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-apple-blue dark:text-apple-blue-light text-sm hover:underline"><LinkIcon className="w-4 h-4 mr-2"/>Website Listing</a>}
                            {villa.brochureLink && <a href={villa.brochureLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-apple-blue dark:text-apple-blue-light text-sm hover:underline"><LinkIcon className="w-4 h-4 mr-2"/>Digital Brochure</a>}
                            {villa.roiReportLink && <a href={villa.roiReportLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-apple-blue dark:text-apple-blue-light text-sm hover:underline"><LinkIcon className="w-4 h-4 mr-2"/>ROI Report</a>}
                        </div>
                    </div>
                    
                    {/* 3. Property Specs */}
                    <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
                        <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center"><HomeIcon className="w-5 h-5 mr-2"/>Property Specs</h3>
                        <ul className="space-y-2 text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">
                            <li className="flex justify-between"><span>Bedrooms:</span><strong className="text-black dark:text-white">{villa.bedrooms}</strong></li>
                            <li className="flex justify-between"><span>Bathrooms:</span><strong className="text-black dark:text-white">{villa.bathrooms}</strong></li>
                            <li className="flex justify-between"><span>Building Size:</span><strong className="text-black dark:text-white">{villa.buildingSizeM2 ? `${villa.buildingSizeM2} m²` : 'N/A'}</strong></li>
                            <li className="flex justify-between"><span>Land Size:</span><strong className="text-black dark:text-white">{villa.landSizeM2 ? `${villa.landSizeM2} m²` : 'N/A'}</strong></li>
                            <li className="flex justify-between"><span>Units Available:</span><strong className="text-black dark:text-white">{villa.unitsAvailable || 'N/A'}</strong></li>
                            <li className="flex justify-between"><span>Delivery Date:</span><strong className="text-black dark:text-white">{villa.deliveryDate || 'N/A'}</strong></li>
                            <li className="flex justify-between"><span>Availability:</span><strong className="text-black dark:text-white">{villa.availability || 'N/A'}</strong></li>
                        </ul>
                    </div>

                    {/* 4. Contract, Legal & Pricing */}
                    <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
                        <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center"><DocumentTextIcon className="w-5 h-5 mr-2"/>Contract, Legal & Pricing</h3>
                        <ul className="space-y-2 text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">
                            <li className="flex justify-between items-baseline">
                                <span>Price (USD):</span>
                                <strong className="text-lg font-bold text-apple-blue dark:text-apple-blue-light">${villa.price.toLocaleString()}</strong>
                            </li>
                            <li className="flex justify-between items-baseline">
                                <span>Price (IDR):</span>
                                <strong className="text-black dark:text-white">{formatIDRPrice(villa.priceIDRRaw)}</strong>
                            </li>
                            <div className="border-t border-ios-gray-200 dark:border-dark-ios-gray-300/50 my-2"></div>
                            <li className="flex justify-between"><span>Contract Type:</span><strong className="text-black dark:text-white">{villa.contractType || 'N/A'}</strong></li>
                            {villa.contractType === 'Leasehold' && <>
                            <li className="flex justify-between"><span>Leasehold Years:</span><strong className="text-black dark:text-white">{villa.leaseholdYears || 'N/A'}</strong></li>
                            <li className="flex justify-between"><span>Extension:</span><strong className="text-black dark:text-white">{villa.extensionYears || 'N/A'}</strong></li>
                            </>}
                            <li className="flex justify-between"><span>Building Permit:</span><strong className="text-black dark:text-white">{villa.buildingPermit || 'N/A'}</strong></li>
                            <li className="flex justify-between"><span>Date Listed:</span><strong className="text-black dark:text-white">{villa.dateListed || 'N/A'}</strong></li>
                        </ul>
                    </div>

                    {/* 5. Parties Involved */}
                     <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
                        <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center"><UserGroupIcon className="w-5 h-5 mr-2"/>Parties Involved</h3>
                         <ul className="space-y-2 text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">
                            <li className="flex justify-between items-center">
                                <span>Listing Agent:</span>
                                {villa.listingAgent ? (
                                    <button
                                        onClick={() => handleAgentClick(villa.listingAgent!)}
                                        disabled={isFetchingAgent}
                                        className="font-medium text-apple-blue dark:text-apple-blue-light hover:underline disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {villa.listingAgent}
                                    </button>
                                ) : (
                                    <strong className="text-black dark:text-white">N/A</strong>
                                )}
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Vendor:</span>
                                {villa.vendor ? (
                                    <button
                                        onClick={() => handleVendorClick(villa.vendor!)}
                                        disabled={isFetchingVendor}
                                        className="font-medium text-apple-blue dark:text-apple-blue-light hover:underline disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {villa.vendor}
                                    </button>
                                ) : (
                                    <strong className="text-black dark:text-white">N/A</strong>
                                )}
                            </li>
                        </ul>
                    </div>

                    {/* 6. Additional Details */}
                    <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
                        <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center"><SparklesIcon className="w-5 h-5 mr-2"/>Additional Details</h3>
                        <MarkdownContent content={villa.description} className="text-sm text-ios-gray-700 dark:text-dark-ios-gray-700 leading-relaxed whitespace-pre-line break-words" />
                    </div>

                    {/* 7. Advanced Analytics */}
                    <AdvancedAnalyticsCard
                        analytics={advancedAnalytics}
                        leaseholdValueScore={leaseholdValueScore}
                    />

                    {/* 8. Market Analysis */}
                    <AnalyticsCard
                        analytics={marketAnalytics}
                        currentVilla={villa}
                        theme={theme}
                    />

                    {/* 9. Similar Properties */}
                    {similarVillas.length > 0 && (
                        <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
                            <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center">
                                <UserGroupIcon className="w-5 h-5 mr-2"/>Similar Properties
                            </h3>
                            <SimilarVillasList villas={similarVillas} onVillaSelect={onVillaSelect} />
                        </div>
                    )}
                </div>
            </main>
            <AgentProfileModal
                isOpen={isAgentModalOpen}
                onClose={() => setIsAgentModalOpen(false)}
                agent={selectedAgent}
                isLoading={isFetchingAgent}
                error={agentError}
            />
            <VendorProfileModal
                isOpen={isVendorModalOpen}
                onClose={() => setIsVendorModalOpen(false)}
                vendor={selectedVendor}
                isLoading={isFetchingVendor}
                error={vendorError}
                allVillas={allVillas}
                onVillaSelect={onVillaSelect}
            />
        </div>
    );
};

export default VillaDetailPage;
