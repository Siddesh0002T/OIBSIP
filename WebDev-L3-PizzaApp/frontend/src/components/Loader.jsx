import React from 'react';
import { Pizza } from 'lucide-react';

export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Pizza className="w-12 h-12 text-pizza-red animate-spin" />
      <p className="mt-4 text-pizza-dark font-medium animate-pulse">Baking something delicious...</p>
    </div>
  );
};
