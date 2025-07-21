
import React, { useState, useEffect, useCallback } from 'react';
import { VillaInputs, CalculatedData, InputKeys, AdditionalCostEvent } from './types';
import { DEFAULT_INPUTS } from './constants'; 
import useYieldCalculator from './hooks/useYieldCalculator';
import VillaInfoForm from './components/VillaInfoForm';
import YieldInputsForm from './components/YieldInputsForm';
import ReportView from './components/ReportView';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { ArrowPathIcon, DocumentArrowDownIcon, TrashIcon, XMarkIcon, ChartBarIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const formatDisplayVillaTitle = (villa: any): string => {
    const { bedrooms, propertyType, district, districtArea, name } = villa;
    if (name && name !== 'Unnamed Villa' && !name.startsWith('Villa Ref') && name.length > 5) return name;
  
    const locationPart = districtArea || district || 'Location N/A';
    let title = `${bedrooms}BR`;
    if (propertyType && propertyType.toLowerCase() !== 'n/a' && propertyType.trim() !== '') {
      title += ` ${propertyType}`;
    }
    title += ` in ${locationPart}`;
    return title.replace(/\s-\s*$/, '').trim(); 
};

interface ROICalculatorAppProps {
    villa: any;
    onClose: () => void;
}

const ROICalculatorApp: React.FC<ROICalculatorAppProps> = ({ villa, onClose }) => {
  const createInitialInputs = useCallback((villaData: any) => {
      const leaseYears = parseInt(String(villaData.leaseholdYears || '0'), 10) || 0;
      return {
          ...DEFAULT_INPUTS,
          propertyPrice: villaData.price || 0,
          leaseYears: leaseYears,
          title: formatDisplayVillaTitle(villaData),
          description: `ROI Analysis for ${formatDisplayVillaTitle(villaData)}`,
          imageUrl: villaData.image_url || '',
      };
  }, []);

  const [inputs, setInputs] = useState<VillaInputs>(() => createInitialInputs(villa));
  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'inputs' | 'results'>('inputs');

  useEffect(() => {
    if (currentPage === 'results') {
      document.body.classList.add('report-active');
      window.scrollTo(0, 0); 
    } else {
      document.body.classList.remove('report-active');
    }
    return () => document.body.classList.remove('report-active');
  }, [currentPage]);

  const calculateYield = useYieldCalculator();

  const handleInputChange = (field: InputKeys, value: string | number | boolean | AdditionalCostEvent[]) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const performCalculation = (regenerateRandomSequence: boolean) => {
    setIsLoading(true);
    return new Promise<CalculatedData | null>((resolve) => {
      setTimeout(() => {
        const results = calculateYield(inputs, { regenerateRandomSequence });
        setCalculatedData(results);
        setIsLoading(false);
        resolve(results);
      }, 50);
    });
  };
  
  const handleCalculateAndNavigate = async () => {
    const results = await performCalculation(true); 
    if (results) {
      setCurrentPage('results');
    } else {
      alert("Could not calculate results. Please check your inputs (e.g., ensure Lease Years > 0 and Property Price > 0) or try again.");
    }
  };

  const handleReRollCalculation = async () => {
    await performCalculation(true); 
  };

  const handleClearFinancialInputs = () => {
    if (window.confirm("Are you sure you want to reset all financial inputs and advanced options? Villa information will be reset to the initially loaded villa data.")) {
      setInputs(createInitialInputs(villa));
      setCalculatedData(null);
      setCurrentPage('inputs'); 
    }
  };

  const handleDownloadPdfReport = async () => {
    if (!calculatedData || !inputs) {
        alert("Please calculate the yield first to generate a report.");
        return;
    }
    setIsDownloadingPdf(true);

    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    if (!jsPDF || !html2canvas) {
        alert("PDF generation libraries not loaded. Please check your internet connection or try again later.");
        setIsDownloadingPdf(false);
        return;
    }

    const reportPages = document.querySelectorAll<HTMLElement>('.report-view-container .report-container > .report-page');
    if (reportPages.length === 0) {
        alert("Could not find report content to generate PDF.");
        setIsDownloadingPdf(false);
        return;
    }

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const MARGIN_X = 15;
    const MARGIN_Y = 10;
    const contentWidth = A4_WIDTH_MM - MARGIN_X * 2;
    const contentHeight = A4_HEIGHT_MM - MARGIN_Y * 2;

    try {
        for (let i = 0; i < reportPages.length; i++) {
            const pageElement = reportPages[i];
            
            const originalWidth = pageElement.style.width;
            pageElement.style.width = '210mm';

            const canvas = await html2canvas(pageElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });
            
            pageElement.style.width = originalWidth;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
            const ratio = imgWidth / imgHeight;

            let pdfImgWidth = contentWidth;
            let pdfImgHeight = contentWidth / ratio;
            
            if (pdfImgHeight > contentHeight) {
                pdfImgHeight = contentHeight;
                pdfImgWidth = contentHeight * ratio;
            }

            if (i > 0) {
                pdf.addPage();
            }
            
            const x = (A4_WIDTH_MM - pdfImgWidth) / 2;
            const y = (A4_HEIGHT_MM - pdfImgHeight) / 2;

            pdf.addImage(imgData, 'JPEG', x, y, pdfImgWidth, pdfImgHeight);
        }

        const safeTitle = (inputs.title || 'villa_yield_report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`${safeTitle}.pdf`);

    } catch (error) {
        console.error("Error during PDF generation:", error);
        alert("An error occurred while generating the PDF. Please see console for details.");
    } finally {
        setIsDownloadingPdf(false);
    }
};

  return (
    <div className={`min-h-screen flex flex-col ${currentPage === 'results' ? '' : 'bg-ios-gray-100 dark:bg-dark-ios-gray-100'}`}>
      <header className="sticky top-0 bg-white/90 dark:bg-dark-ios-gray-200/90 backdrop-blur-lg z-30 border-b border-ios-gray-200 dark:border-dark-ios-gray-300 p-4 flex justify-between items-center no-print">
          <h2 className="text-xl font-semibold text-black dark:text-dark-ios-gray-800">ROI Calculator</h2>
          <Button onClick={onClose} variant="secondary" size="md" icon={<XMarkIcon className="h-5 w-5" />}>Close</Button>
      </header>
      
      <main className="flex-grow w-full"> 
        {currentPage === 'inputs' && (
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl mx-auto"> 
              
              <VillaInfoForm inputs={inputs} onInputChange={handleInputChange} />
              <YieldInputsForm inputs={inputs} onInputChange={handleInputChange} />
              
              <div className="mt-8 space-y-3 pb-4">
                <Button onClick={handleCalculateAndNavigate} isLoading={isLoading} variant="primary" size="lg" icon={<ChartBarIcon className="h-5 w-5" />} className="w-full">
                  {isLoading ? 'Calculating...' : 'Calculate & View Results'}
                </Button>
                <Button onClick={handleClearFinancialInputs} variant="outline" size="md" icon={<TrashIcon className="h-5 w-5" />} className="w-full text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700" disabled={isDownloadingPdf || isLoading}>
                  Reset All Inputs
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'results' && (
          <div className="w-full">
            {calculatedData ? <ReportView data={calculatedData} inputs={inputs} /> : (
              <div className="text-center py-10">
                <Card><p>Something went wrong. No results to display.</p></Card>
              </div>
            )}
          </div>
        )}
      </main>

      {currentPage === 'results' && calculatedData && (
        <>
        <div className="fixed top-20 left-4 sm:left-6 z-40 no-print">
            <Button
              onClick={() => setCurrentPage('inputs')}
              variant="secondary"
              size="md"
              icon={<PencilSquareIcon className="h-5 w-5" />}
              aria-label="Edit Inputs"
              title="Edit Inputs"
              className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-xl rounded-lg"
            >
              Edit Inputs
            </Button>
          </div>
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-row items-center space-x-3 no-print">
          <Button onClick={handleReRollCalculation} isLoading={isLoading && !!calculatedData} variant="secondary" size="md" icon={<ArrowPathIcon className="h-5 w-5" />} title="Re-roll Calculations" className="bg-yellow-400 hover:bg-yellow-500 text-black border border-yellow-500 shadow-xl rounded-lg">
            Re-roll
          </Button>
          <Button onClick={handleDownloadPdfReport} disabled={isLoading || isDownloadingPdf} isLoading={isDownloadingPdf} variant="primary" size="md" icon={<DocumentArrowDownIcon className="h-5 w-5" />} title="Download PDF Report" className="shadow-xl rounded-lg">
            Download PDF
          </Button>
        </div>
        </>
      )}
      
      <footer className={`py-4 text-center text-xs text-gray-500 no-print border-t border-gray-200 ${currentPage === 'results' ? 'bg-white' : 'bg-gray-50'}`}>
        &copy; {new Date().getFullYear()}. All calculations are estimates. 
      </footer>
    </div>
  );
};

export default ROICalculatorApp;