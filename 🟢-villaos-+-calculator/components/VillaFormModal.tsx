


import React, { useState, useEffect, useCallback } from 'react';
import { Villa, Agent, Vendor } from '../types';
import { XMarkIcon } from './Icons';
import { formatDateToDDMonthYYYY, parseDDMonthYYYYtoDate } from '../services/villaService';
import Spinner from './Spinner';
import { fetchAgents } from '../services/agentService';
import { fetchVendors } from '../services/vendorService';
import SearchableSelect from './SearchableSelect';

interface VillaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (villaData: Partial<Villa>) => Promise<void>;
  initialData?: Villa | null;
  isSaving: boolean;
  saveError: string | null;
}

const DISTRICT_OPTIONS = [
  "Canggu", "Uluwatu", "Mengwi Tabanan", "Seminyak", "Ubud", "Sanur", "Buleleng"
].sort();

const DISTRICT_AREA_OPTIONS = [
  "Pererenan", "Kedungu", "Kerobokan", "Berawa", "Batu Bolong", "Tibubeneng", 
  "Cemagi", "Seseh", "Kaba Kaba", "Umalas", "Buduk", "Nyang Nyang", "Karma", 
  "Ungasan", "Balangan", "Bingin", "Tumbak Bayuh", "Munggu", "Pecatu", 
  "Pantai Lima", "Tanah Lot", "Babakan", "Padang Linjong", "Melasti", 
  "Jimbaran", "Amed", "Munduk", "Sayan", "Dreamland", "Cepaka", "Nunggalan", 
  "Batu Mejan", "Kintamani"
].sort();


const initialFormState: Partial<Villa> = {
  id: '', // Reference
  dateListed: '',
  availability: undefined,
  propertyType: undefined,
  contractType: '',
  district: '',
  districtArea: '',
  landSizeM2: undefined,
  buildingSizeM2: undefined,
  bedrooms: 0,
  bathrooms: 0,
  deliveryDate: '',
  priceIDRRaw: '',
  priceUSD: undefined,
  leaseholdYears: '',
  extensionYears: '',
  additionalDetails: '',
  percentROI: undefined,
  dollarROI: undefined,
  listingAgent: '',
  unitsAvailable: '',
  vendor: '',
  image_url: '', // Corresponds to Thumbnail
  driveLink: '',
  locationPin: '', // Corresponds to Location link
  webListingLink: '', // Corresponds to Web link
  roiReportLink: '',
};


