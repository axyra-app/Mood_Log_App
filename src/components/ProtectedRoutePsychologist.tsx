import React from 'react';

interface ProtectedRoutePsychologistProps {
  children: React.ReactNode;
}

const ProtectedRoutePsychologist: React.FC<ProtectedRoutePsychologistProps> = ({ children }) => {
  // TEMPORAL: Desactivar autenticación para capturas
  return <>{children}</>;
};

export default ProtectedRoutePsychologist;
