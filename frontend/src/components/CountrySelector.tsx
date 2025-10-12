import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { countries, Country } from '../utils/countries';

interface CountrySelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  isDarkMode?: boolean;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  selectedCountry, 
  onCountryChange, 
  isDarkMode = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between ${
          isDarkMode
            ? 'border-gray-600 bg-gray-700 text-white'
            : 'border-gray-300 bg-white text-gray-900'
        }`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium">{selectedCountry.phoneCode}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
          {/* Search */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Buscar país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                  selectedCountry.code === country.code
                    ? 'bg-purple-50 dark:bg-purple-900/20'
                    : ''
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {country.name}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {country.phoneCode}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
