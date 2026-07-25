import { Loader2, Check } from 'lucide-react';

export const Button = ({ children, variant = 'primary', className = '', isLoading, isSuccess, disabled, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-pizza-red text-white hover:bg-red-700 hover:shadow-md",
    secondary: "bg-pizza-yellow text-white hover:bg-orange-500 hover:shadow-md",
    outline: "border-2 border-pizza-red text-pizza-red hover:bg-red-50",
    ghost: "text-gray-600 hover:bg-gray-100 shadow-none"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading || isSuccess}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {isSuccess && <Check className="w-5 h-5 animate-fade-in" />}
      {!isLoading && !isSuccess && children}
      {(isLoading || isSuccess) && <span>{children}</span>}
    </button>
  );
};