const VillaFormModal: React.FC<VillaFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSaving,
  saveError,
}) => {
  const [formData, setFormData] = useState<Partial<Villa>>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const [agents, setAgents] = useState<string[]>([]);
  const [isFetchingAgents, setIsFetchingAgents] = useState(false);
  const [vendors, setVendors] = useState<string[]>([]);
  const [isFetchingVendors, setIsFetchingVendors] = useState(false);


  useEffect(() => {
    if (isOpen) {
      setSelectedImageFile(null); 
      setImagePreviewUrl(null); 
      if (initialData) {
          let dateForInput = '';
          if (initialData.dateListed) {
              const parsed = parseDDMonthYYYYtoDate(initialData.dateListed);
              if (parsed) dateForInput = parsed.toISOString().split('T')[0];
          }
        setFormData({ 
          ...initialFormState, 
          ...initialData,
          name: initialData.name || '', 
          dateListed: dateForInput,
          priceUSD: initialData.priceUSD ?? undefined,
          landSizeM2: initialData.landSizeM2 ?? undefined,
          buildingSizeM2: initialData.buildingSizeM2 ?? undefined,
          bedrooms: initialData.bedrooms ?? 0,
          bathrooms: initialData.bathrooms ?? 0,
          unitsAvailable: initialData.unitsAvailable !== undefined ? String(initialData.unitsAvailable) : '',
          leaseholdYears: initialData.leaseholdYears !== undefined ? String(initialData.leaseholdYears) : '',
        });
        if (initialData.image_url) setImagePreviewUrl(initialData.image_url); 
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({...initialFormState, dateListed: today });
      }
      setFormErrors({});

      const loadDropdownData = async () => {
        setIsFetchingAgents(true);
        setIsFetchingVendors(true);
        try {
            const agentData = await fetchAgents();
            setAgents(agentData.map(a => a.Name).sort());
        } catch (error) {
            console.error("Failed to fetch agents for form:", error);
        } finally {
            setIsFetchingAgents(false);
        }

        try {
            const vendorData = await fetchVendors();
            setVendors(vendorData.map(v => v.Name).sort());
        } catch (error) {
            console.error("Failed to fetch vendors for form:", error);
        } finally {
            setIsFetchingVendors(false);
        }
      };
      loadDropdownData();
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreviewUrl(reader.result as string); };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image_url: undefined })); 
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(initialData?.image_url || null);
      setFormData(prev => ({ ...prev, image_url: initialData?.image_url || undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;

    if (['priceUSD', 'landSizeM2', 'buildingSizeM2', 'bedrooms', 'bathrooms', 'percentROI', 'dollarROI'].includes(name)) {
        processedValue = value === '' ? undefined : parseFloat(value);
        if (isNaN(processedValue as number)) processedValue = undefined;
    } else if (name === 'unitsAvailable' || name === 'leaseholdYears') {
        processedValue = value; 
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (formErrors[name]) setFormErrors(prev => ({...prev, [name]: ''}));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.id?.trim()) errors.id = "Reference ID is required.";
    if (!formData.propertyType) errors.propertyType = "Property type is required.";
    if (!formData.bedrooms || formData.bedrooms <= 0) errors.bedrooms = "Bedrooms must be > 0.";
    if (!formData.bathrooms || formData.bathrooms <= 0) errors.bathrooms = "Bathrooms must be > 0.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let dataToSubmit = { ...formData };
    if (!dataToSubmit.name && initialData?.name) dataToSubmit.name = initialData.name;
    else if (!dataToSubmit.name?.trim() && dataToSubmit.id) dataToSubmit.name = `Villa Ref ${dataToSubmit.id}`;

    if (dataToSubmit.dateListed) {
        try {
            const dateObj = new Date(dataToSubmit.dateListed);
            if(!isNaN(dateObj.getTime())) {
                dataToSubmit.dateListed = formatDateToDDMonthYYYY(dateObj);
            }
        } catch (e) {
            console.warn("Could not parse date from input, submitting as is.", dataToSubmit.dateListed);
        }
    }
    
    dataToSubmit.priceUSD = formData.priceUSD ? parseFloat(String(formData.priceUSD)) : undefined;
    dataToSubmit.landSizeM2 = formData.landSizeM2 ? parseFloat(String(formData.landSizeM2)) : undefined;
    dataToSubmit.buildingSizeM2 = formData.buildingSizeM2 ? parseFloat(String(formData.buildingSizeM2)) : undefined;
    dataToSubmit.bedrooms = formData.bedrooms ? parseInt(String(formData.bedrooms), 10) : 0;
    dataToSubmit.bathrooms = formData.bathrooms ? parseInt(String(formData.bathrooms), 10) : 0;
    
    if (selectedImageFile) dataToSubmit.image_url = imagePreviewUrl || undefined;
    else if (initialData?.image_url && !imagePreviewUrl) dataToSubmit.image_url = undefined; 
    else if (initialData?.image_url) dataToSubmit.image_url = initialData.image_url;
    else dataToSubmit.image_url = undefined;

    await onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  const renderError = (fieldName: string) => formErrors[fieldName] && <p className="text-red-500 dark:text-red-400 text-xs mt-0.5">{formErrors[fieldName]}</p>;

  const inputClass = "mt-0.5 block w-full px-3 py-2 bg-white dark:bg-dark-ios-gray-100 border border-ios-gray-300 dark:border-dark-ios-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-apple-blue dark:focus:ring-apple-blue-light focus:border-apple-blue dark:focus:border-apple-blue-light sm:text-sm text-black dark:text-dark-ios-gray-800 placeholder-ios-gray-400 dark:placeholder-dark-ios-gray-500";
  const labelClass = "block text-xs font-medium text-ios-gray-700 dark:text-dark-ios-gray-700";
  const sectionHeaderClass = "px-3 py-1.5 text-xs font-semibold uppercase text-ios-gray-500 dark:text-dark-ios-gray-500 bg-ios-gray-100/50 dark:bg-dark-ios-gray-200/50 border-b border-ios-gray-200/70 dark:border-dark-ios-gray-300/70 rounded-t-lg";
  const sectionContainerClass = "bg-white dark:bg-dark-ios-gray-100 rounded-lg shadow-ios-subtle dark:shadow-dark-ios-subtle border border-ios-gray-200/70 dark:border-dark-ios-gray-300/70";

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/75 flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
      <div 
        className="bg-ios-gray-100 dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-modal dark:shadow-dark-ios-modal w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-ios-gray-200 dark:border-dark-ios-gray-300 flex justify-between items-center sticky top-0 bg-ios-gray-100/80 dark:bg-dark-ios-gray-200/80 backdrop-blur-md z-10 rounded-t-xl">
          <h2 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800">
            {initialData ? 'Edit Villa' : 'Add New Villa'}
          </h2>
          <button onClick={onClose} className="p-1 text-ios-gray-500 dark:text-dark-ios-gray-500 hover:text-black dark:hover:text-dark-ios-gray-800 rounded-full">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="relative flex-grow flex flex-col overflow-hidden">
          {isSaving && (
            <div className="absolute inset-0 bg-ios-gray-100/80 dark:bg-dark-ios-gray-200/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-b-xl">
                <Spinner text="Saving..." size="large"/>
                <p className="mt-2 text-sm text-ios-gray-600 dark:text-dark-ios-gray-600">Please wait while we update the villa details.</p>
            </div>
          )}
          
          <div className="flex-grow overflow-y-auto p-4 space-y-5 modal-scrollbar">
            <div className={sectionContainerClass}>
              <h4 className={sectionHeaderClass}>Core Information</h4>
              <div className="p-3 space-y-3">
                <div>
                  <label htmlFor="id" className={labelClass}>Reference *</label>
                  <input type="text" name="id" id="id" value={formData.id || ''} onChange={handleChange} className={inputClass} required />
                  {renderError('id')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="propertyType" className={labelClass}>Property Type *</label>
                    <select name="propertyType" id="propertyType" value={formData.propertyType || ''} onChange={handleChange} className={inputClass} required>
                      <option value="" disabled>Select type</option>
                      <option value="Off plan">Off plan</option><option value="Ready villa">Ready villa</option>
                      <option value="Apartment">Apartment</option><option value="Resort">Resort</option>
                    </select>
                    {renderError('propertyType')}
                  </div>
                  <div>
                    <label htmlFor="availability" className={labelClass}>Availability *</label>
                    <select name="availability" id="availability" value={formData.availability || ''} onChange={handleChange} className={inputClass} required>
                      <option value="" disabled>Select</option>
                      <option value="Available">Available</option><option value="Sold out">Sold out</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label htmlFor="dateListed" className={labelClass}>Date Listed</label><input type="date" name="dateListed" id="dateListed" value={formData.dateListed || ''} onChange={handleChange} className={`${inputClass} dark:[color-scheme:dark]`} /></div>
                  <div><label htmlFor="deliveryDate" className={labelClass}>Delivery Date</label><input type="text" name="deliveryDate" id="deliveryDate" placeholder="e.g., Q4 2025" value={formData.deliveryDate || ''} onChange={handleChange} className={inputClass} /></div>
                </div>
              </div>
            </div>

            <div className={sectionContainerClass}>
              <h4 className={sectionHeaderClass}>Location</h4>
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label htmlFor="district" className={labelClass}>District</label><select name="district" id="district" value={formData.district || ''} onChange={handleChange} className={inputClass}><option value="">Select District</option>{DISTRICT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                  <div><label htmlFor="districtArea" className={labelClass}>District Area</label><select name="districtArea" id="districtArea" value={formData.districtArea || ''} onChange={handleChange} className={inputClass}><option value="">Select Area</option>{DISTRICT_AREA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                </div>
                <div><label htmlFor="locationPin" className={labelClass}>Location link</label><input type="url" name="locationPin" id="locationPin" placeholder="https://maps.google.com/..." value={formData.locationPin || ''} onChange={handleChange} className={inputClass} /></div>
              </div>
            </div>
            
            <div className={sectionContainerClass}>
              <h4 className={sectionHeaderClass}>Specifications</h4>
              <div className="p-3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label htmlFor="bedrooms" className={labelClass}>Bedrooms *</label><input type="number" name="bedrooms" id="bedrooms" value={formData.bedrooms === undefined ? '' : formData.bedrooms} onChange={handleChange} className={inputClass} required min="0"/>{renderError('bedrooms')}</div>
                      <div><label htmlFor="bathrooms" className={labelClass}>Bathrooms *</label><input type="number" name="bathrooms" id="bathrooms" value={formData.bathrooms === undefined ? '' : formData.bathrooms} onChange={handleChange} className={inputClass} required min="0"/>{renderError('bathrooms')}</div>
                      <div><label htmlFor="landSizeM2" className={labelClass}>Land size m2</label><input type="number" name="landSizeM2" id="landSizeM2" value={formData.landSizeM2 === undefined ? '' : formData.landSizeM2} onChange={handleChange} className={inputClass} step="any" /></div>
                      <div><label htmlFor="buildingSizeM2" className={labelClass}>Building size m2</label><input type="number" name="buildingSizeM2" id="buildingSizeM2" value={formData.buildingSizeM2 === undefined ? '' : formData.buildingSizeM2} onChange={handleChange} className={inputClass} step="any" /></div>
                  </div>
                  <div><label htmlFor="unitsAvailable" className={labelClass}>Units available</label><input type="text" name="unitsAvailable" id="unitsAvailable" placeholder="e.g., 3 or 1 of 5" value={formData.unitsAvailable || ''} onChange={handleChange} className={inputClass} /></div>
              </div>
            </div>

            <div className={sectionContainerClass}>
              <h4 className={sectionHeaderClass}>Contract & Pricing</h4>
              <div className="p-3 space-y-3">
                  <div><label htmlFor="contractType" className={labelClass}>Contract</label><select name="contractType" id="contractType" value={formData.contractType || ''} onChange={handleChange} className={inputClass}><option value="">Select</option><option value="Leasehold">Leasehold</option><option value="Freehold">Freehold</option></select></div>
                  {formData.contractType === 'Leasehold' && (<><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><label htmlFor="leaseholdYears" className={labelClass}>Leasehold years</label><input type="text" name="leaseholdYears" id="leaseholdYears" value={formData.leaseholdYears || ''} onChange={handleChange} className={inputClass} /></div><div><label htmlFor="extensionYears" className={labelClass}>Extension years</label><input type="text" name="extensionYears" id="extensionYears" value={formData.extensionYears || ''} onChange={handleChange} className={inputClass} /></div></div></>)}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label htmlFor="priceUSD" className={labelClass}>Price USD</label><input type="number" name="priceUSD" id="priceUSD" placeholder="250000" value={formData.priceUSD === undefined ? '' : formData.priceUSD} onChange={handleChange} className={inputClass} step="any" /></div>
                      <div><label htmlFor="priceIDRRaw" className={labelClass}>Price IDR</label><input type="text" name="priceIDRRaw" id="priceIDRRaw" placeholder="Rp 3,500,000,000" value={formData.priceIDRRaw || ''} onChange={handleChange} className={inputClass} /></div>
                  </div>
              </div>
            </div>

            <div className={sectionContainerClass}>
              <h4 className={sectionHeaderClass}>ROI Details</h4>
              <div className="p-3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                          <label htmlFor="percentROI" className={labelClass}>%ROI</label>
                          <input type="number" name="percentROI" id="percentROI" placeholder="e.g., 15.5" value={formData.percentROI === undefined ? '' : formData.percentROI} onChange={handleChange} className={inputClass} step="any" />
                      </div>
                      <div>
                          <label htmlFor="dollarROI" className={labelClass}>$ROI</label>
                          <input type="number" name="dollarROI" id="dollarROI" placeholder="e.g., 35000" value={formData.dollarROI === undefined ? '' : formData.dollarROI} onChange={handleChange} className={inputClass} step="any" />
                      </div>
                  </div>
                  <div>
                      <label htmlFor="roiReportLink" className={labelClass}>ROI report</label>
                      <input type="url" name="roiReportLink" id="roiReportLink" placeholder="https://link-to-report.com" value={formData.roiReportLink || ''} onChange={handleChange} className={inputClass} />
                  </div>
              </div>
            </div>

            <div className={sectionContainerClass}>
              <h4 className={sectionHeaderClass}>Media & Links</h4>
              <div className="p-3 space-y-3">
                  <div><label htmlFor="mainImageUpload" className={labelClass}>Thumbnail</label><input type="file" name="mainImageUpload" id="mainImageUpload" accept="image/*" onChange={handleFileChange} className={`${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-apple-blue/10 file:text-apple-blue dark:file:bg-apple-blue-light/20 dark:file:text-apple-blue-light hover:file:bg-apple-blue/20 dark:hover:file:bg-apple-blue-light/30`}/>
                  {imagePreviewUrl && (<div className="mt-2"><img src={imagePreviewUrl} alt="Preview" className="h-24 w-auto object-contain rounded border border-ios-gray-300 dark:border-dark-ios-gray-400" /></div>)}</div>
                  <div><label htmlFor="driveLink" className={labelClass}>Drive link</label><input type="url" name="driveLink" id="driveLink" value={formData.driveLink || ''} onChange={handleChange} className={inputClass} /></div>
                  <div><label htmlFor="webListingLink" className={labelClass}>Web link</label><input type="url" name="webListingLink" id="webListingLink" value={formData.webListingLink || ''} onChange={handleChange} className={inputClass} /></div>
              </div>
            </div>

            <div className={sectionContainerClass}>
                <h4 className={sectionHeaderClass}>Parties Involved</h4>
                <div className="p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <SearchableSelect
                            id="listingAgent"
                            name="listingAgent"
                            label="Listing agent"
                            options={agents}
                            value={formData.listingAgent || ''}
                            onChange={(value) => handleSelectChange('listingAgent', value)}
                            placeholder="Search or select an agent"
                            isLoading={isFetchingAgents}
                        />
                        <SearchableSelect
                            id="vendor"
                            name="vendor"
                            label="Vendor"
                            options={vendors}
                            value={formData.vendor || ''}
                            onChange={(value) => handleSelectChange('vendor', value)}
                            placeholder="Search or select a vendor"
                            isLoading={isFetchingVendors}
                        />
                    </div>
                </div>
            </div>

            <div className={sectionContainerClass}>
              <h4 className={sectionHeaderClass}>Additional Details</h4>
              <div className="p-3">
                  <label htmlFor="additionalDetails" className={labelClass}>Additional details</label>
                  <textarea name="additionalDetails" id="additionalDetails" value={formData.additionalDetails || ''} onChange={handleChange} rows={5} className={inputClass}></textarea>
              </div>
            </div>

            {saveError && (
              <div className="p-3 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 text-red-700 dark:text-red-300 rounded-lg text-sm">
                <strong>Error:</strong> {saveError}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 py-3 bg-ios-gray-100/80 dark:bg-dark-ios-gray-200/80 px-4 flex justify-end items-center z-10 rounded-b-xl border-t border-ios-gray-200 dark:border-dark-ios-gray-300">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="mr-2 py-2 px-4 border border-ios-gray-300 dark:border-dark-ios-gray-400 rounded-ios-button shadow-sm text-sm font-medium text-black dark:text-dark-ios-gray-800 bg-white dark:bg-dark-ios-gray-100 hover:bg-ios-gray-100 dark:hover:bg-dark-ios-gray-300 focus:outline-none focus:ring-1 focus:ring-apple-blue dark:focus:ring-apple-blue-light disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-4 border border-transparent rounded-ios-button shadow-sm text-sm font-medium text-white bg-apple-blue dark:bg-apple-blue-dark hover:bg-apple-blue/90 dark:hover:bg-apple-blue-dark/90 focus:outline-none focus:ring-1 focus:ring-apple-blue dark:focus:ring-apple-blue-light disabled:bg-apple-blue/50 dark:disabled:bg-apple-blue-dark/50 disabled:cursor-not-allowed min-w-[110px]"
            >
              {isSaving ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Villa')}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-scrollbar::-webkit-scrollbar { width: 7px; }
        .modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .modal-scrollbar::-webkit-scrollbar-thumb { background: #C7C7CC; border-radius: 10px; } /* ios-gray-400 */
        .dark .modal-scrollbar::-webkit-scrollbar-thumb { background: #48484A; } /* dark-ios-gray-400 */
        .modal-scrollbar::-webkit-scrollbar-thumb:hover { background: #AEAEB2; } /* ios-gray-500 */
        .dark .modal-scrollbar::-webkit-scrollbar-thumb:hover { background: #636366; } /* dark-ios-gray-default (darker version of 400) */
      `}</style>
    </div>
  );
};

export default VillaFormModal;
