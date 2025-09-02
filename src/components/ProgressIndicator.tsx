// Progress Indicator Component for multi-step flows
interface ProgressIndicatorProps {
  steps: string[];
  currentStep: string;
  stepNames: string[];
  className?: string;
}

const ProgressIndicator = ({ steps, currentStep, stepNames, className = '' }: ProgressIndicatorProps) => {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <div className='flex items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto'>
        {steps.map((step, index) => {
          const isActive = currentStep === step;
          const isCompleted = currentIndex > index;
          const isUpcoming = currentIndex < index;

          return (
            <div key={step} className='flex items-center flex-shrink-0'>
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-600 text-white scale-110'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : isUpcoming
                    ? 'bg-gray-300 text-gray-600'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium transition-colors duration-300 hidden sm:inline ${
                  isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {stepNames[index]}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
