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
      updateFavicon(dataURL);
    };
    
    img.onerror = function() {
      console.log('Error cargando imagen, usando fallback con cara sonriente');
      // Fallback: crear favicon con cara sonriente
      const gradient = ctx.createLinearGradient(0, 0, 32, 32);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#EC4899');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      
      // Cara sonriente
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('😊', 16, 16);
      
      // Actualizar favicon
      const dataURL = canvas.toDataURL('image/png');
      updateFavicon(dataURL);
    };
    
    // Intentar cargar la imagen
    img.src = 'https://postimg.cc/0KfXKknj';
    
  }, []);

  const updateFavicon = (dataURL: string) => {
    // Remover favicons existentes
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach(link => link.remove());
    
    // Crear nuevo favicon
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = dataURL;
    newLink.type = 'image/png';
    document.head.appendChild(newLink);
    
    // También crear shortcut icon
    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.href = dataURL;
    shortcutLink.type = 'image/png';
    document.head.appendChild(shortcutLink);
    
    console.log('✅ Favicon actualizado con tu logo personalizado');
  };

  return null; // Este componente no renderiza nada
};

export default FaviconUpdater;
