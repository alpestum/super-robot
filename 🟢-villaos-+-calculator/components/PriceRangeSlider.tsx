


import React, { useCallback, useEffect, useState, useRef } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  step?: number;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step = 1000,
}) => {
  const [currentMinVal, setCurrentMinVal] = useState(minValue);
  const [currentMaxVal, setCurrentMaxVal] = useState(maxValue);

  const range = useRef<HTMLDivElement>(null);

  const getPercent = useCallback((value: number) => {
    const denominator = max - min;
    if (denominator <= 0) return 0;
    return Math.round(((value - min) / denominator) * 100);
  }, [min, max]);

  useEffect(() => {
    setCurrentMinVal(minValue);
  }, [minValue]);

  useEffect(() => {
    setCurrentMaxVal(maxValue);
  }, [maxValue]);

  useEffect(() => {
    if (range.current) {
        const minPercent = getPercent(currentMinVal);
        const maxPercent = getPercent(currentMaxVal);
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [currentMinVal, currentMaxVal, getPercent]);


  const handleMinInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(+event.target.value, currentMaxVal - step);
    setCurrentMinVal(value);
    onMinChange(value);
  };
  
  const handleMaxInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(+event.target.value, currentMinVal + step);
    setCurrentMaxVal(value);
    onMaxChange(value);
  };


  return (
    <div className="py-2">
        <div className="relative h-6 flex items-center">
            <input
              type="range"
              min={min}
              max={max}
              value={currentMinVal}
              step={step}
              onChange={handleMinInputChange}
              className="thumb thumb--zindex-3"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={min}
              max={max}
              value={currentMaxVal}
              step={step}
              onChange={handleMaxInputChange}
              className="thumb thumb--zindex-4"
              aria-label="Maximum price"
            />

            <div className="relative w-full">
                <div className="absolute w-full rounded-full h-6 bg-ios-gray-200 dark:bg-dark-ios-gray-400 z-[1] top-1/2 transform -translate-y-1/2"></div>
                <div ref={range} className="absolute rounded-full h-6 bg-apple-blue dark:bg-apple-blue-light z-[2] top-1/2 transform -translate-y-1/2"></div>
            </div>
        </div>
        <style>{`
            .thumb {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                width: 100%;
                height: 1.5rem; /* 24px, matches track height */
                outline: none;
                position: absolute;
                margin: auto;
                top: 0;
                bottom: 0;
                background-color: transparent;
                pointer-events: none;
            }
            .thumb::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 1.5rem; /* 24px */
                height: 1.5rem; /* 24px */
                background-color: #FFFFFF; 
                border-radius: 50%;
                border: 1px solid #E5E5EA; /* ios-gray-200 */
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                cursor: pointer;
                pointer-events: auto;
            }
            .thumb::-moz-range-thumb {
                -moz-appearance: none;
                appearance: none;
                width: 1.5rem;
                height: 1.5rem;
                background-color: #FFFFFF;
                border-radius: 50%;
                border: 1px solid #E5E5EA;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                cursor: pointer;
                pointer-events: auto;
            }
            .dark .thumb::-webkit-slider-thumb {
                background-color: #D1D1D6; /* dark-ios-gray-700 (lighter gray for thumb on dark) */
                border-color: #48484A; /* dark-ios-gray-400 */
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            .dark .thumb::-moz-range-thumb {
                background-color: #D1D1D6;
                border-color: #48484A;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            .thumb--zindex-3 { z-index: 3; }
            .thumb--zindex-4 { z-index: 4; }
        `}</style>

      <div className="flex justify-between items-center mt-2 text-xs text-ios-gray-600 dark:text-dark-ios-gray-600">
        <span>${currentMinVal.toLocaleString()}</span>
        <span>
            ${currentMaxVal.toLocaleString()}{currentMaxVal >= max ? '+' : ''}
        </span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;