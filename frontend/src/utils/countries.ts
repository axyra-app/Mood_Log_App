export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

export const countries: Country[] = [
  { code: 'CO', name: 'Colombia', phoneCode: '+57', flag: '🇨🇴' },
  { code: 'US', name: 'Estados Unidos', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'MX', name: 'México', phoneCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', phoneCode: '+54', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', phoneCode: '+55', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', phoneCode: '+56', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', phoneCode: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', phoneCode: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', phoneCode: '+593', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivia', phoneCode: '+591', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', phoneCode: '+595', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', phoneCode: '+598', flag: '🇺🇾' },
  { code: 'ES', name: 'España', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'FR', name: 'Francia', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italia', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canadá', phoneCode: '+1', flag: '🇨🇦' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return countries.find(country => country.phoneCode === phoneCode);
};
