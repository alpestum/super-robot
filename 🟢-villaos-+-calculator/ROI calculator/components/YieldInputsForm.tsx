
import React, { useState } from 'react';
import { VillaInputs, InputKeys, AdditionalCostEvent } from '../types'; // Renamed RenovationEvent
import { Input } from './ui/Input';
import { Switch } from './ui/Switch'; 
import { Card } from './ui/Card';
import { SliderInput } from './ui/SliderInput';
import { Button } from './ui/Button';
import { ChevronDownIcon, ChevronUpIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import { generateUUID } from '../utils';

interface YieldInputsFormProps {
  inputs: VillaInputs;
  onInputChange: (field: InputKeys, value: string | number | boolean | AdditionalCostEvent[]) => void;
}

const percentageTextInputs: InputKeys[] = []; 

const parsePercentageString = (str: string): number | null => {
  if (str === null || str.trim() === '') return null;
  const normalizedStr = str.replace(',', '.');
  const num = parseFloat(normalizedStr);
  return isNaN(num) ? null : num;
};

const YieldInputsForm: React.FC<YieldInputsFormProps> = ({ inputs, onInputChange }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const key = name as InputKeys;

    if (percentageTextInputs.includes(key)) {
      const displayValue = value;
      const parsedNum = parsePercentageString(displayValue);
      if (parsedNum !== null) {
        onInputChange(key, parsedNum / 100);
      } else if (displayValue.trim() === '') {
        onInputChange(key, 0);
      }
    } else if (type === 'number') {
      onInputChange(key, parseFloat(value) || 0);
    } else {
      onInputChange(key, value);
    }
  };

  const handleSliderChange = (name: string, value: number) => {
    onInputChange(name as InputKeys, value);
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    onInputChange(name as InputKeys, checked);
  };

  // --- Additional Cost Handlers ---
  const handleAddAdditionalCost = () => {
    const newCostEvent: AdditionalCostEvent = {
      id: generateUUID(),
      year: Math.min(5, inputs.leaseYears > 0 ? inputs.leaseYears : 5),
      description: '', // Default empty description
      costInputMode: 'percent', // Default to percent
      costPercentOfPropertyPrice: 0.05, // Default to 5%
      costFixedAmount: 0, // Default to 0
    };
    onInputChange('additionalCosts', [...inputs.additionalCosts, newCostEvent]);
  };

  const handleRemoveAdditionalCost = (id: string) => {
    onInputChange('additionalCosts', inputs.additionalCosts.filter(r => r.id !== id));
  };

  const handleAdditionalCostChange = (id: string, field: keyof Omit<AdditionalCostEvent, 'id'>, value: string | number) => {
    const updatedCosts = inputs.additionalCosts.map(cost => 
      cost.id === id ? { ...cost, [field]: value } : cost
    );
    onInputChange('additionalCosts', updatedCosts);
  };


  return (
    <Card title="Financial Inputs" className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Input
          label="Property Price"
          id="propertyPrice"
          name="propertyPrice"
          type="number"
          value={inputs.propertyPrice}
          onChange={handleTextInputChange}
          unit="USD"
          min="0"
          placeholder="e.g., 300000"
        />
        <Input
          label="Lease Years"
          id="leaseYears"
          name="leaseYears"
          type="number"
          value={inputs.leaseYears}
          onChange={handleTextInputChange}
          unit="Years"
          min="1"
          placeholder="e.g., 25"
        />
        <Input
          label="Daily Rate (High Season)"
          id="dailyRateHigh"
          name="dailyRateHigh"
          type="number"
          value={inputs.dailyRateHigh}
          onChange={handleTextInputChange}
          unit="USD"
          min="0"
          placeholder="e.g., 150"
        />
        <Input
          label="Daily Rate (Low Season)"
          id="dailyRateLow"
          name="dailyRateLow"
          type="number"
          value={inputs.dailyRateLow}
          onChange={handleTextInputChange}
          unit="USD"
          min="0"
          placeholder="e.g., 100"
        />
        <SliderInput
          label="Occupancy Rate (High Season)"
          id="occupancyRateHigh"
          name="occupancyRateHigh"
          value={inputs.occupancyRateHigh}
          onChange={handleSliderChange}
          min={0} max={1} step={0.001}
          isPercentageDisplay={true}
        />
        <SliderInput
          label="Occupancy Rate (Low Season)"
          id="occupancyRateLow"
          name="occupancyRateLow"
          value={inputs.occupancyRateLow}
          onChange={handleSliderChange}
          min={0} max={1} step={0.001}
          isPercentageDisplay={true}
        />
      </div>

      <h4 className="text-md font-semibold text-gray-800 mt-6 mb-2 border-t pt-4">Cost Variables (% of Revenue)</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <SliderInput
          label="Management Agency"
          id="managementFeePercent"
          name="managementFeePercent"
          value={inputs.managementFeePercent}
          onChange={handleSliderChange}
          min={0} max={0.5} step={0.001} // 0-50%
          isPercentageDisplay={true}
        />
        <SliderInput
          label="Utilities & Maintenance"
          id="utilitiesMaintenancePercent"
          name="utilitiesMaintenancePercent"
          value={inputs.utilitiesMaintenancePercent}
          onChange={handleSliderChange}
          min={0} max={0.5} step={0.001} // 0-50%
          isPercentageDisplay={true}
        />
        <SliderInput
          label="Taxes"
          id="taxesPercent"
          name="taxesPercent"
          value={inputs.taxesPercent}
          onChange={handleSliderChange}
          min={0} max={0.5} step={0.001} // 0-50%
          isPercentageDisplay={true}
        />
        <SliderInput
          label="OTA Fees"
          id="otaFeesPercent"
          name="otaFeesPercent"
          value={inputs.otaFeesPercent}
          onChange={handleSliderChange}
          min={0} max={0.5} step={0.001} // 0-50%
          isPercentageDisplay={true}
        />
      </div>
      
      <div className="border-t mt-6 pt-4">
        <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex justify-between items-center text-left text-md font-semibold text-gray-800 mb-3 focus:outline-none"
            aria-expanded={isAdvancedOpen}
            aria-controls="advanced-options-content"
        >
            Advanced Options
            {isAdvancedOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-600"/> : <ChevronDownIcon className="h-5 w-5 text-gray-600"/>}
        </button>
        {isAdvancedOpen && (
            <div id="advanced-options-content" className="space-y-4">
                {/* General Advanced Options */}
                <Switch 
                    label="Fluctuate Occupancy Randomly"
                    id="fluctuateOccupancy"
                    name="fluctuateOccupancy"
                    checked={inputs.fluctuateOccupancy}
                    onChange={handleSwitchChange}
                    description="Apply small random variations (+/-10%) to high/low season occupancy rates each year."
                />
                <Switch 
                    label="Apply Inflation"
                    id="applyInflation"
                    name="applyInflation"
                    checked={inputs.applyInflation}
                    onChange={handleSwitchChange}
                    description="Inflate daily rates annually."
                />
                {inputs.applyInflation && (
                    <SliderInput
                        label="Annual Inflation Rate"
                        id="inflationRate"
                        name="inflationRate"
                        value={inputs.inflationRate}
                        onChange={handleSliderChange}
                        min={0} max={0.2} step={0.001} 
                        isPercentageDisplay={true}
                    />
                )}
                <Switch 
                    label="Apply Growth Destabilization"
                    id="applyGrowthDestabilization"
                    name="applyGrowthDestabilization"
                    checked={inputs.applyGrowthDestabilization}
                    onChange={handleSwitchChange}
                    description="Simulate initial ramp-up and market fluctuations."
                />
                {inputs.applyGrowthDestabilization && (
                    <div className="grid grid-cols-1 gap-y-1 mt-2 pl-7 border-l-2 border-blue-100 ml-2">
                    <SliderInput
                        label="1st Year Revenue Penalty"
                        id="firstYearRevenuePenalty"
                        name="firstYearRevenuePenalty"
                        value={inputs.firstYearRevenuePenalty}
                        onChange={handleSliderChange}
                        min={0} max={0.75} step={0.001}
                        isPercentageDisplay={true}
                        disabled={!inputs.applyGrowthDestabilization}
                    />
                    <SliderInput
                        label="Annual Base Growth Trend"
                        id="annualBaseGrowthTrend"
                        name="annualBaseGrowthTrend"
                        value={inputs.annualBaseGrowthTrend}
                        onChange={handleSliderChange}
                        min={-0.1} max={0.25} step={0.001}
                        isPercentageDisplay={true}
                        disabled={!inputs.applyGrowthDestabilization}
                    />
                    <SliderInput
                        label="Max Random Fluctuation"
                        id="annualRandomFluctuationMax"
                        name="annualRandomFluctuationMax"
                        value={inputs.annualRandomFluctuationMax}
                        onChange={handleSliderChange}
                        min={0} max={0.5} step={0.001} 
                        isPercentageDisplay={true}
                        disabled={!inputs.applyGrowthDestabilization}
                    />
                    </div>
                )}

                {/* 5-Year Resale Strategy Main Toggle */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                     <Switch
                        label="Enable 5-Year Resale Strategy"
                        id="enableResaleStrategy"
                        name="enableResaleStrategy"
                        checked={inputs.enableResaleStrategy}
                        onChange={handleSwitchChange}
                        description="Calculate and display an alternative strategy: buy, rent for 5 years, then resell."
                    />
                </div>

                {inputs.enableResaleStrategy && (
                    <div className="pl-7 border-l-2 border-blue-100 ml-2 mt-2 pt-2">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">5-Year Resale Strategy Settings</h5>
                        <SliderInput
                            label="Resale Profit Multiplier"
                            id="resaleProfitMultiplier"
                            name="resaleProfitMultiplier"
                            value={inputs.resaleProfitMultiplier}
                            onChange={handleSliderChange}
                            min={1} max={20} step={0.1}
                            isPercentageDisplay={false}
                            unit="x Net Profit"
                            description="Multiple applied to Year 5 operational net profit, then adjusted by remaining lease, for resale value estimation."
                        />
                        <Switch
                            label="Apply Sale Tax on Resale (10%)"
                            id="applySaleTaxOnResale"
                            name="applySaleTaxOnResale"
                            checked={inputs.applySaleTaxOnResale}
                            onChange={handleSwitchChange}
                            description={`Applies a ${inputs.saleTaxRateOnResale*100}% tax to the gross resale value.`}
                        />
                        <Switch
                            label="Apply Agency Commission on Resale (5%)"
                            id="applyAgencyCommissionOnResale"
                            name="applyAgencyCommissionOnResale"
                            checked={inputs.applyAgencyCommissionOnResale}
                            onChange={handleSwitchChange}
                            description={`Applies a ${inputs.agencyCommissionRateOnResale*100}% commission on the gross resale value.`}
                        />
                    </div>
                )}

                {/* Additional Costs / Capital Expenditures Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <Switch
                        label="Enable Additional Costs / Capital Expenditures"
                        id="enableAdditionalCosts"
                        name="enableAdditionalCosts"
                        checked={inputs.enableAdditionalCosts}
                        onChange={handleSwitchChange}
                        description="Factor in costs for one or more major expenditures or investments during the lease period."
                    />
                </div>
                {inputs.enableAdditionalCosts && (
                    <div className="pl-7 border-l-2 border-blue-100 ml-2 mt-2 pt-2 space-y-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Cost / Expenditure Events</h5>
                        {inputs.additionalCosts.map((costEvent, index) => (
                        <div key={costEvent.id} className="p-3 border rounded-md bg-gray-50 space-y-3 relative">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-gray-800">Cost/Expenditure #{index + 1}</p>
                                <Button 
                                    onClick={() => handleRemoveAdditionalCost(costEvent.id)} 
                                    variant="danger" 
                                    size="sm" 
                                    icon={<TrashIcon className="h-4 w-4"/>} 
                                    className="!p-1.5"
                                    aria-label={`Remove cost/expenditure ${index + 1}`}
                                >
                                    <span className="sr-only">Remove</span>
                                </Button>
                            </div>
                            <Input
                                label="Description"
                                id={`costDescription-${costEvent.id}`}
                                name={`costDescription-${costEvent.id}`}
                                type="text"
                                value={costEvent.description}
                                onChange={(e) => handleAdditionalCostChange(costEvent.id, 'description', e.target.value)}
                                placeholder="e.g., Kitchen Renovation, Legal Fees"
                            />
                            <Input
                                label="Year of Cost/Expenditure"
                                id={`costYear-${costEvent.id}`}
                                name={`costYear-${costEvent.id}`}
                                type="number"
                                value={costEvent.year}
                                onChange={(e) => {
                                    const yearVal = parseInt(e.target.value) || 0;
                                    handleAdditionalCostChange(costEvent.id, 'year', Math.max(1, Math.min(yearVal, inputs.leaseYears || 1)));
                                }}
                                min="1"
                                max={inputs.leaseYears || 1}
                                disabled={!inputs.leaseYears || inputs.leaseYears <=0}
                                placeholder={`1-${inputs.leaseYears || 'X'}`}
                            />
                             <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Input Mode</label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`costInputMode-${costEvent.id}`}
                                        value="percent"
                                        checked={costEvent.costInputMode === 'percent'}
                                        onChange={() => handleAdditionalCostChange(costEvent.id, 'costInputMode', 'percent')}
                                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                    />
                                    <span className="text-sm text-gray-700">% of Property Price</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`costInputMode-${costEvent.id}`}
                                        value="fixed"
                                        checked={costEvent.costInputMode === 'fixed'}
                                        onChange={() => handleAdditionalCostChange(costEvent.id, 'costInputMode', 'fixed')}
                                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                    />
                                    <span className="text-sm text-gray-700">Fixed USD Amount</span>
                                    </label>
                                </div>
                            </div>

                            {costEvent.costInputMode === 'percent' ? (
                                <SliderInput
                                label="Cost (% of Property Price)"
                                id={`costPercent-${costEvent.id}`}
                                name={`costPercent-${costEvent.id}`}
                                value={costEvent.costPercentOfPropertyPrice}
                                onChange={(_name, val) => handleAdditionalCostChange(costEvent.id, 'costPercentOfPropertyPrice', val)}
                                min={0} max={1} step={0.001} // 0-100%
                                isPercentageDisplay={true}
                                description="Cost as a percentage of the total property price."
                                disabled={inputs.propertyPrice <= 0}
                                />
                            ) : (
                                <Input
                                label="Cost (Fixed USD Amount)"
                                id={`costFixed-${costEvent.id}`}
                                name={`costFixed-${costEvent.id}`}
                                type="number"
                                value={costEvent.costFixedAmount}
                                onChange={(e) => handleAdditionalCostChange(costEvent.id, 'costFixedAmount', parseFloat(e.target.value) || 0)}
                                unit="USD"
                                min="0"
                                placeholder="e.g., 5000"
                                />
                            )}
                             {costEvent.costInputMode === 'percent' && inputs.propertyPrice <= 0 && <p className="text-xs text-red-500">Property price must be > 0 to use percentage cost.</p>}
                        </div>
                        ))}
                        <Button 
                            onClick={handleAddAdditionalCost} 
                            variant="outline" 
                            size="sm" 
                            icon={<PlusCircleIcon className="h-4 w-4 mr-1"/>}
                            disabled={!inputs.leaseYears || inputs.leaseYears <=0 }
                        >
                            Add Cost/Expenditure Event
                        </Button>
                        {inputs.additionalCosts.length === 0 && <p className="text-xs text-gray-500">No cost/expenditure events added yet.</p>}
                         {(!inputs.leaseYears || inputs.leaseYears <=0 ) && <p className="text-xs text-red-500">Please set a valid Lease Years value to add costs/expenditures.</p>}
                    </div>
                )}
            </div>
        )}
      </div>
    </Card>
  );
};

export default YieldInputsForm;