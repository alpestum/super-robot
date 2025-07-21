
import React, { useState, useEffect, useCallback } from 'react';
import ListingsPage from './pages/ListingsPage';
import VillaDetailPage from './pages/VillaDetailPage';
import Spinner from './components/Spinner';
import { Villa } from './types';
import { fetchVillas, saveVilla } from './services/villaService';
import { VILLA_API_URL } from './constants';
import VillaFormModal from './components/VillaFormModal';
import ROICalculatorApp from './roi-calculator/App';
import Navbar from './components/Navbar';

const App: React.FC = () => {
    const [allVillas, setAllVillas] = useState<Villa[]>([]);
    const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
    const [isLoadingVillas, setIsLoadingVillas] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
    const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
    const [isSavingVilla, setIsSavingVilla] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State for ROI Calculator modal
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [villaForCalculator, setVillaForCalculator] = useState<Villa | null>(null);

    const displaySuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000); 
    };

    const loadVillas = useCallback(async (forceRefresh: boolean = false) => {
        setIsLoadingVillas(true);
        setError(null);
        try {
            const villasData = await fetchVillas(VILLA_API_URL, forceRefresh);
            const sortedVillas = villasData.sort((a, b) => (b.parsedDateListed?.getTime() ?? 0) - (a.parsedDateListed?.getTime() ?? 0));
            setAllVillas(sortedVillas);
        } catch (err) {
            const errorMessage = err instanceof Error ? `Failed to fetch villas: ${err.message}.` : 'Failed to fetch villas. Please try again later.';
            setError(errorMessage);
        } finally {
            setIsLoadingVillas(false);
        }
    }, []);

    useEffect(() => { loadVillas(); }, [loadVillas]);

    const handleSelectVilla = (villa: Villa) => {
        setSelectedVilla(villa);
        window.scrollTo(0, 0);
    };

    const handleBackToListings = () => {
        setSelectedVilla(null);
    };

    const handleOpenFormModal = useCallback((villaToEdit: Villa | null = null) => {
        setEditingVilla(villaToEdit);
        setIsFormModalOpen(true);
        setSaveError(null); 
    }, []);

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingVilla(null);
    };

    const handleEditFromDetails = (villa: Villa) => {
        handleOpenFormModal(villa);
    };

    const handleFormSubmit = async (villaData: Partial<Villa>) => {
        setIsSavingVilla(true);
        setSaveError(null);
        try {
            const actionType = villaData.id && allVillas.some(v => v.id === villaData.id) ? 'updated' : 'added';
            await saveVilla(villaData);
            handleCloseFormModal();
            await loadVillas(true);
            displaySuccessMessage(`Villa ${actionType} successfully!`);
            
            if (selectedVilla && selectedVilla.id === villaData.id) {
                const updatedVillas = await fetchVillas(VILLA_API_URL, true);
                const freshlyUpdatedVilla = updatedVillas.find(v => v.id === villaData.id);
                if (freshlyUpdatedVilla) {
                    setSelectedVilla(freshlyUpdatedVilla);
                } else {
                    handleBackToListings();
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while saving the villa.';
            setSaveError(errorMessage);
        } finally {
            setIsSavingVilla(false);
        }
    };
    
    const handleOpenCalculator = (villa: Villa) => {
        setVillaForCalculator(villa);
        setIsCalculatorOpen(true);
    };

    const handleCloseCalculator = () => {
        setIsCalculatorOpen(false);
        setTimeout(() => setVillaForCalculator(null), 300); // Delay clear to allow for animation
    };

    const renderPageContent = () => {
        if (selectedVilla) {
            return (
                <VillaDetailPage 
                    villa={selectedVilla} 
                    allVillas={allVillas}
                    onEdit={handleEditFromDetails}
                    onVillaSelect={handleSelectVilla}
                    onBack={handleBackToListings}
                    onNavigateToCalculator={handleOpenCalculator}
                />
            );
        }

        return (
            <ListingsPage 
                allVillas={allVillas}
                onVillaSelect={handleSelectVilla}
                isLoading={isLoadingVillas}
                onRefresh={() => loadVillas(true)}
                onAddVilla={() => handleOpenFormModal(null)}
                successMessage={successMessage}
            />
        );
    };
    
    if (isLoadingVillas && allVillas.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner text="Loading Villa Data..." size="large" />
            </div>
        );
    }
    
    if (error && allVillas.length === 0) {
       return (
         <div className="flex items-center justify-center min-h-screen p-4">
             <div className="text-center text-red-600 dark:text-red-400 bg-red-500/10 p-6 rounded-lg shadow-lg">
                <p className="font-semibold text-lg">Error Loading Villas</p>
                <p className="text-sm mt-2">{error}</p>
                <button onClick={() => loadVillas(true)} className="mt-4 px-4 py-2 bg-apple-blue text-white rounded-md">Retry</button>
            </div>
         </div>
       );
    }

    return (
        <>
            <Navbar onHomeClick={handleBackToListings} />
            <main className="pt-16">
                {renderPageContent()}
            </main>
            {isFormModalOpen && (
                <VillaFormModal
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    onSubmit={handleFormSubmit}
                    initialData={editingVilla}
                    isSaving={isSavingVilla}
                    saveError={saveError}
                />
            )}
            {isCalculatorOpen && villaForCalculator && (
                 <div className="fixed inset-0 bg-ios-gray-100 dark:bg-dark-ios-gray-100 z-50 overflow-y-auto">
                    <ROICalculatorApp 
                        key={villaForCalculator.id} // Re-mount component when villa changes
                        villa={villaForCalculator}
                        onClose={handleCloseCalculator}
                    />
                 </div>
            )}
        </>
    );
};

export default App;
