import React from 'react';
import { Check } from 'lucide-react';

export const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > index;
        const isActive = currentStep === index;
        
        return (
          <div key={step} className="flex flex-col items-center relative flex-1">
            {index !== 0 && (
              <div className={`absolute top-1/2 left-0 w-full h-1 -mt-[2px] -ml-[50%] z-0 ${
                isCompleted ? 'bg-pizza-red' : 'bg-gray-200'
              }`} />
            )}
            
            <div 
              className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                isCompleted 
                  ? 'bg-pizza-red border-pizza-red text-white' 
                  : isActive 
                    ? 'bg-white border-pizza-red text-pizza-red' 
                    : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {isCompleted ? <Check className="w-6 h-6" /> : <span className="font-bold">{index + 1}</span>}
            </div>
            
            <div className="mt-2 text-xs sm:text-sm font-medium text-center">
              <span className={isActive ? 'text-pizza-red' : 'text-gray-500'}>{step}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
