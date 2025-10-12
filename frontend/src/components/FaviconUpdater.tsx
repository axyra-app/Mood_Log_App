import React, { useEffect } from 'react';

const FaviconUpdater: React.FC = () => {
  useEffect(() => {
    // Crear un canvas para generar el favicon
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Cargar imagen desde PostImages
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
      // Dibujar la imagen en el canvas
      ctx.drawImage(img, 0, 0, 32, 32);
      
      // Convertir a data URL
      const dataURL = canvas.toDataURL('image/png');
      
      // Actualizar el favicon
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = dataURL;
      } else {
        // Crear nuevo link si no existe
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = dataURL;
        document.head.appendChild(newLink);
      }
    };
    
    img.onerror = function() {
      // Fallback: crear favicon simple
      const gradient = ctx.createLinearGradient(0, 0, 32, 32);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#EC4899');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      
      // Checkmark
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', 16, 16);
      
      // Actualizar favicon
      const dataURL = canvas.toDataURL('image/png');
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = dataURL;
      }
    };
    
    // Intentar cargar la imagen
    img.src = 'https://postimg.cc/5HYdCCDB';
    
  }, []);

  return null; // Este componente no renderiza nada
};

export default FaviconUpdater;
