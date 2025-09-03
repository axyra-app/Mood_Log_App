// Diary validation component with helpful tips
interface DiaryValidationProps {
  text: string;
  minLength?: number;
  maxLength?: number;
}

const DiaryValidation = ({ text, minLength = 10, maxLength = 1000 }: DiaryValidationProps) => {
  const length = text.length;
  const isValid = length >= minLength && length <= maxLength;
  const isTooShort = length > 0 && length < minLength;
  const isTooLong = length > maxLength;

  const getValidationMessage = () => {
    if (isTooShort) {
      return `Necesitas al menos ${minLength - length} caracteres más`;
    }
    if (isTooLong) {
      return `Has excedido el límite por ${length - maxLength} caracteres`;
    }
    if (isValid) {
      return '¡Perfecto! Tu entrada está lista';
    }
    return '';
  };

  const getValidationColor = () => {
    if (isValid) return 'text-green-600';
    if (isTooShort || isTooLong) return 'text-red-600';
    return 'text-gray-500';
  };

  const getProgressColor = () => {
    if (isValid) return 'bg-green-500';
    if (isTooShort || isTooLong) return 'bg-red-500';
    return 'bg-primary-500';
  };

  const progressPercentage = Math.min((length / maxLength) * 100, 100);

  return (
    <div className='space-y-3'>
      {/* Progress bar */}
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Character count and validation */}
      <div className='flex justify-between items-center text-sm'>
        <span className='text-gray-500'>
          {length}/{maxLength} caracteres
        </span>
        {getValidationMessage() && (
          <span className={`font-medium ${getValidationColor()}`}>{getValidationMessage()}</span>
        )}
      </div>

      {/* Helpful tips */}
      {isTooShort && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
          <p className='text-sm text-blue-800'>
            💡 <strong>Consejo:</strong> Intenta describir al menos una actividad o sentimiento específico de tu día.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiaryValidation;
