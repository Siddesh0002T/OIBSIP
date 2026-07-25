import React from 'react';
import { Clock, ChefHat, Bike, CheckCircle } from 'lucide-react';

const statuses = [
  { label: 'Order Received', icon: Clock },
  { label: 'In Kitchen', icon: ChefHat },
  { label: 'Sent to Delivery', icon: Bike },
  { label: 'Delivered', icon: CheckCircle }
];

export const OrderStatusTracker = ({ currentStatus }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="w-full py-6 text-center text-red-600 font-bold flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2 text-red-600">
          <span className="text-3xl">✖</span>
        </div>
        Order Cancelled
      </div>
    );
  }

  const currentIndex = statuses.findIndex(s => s.label === currentStatus);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -mt-1 w-full h-2 bg-gray-200 z-0 rounded-full" />
        <div 
          className="absolute left-0 top-1/2 -mt-1 h-2 bg-pizza-green z-0 rounded-full transition-all duration-500" 
          style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
        />
        
        {statuses.map((status, index) => {
          const Icon = status.icon;
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={status.label} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-pizza-green border-white text-white shadow-md transform scale-110' 
                    : 'bg-gray-100 border-white text-gray-400'
                } ${isActive ? 'animate-pulse' : ''}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <p className={`mt-2 text-xs sm:text-sm font-bold absolute top-14 whitespace-nowrap ${isCompleted ? 'text-pizza-green' : 'text-gray-400'}`}>
                {status.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
