
import React, { useState, useEffect, useCallback } from 'react';
import { VillaInputs, CalculatedData, InputKeys, SavedScenario, AdditionalCostEvent } from './types'; // Renamed RenovationEvent
import { DEFAULT_INPUTS, LOCAL_STORAGE_KEY, SAVED_SCENARIOS_KEY } from './constants'; 
import useLocalStorage from './hooks/useLocalStorage';
import useYieldCalculator from './hooks/useYieldCalculator';
import VillaInfoForm from './components/VillaInfoForm';
import YieldInputsForm from './components/YieldInputsForm';
import ReportView from './components/ReportView';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { ArrowPathIcon, DocumentArrowDownIcon, TrashIcon, PencilSquareIcon, ChartBarIcon, ChevronLeftIcon, ArchiveBoxIcon, FolderOpenIcon, XCircleIcon, PlusCircleIcon, CogIcon } from '@heroicons/react/24/outline';
import { ManageScenariosModal } from './components/modals/ManageScenariosModal';
import { generateUUID, formatDate } from './utils';

const App: React.FC = () => {
  const [inputs, setInputs] = useLocalStorage<VillaInputs>(LOCAL_STORAGE_KEY, DEFAULT_INPUTS);
  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'inputs' | 'results'>('inputs');

  const [savedScenarios, setSavedScenarios] = useLocalStorage<SavedScenario[]>(SAVED_SCENARIOS_KEY, []);
  const [activeScenario, setActiveScenario] = useState<SavedScenario | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  useEffect(() => {
    // This effect ensures that the latest data from localStorage is loaded when the component mounts.
    // This is especially important when navigating from the villa list, which pre-populates the data.
    const initialData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (initialData) {
      try {
        const parsedData = JSON.parse(initialData);
        setInputs(parsedData);
      } catch (e) {
        console.error("Error parsing initial data from localStorage:", e);
        // Clear corrupt data
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []); // Run only on component mount

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
    if (window.confirm("Are you sure you want to clear all financial inputs and advanced options, and close any active scenario? Villa information (title, description, image) will remain unchanged.")) {
      const { title, description, imageUrl } = inputs; // Preserve villa info
      setInputs({
        ...DEFAULT_INPUTS,
        title,
        description,
        imageUrl,
      });
      setCalculatedData(null);
      setActiveScenario(null); // Close active scenario
      setCurrentPage('inputs'); 
    }
  };

  // --- Scenario Management Functions ---
  const saveScenario = useCallback((name: string, scenarioInputs: VillaInputs): SavedScenario => {
    const now = new Date().toISOString();
    const newScenario: SavedScenario = {
      id: generateUUID(),
      name,
      inputs: JSON.parse(JSON.stringify(scenarioInputs)), // Deep copy
      createdAt: now,
      updatedAt: now,
    };
    setSavedScenarios(prev => [...prev, newScenario]);
    return newScenario;
  }, [setSavedScenarios]);

  const updateScenario = useCallback((id: string, updatedInputs: VillaInputs) => {
    const now = new Date().toISOString();
    let updatedScenario: SavedScenario | null = null;
    setSavedScenarios(prev =>
      prev.map(sc => {
        if (sc.id === id) {
          updatedScenario = { ...sc, inputs: JSON.parse(JSON.stringify(updatedInputs)), updatedAt: now };
          return updatedScenario;
        }
        return sc;
      })
    );
    if (updatedScenario) {
      setActiveScenario(updatedScenario); // Keep active scenario in sync
    }
  }, [setSavedScenarios]);

  const handleSaveCurrentAsNew = () => {
    const name = window.prompt("Enter a name for this new scenario:", activeScenario?.name ? `${activeScenario.name} (Copy)` : "New Scenario");
    if (name && name.trim()) {
      const newScenario = saveScenario(name.trim(), inputs);
      setActiveScenario(newScenario);
      alert(`Scenario "${newScenario.name}" saved successfully!`);
    }
  };
  
  const handleSaveActiveScenarioChanges = () => {
    if (activeScenario) {
      updateScenario(activeScenario.id, inputs);
      alert(`Changes to scenario "${activeScenario.name}" saved successfully!`);
    }
  };

  const handleLoadScenario = (id: string) => {
    const scenarioToLoad = savedScenarios.find(sc => sc.id === id);
    if (scenarioToLoad) {
      setInputs(JSON.parse(JSON.stringify(scenarioToLoad.inputs))); // Deep copy
      setActiveScenario(scenarioToLoad);
      setCalculatedData(null); // Clear previous results
      setIsManageModalOpen(false);
      setCurrentPage('inputs'); // Ensure user is on input page
      alert(`Scenario "${scenarioToLoad.name}" loaded.`);
    }
  };

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios(prev => prev.filter(sc => sc.id !== id));
    if (activeScenario && activeScenario.id === id) {
      setActiveScenario(null); // Clear active if it was deleted
       // Optionally, reset inputs to default or prompt user
      setInputs(prevInputs => ({
        ...DEFAULT_INPUTS,
        title: prevInputs.title,
        description: prevInputs.description,
        imageUrl: prevInputs.imageUrl,
      }));
    }
    alert("Scenario deleted.");
  };

  const handleRenameScenario = (id:string, newName: string) => {
    let scenarioNameForAlert = "";
    setSavedScenarios(prev => prev.map(sc => {
      if (sc.id === id) {
        scenarioNameForAlert = sc.name;
        const updatedSc = { ...sc, name: newName, updatedAt: new Date().toISOString() };
        if (activeScenario && activeScenario.id === id) {
          setActiveScenario(updatedSc);
        }
        return updatedSc;
      }
      return sc;
    }));
    alert(`Scenario "${scenarioNameForAlert}" renamed to "${newName}".`);
  };

  const handleCloseActiveScenario = () => {
    if (window.confirm("Are you sure you want to close the current scenario and start a new unsaved one? Any unsaved changes to the current scenario will be lost unless you 'Save Changes' first.")) {
        const { title, description, imageUrl } = inputs; // Preserve villa info
        setActiveScenario(null);
        setInputs({
            ...DEFAULT_INPUTS,
            title,
            description,
            imageUrl,
        });
        setCalculatedData(null);
        alert("Scenario closed. Working on a new unsaved scenario.");
    }
  };


  const handleDownloadPdfReport = () => {
    if (!calculatedData || !inputs) {
      alert("Please calculate the yield first to generate a report.");
      return;
    }
    setIsDownloadingPdf(true);

    setTimeout(() => {
        const html2pdf = (window as any).html2pdf;
        if (!html2pdf) {
            alert("PDF generation library (html2pdf) not loaded. Please check your internet connection or try again later.");
            setIsDownloadingPdf(false);
            return;
        }

        const reportElement = document.querySelector('.report-view-container .report-container');
        if (!reportElement) {
            console.error("Report container element not found in DOM for PDF generation.");
            alert("Could not find report content to generate PDF. Please ensure the report is visible.");
            setIsDownloadingPdf(false);
            return;
        }
        
        // Temporarily remove box-shadow for cleaner PDF pages
        const pageElements = reportElement.querySelectorAll('.report-page');
        pageElements.forEach(el => (el as HTMLElement).style.boxShadow = 'none');

        const safeTitle = (activeScenario?.name || inputs.title || 'villa_scenario').replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const opt = {
          margin: 0,
          filename: `${safeTitle}_yield_report.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff',
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], before: '.report-page' }
        };

        html2pdf().from(reportElement).set(opt).save().then(() => {
            pageElements.forEach(el => (el as HTMLElement).style.boxShadow = '');
            setIsDownloadingPdf(false);
        }).catch((err: any) => {
            pageElements.forEach(el => (el as HTMLElement).style.boxShadow = '');
            console.error("Error during PDF generation:", err);
            setIsDownloadingPdf(false);
            alert("An error occurred while generating the PDF. Please see console for details.");
        });
    }, 200);
  };

  return (
    <div className={`min-h-screen flex flex-col ${currentPage === 'results' ? '' : 'bg-gray-50'}`}>
      <main className="flex-grow w-full"> 
        {currentPage === 'inputs' && (
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl mx-auto"> 
              
              <Card title="Scenario Management" className="mb-6 bg-blue-50 border border-blue-200">
                {activeScenario ? (
                  <div>
                    <p className="text-sm text-blue-800 mb-1">
                      Currently editing: <strong className="font-semibold">{activeScenario.name}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mb-3">Last saved: {formatDate(activeScenario.updatedAt)}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                      <Button onClick={handleSaveActiveScenarioChanges} variant="primary" size="sm" icon={<ArchiveBoxIcon className="h-4 w-4"/>}>Save Changes</Button>
                      <Button onClick={handleSaveCurrentAsNew} variant="outline" size="sm" icon={<PlusCircleIcon className="h-4 w-4"/>}>Save as New Copy</Button>
                      <Button onClick={handleCloseActiveScenario} variant="outline" size="sm" icon={<XCircleIcon className="h-4 w-4"/>} className="text-red-600 border-red-500 hover:bg-red-50">Close Scenario</Button>
                       <Button onClick={() => setIsManageModalOpen(true)} variant="outline" size="sm" icon={<CogIcon className="h-4 w-4"/>}>Manage All</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 mb-3">You are working on an unsaved scenario.</p>
                    <div className="flex space-x-2">
                       <Button onClick={handleSaveCurrentAsNew} variant="primary" size="sm" icon={<ArchiveBoxIcon className="h-4 w-4"/>}>Save Current Scenario</Button>
                       <Button onClick={() => setIsManageModalOpen(true)} variant="outline" size="sm" icon={<FolderOpenIcon className="h-4 w-4"/>}>Load / Manage Scenarios</Button>
                    </div>
                  </div>
                )}
              </Card>

              <VillaInfoForm inputs={inputs} onInputChange={handleInputChange} />
              <YieldInputsForm inputs={inputs} onInputChange={handleInputChange} />
              
              <div className="mt-8 space-y-3 pb-4">
                <Button
                  onClick={handleCalculateAndNavigate}
                  isLoading={isLoading}
                  variant="primary"
                  size="lg"
                  icon={<ChartBarIcon className="h-5 w-5" />}
                  className="w-full"
                  aria-label="Calculate and View Results"
                >
                  {isLoading ? 'Calculating...' : 'Calculate & View Results'}
                </Button>
                <Button
                  onClick={handleClearFinancialInputs}
                  variant="outline"
                  size="md"
                  icon={<TrashIcon className="h-5 w-5" />}
                  className="w-full text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700"
                  disabled={isDownloadingPdf || isLoading}
                  aria-label="Clear Financial Inputs & Close Scenario"
                >
                  Clear Financial Inputs & Close Scenario
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'results' && (
          <div className="w-full">
            {isLoading && !calculatedData ? (
                 <Card title="Results Dashboard" className="h-full">
                    <div className="flex flex-col justify-center items-center h-full min-h-[400px] text-gray-500">
                        <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-lg">Loading results...</p>
                    </div>
                 </Card>
            ) : calculatedData ? (
              <>
                <ReportView data={calculatedData} inputs={inputs} isPrinting={isDownloadingPdf} />
              </>
            ) : (
              <div className="text-center py-10">
                <Card>
                    <p className="text-gray-600 text-lg mb-4">No results to display.</p>
                    <p className="text-gray-500 text-sm mb-6">Please go back to the inputs page and calculate projections to see the dashboard.</p>
                    <Button onClick={() => setCurrentPage('inputs')} variant="primary" size="lg" icon={<PencilSquareIcon className="h-5 w-5"/>}>
                        Go to Inputs
                    </Button>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Buttons for Results Page */}
      {currentPage === 'results' && calculatedData && (
        <>
          {/* Edit Inputs Button - Top Left */}
          <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-40 no-print">
            <Button
              onClick={() => setCurrentPage('inputs')}
              variant="secondary"
              size="md"
              icon={<ChevronLeftIcon className="h-5 w-5" />}
              aria-label={activeScenario ? `Edit "${activeScenario.name}"` : "Edit Inputs"}
              title={activeScenario ? `Edit "${activeScenario.name}"` : "Edit Inputs"}
              className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-xl rounded-lg"
            >
              Edit Inputs
            </Button>
          </div>

          {/* Re-roll and Download PDF Buttons - Bottom Right */}
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-row items-center space-x-3 no-print">
            <Button
              onClick={handleReRollCalculation}
              isLoading={isLoading && !!calculatedData}
              variant="secondary" // Keep base style but override with custom classes
              size="md"
              icon={<ArrowPathIcon className="h-5 w-5" />}
              aria-label="Re-roll Calculations"
              title="Re-roll Calculations"
              className="bg-yellow-400 hover:bg-yellow-500 text-black border border-yellow-500 shadow-xl rounded-lg"
            >
              Re-roll
            </Button>
            <Button
              onClick={handleDownloadPdfReport}
              disabled={isLoading || isDownloadingPdf}
              isLoading={isDownloadingPdf}
              variant="primary"
              size="md"
              icon={<DocumentArrowDownIcon className="h-5 w-5" />}
              aria-label="Download PDF Report"
              title="Download PDF Report"
              className="shadow-xl rounded-lg"
            >
              Download PDF
            </Button>
          </div>
        </>
      )}
      
      <ManageScenariosModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        scenarios={savedScenarios}
        onLoadScenario={handleLoadScenario}
        onDeleteScenario={handleDeleteScenario}
        onRenameScenario={handleRenameScenario}
      />

      <footer className={`py-4 text-center text-xs text-gray-500 no-print border-t border-gray-200 ${currentPage === 'results' ? 'bg-white' : 'bg-gray-50'}`}>
        &copy; {new Date().getFullYear()}. All calculations are estimates. 
      </footer>
    </div>
  );
};

export default App;
