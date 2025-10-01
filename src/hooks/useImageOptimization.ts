import { useCallback, useEffect, useState } from 'react';

// Configuración de optimización de imágenes
interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  maxWidth: number;
  maxHeight: number;
  lazy: boolean;
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  quality: 80,
  format: 'webp',
  maxWidth: 800,
  maxHeight: 600,
  lazy: true,
};

// Hook para optimización de imágenes
export const useImageOptimization = (config: Partial<ImageOptimizationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const optimizeImageUrl = useCallback(
    (url: string, customConfig?: Partial<ImageOptimizationConfig>) => {
      const currentConfig = { ...finalConfig, ...customConfig };

      // Si es una URL de Firebase Storage, agregar parámetros de optimización
      if (url.includes('firebasestorage.googleapis.com')) {
        const params = new URLSearchParams({
          alt: 'media',
          token: url.split('token=')[1] || '',
        });

        // Agregar parámetros de optimización si el servicio los soporta
        if (currentConfig.format === 'webp') {
          params.append('format', 'webp');
        }

        return `${url.split('?')[0]}?${params.toString()}`;
      }

      return url;
    },
    [finalConfig]
  );

  return { optimizeImageUrl, config: finalConfig };
};

// Hook para lazy loading de imágenes con intersection observer
export const useLazyImage = (
  src: string,
  placeholder?: string,
  options: {
    threshold?: number;
    rootMargin?: string;
    fallback?: string;
  } = {}
) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useState<HTMLImageElement | null>(null)[0];

  const { threshold = 0.1, rootMargin = '50px', fallback } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef) {
      observer.observe(imgRef);
    }

    return () => observer.disconnect();
  }, [imgRef, threshold, rootMargin]);

  useEffect(() => {
    if (!isIntersecting || !src) return;

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setIsError(true);
      if (fallback) {
        setImageSrc(fallback);
      }
    };

    img.src = src;
  }, [src, isIntersecting, fallback]);

  return {
    imageSrc,
    isLoaded,
    isError,
    imgRef,
    isIntersecting,
  };
};

// Componente de imagen optimizada
interface OptimizedImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
  isDarkMode?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  config?: Partial<ImageOptimizationConfig>;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  placeholder,
  fallback,
  className = '',
  isDarkMode = false,
  width,
  height,
  priority = false,
  config = {},
}) => {
  const { optimizeImageUrl } = useImageOptimization(config);
  const optimizedSrc = optimizeImageUrl(src);

  const { imageSrc, isLoaded, isError, imgRef } = useLazyImage(optimizedSrc, placeholder, { fallback });

  if (isError && !fallback) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`} style={{ width, height }}>
        <span className='text-gray-500 text-sm'>Error cargando imagen</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{
        backgroundImage: placeholder ? `url(${placeholder})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...(priority && { loading: 'eager' as const }),
      }}
    />
  );
};

// Hook para precargar imágenes críticas
export const useImagePreloader = () => {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadImages = useCallback(async (urls: string[]) => {
    setIsPreloading(true);

    const promises = urls.map((url) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    });

    try {
      const loadedUrls = await Promise.all(promises);
      setPreloadedImages((prev) => new Set([...prev, ...loadedUrls]));
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    } finally {
      setIsPreloading(false);
    }
  }, []);

  const isImagePreloaded = useCallback(
    (url: string) => {
      return preloadedImages.has(url);
    },
    [preloadedImages]
  );

  return {
    preloadImages,
    isImagePreloaded,
    isPreloading,
    preloadedCount: preloadedImages.size,
  };
};

// Hook para optimizar el tamaño de imágenes
export const useImageResize = () => {
  const resizeImage = useCallback(
    (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calcular nuevas dimensiones manteniendo la proporción
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          // Dibujar imagen redimensionada
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir a blob y luego a File
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: blob.type,
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                reject(new Error('Failed to resize image'));
              }
            },
            file.type,
            quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  return { resizeImage };
};

// Hook para comprimir imágenes
export const useImageCompression = () => {
  const compressImage = useCallback(
    async (
      file: File,
      options: {
        maxSizeKB?: number;
        quality?: number;
        maxWidth?: number;
        maxHeight?: number;
      } = {}
    ): Promise<File> => {
      const { maxSizeKB = 500, quality = 0.8, maxWidth = 1200, maxHeight = 1200 } = options;

      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calcular dimensiones
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          // Dibujar imagen
          ctx?.drawImage(img, 0, 0, width, height);

          // Comprimir hasta alcanzar el tamaño objetivo
          const compress = (currentQuality: number): void => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }

                const sizeKB = blob.size / 1024;

                if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
                  const compressedFile = new File([blob], file.name, {
                    type: blob.type,
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  // Reducir calidad y intentar de nuevo
                  compress(currentQuality - 0.1);
                }
              },
              file.type,
              currentQuality
            );
          };

          compress(quality);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  return { compressImage };
};

// Utilidades para optimización de assets
export const assetOptimization = {
  // Generar URL optimizada para Firebase Storage
  getOptimizedFirebaseUrl: (
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ) => {
    const { width, height, quality = 80, format = 'webp' } = options;

    if (!url.includes('firebasestorage.googleapis.com')) {
      return url;
    }

    const params = new URLSearchParams();

    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    if (format) params.append('f', format);

    return `${url}?${params.toString()}`;
  },

  // Detectar soporte para WebP
  supportsWebP: (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  },

  // Obtener formato óptimo según el navegador
  getOptimalFormat: async (): Promise<'webp' | 'jpeg' | 'png'> => {
    const webPSupported = await assetOptimization.supportsWebP();
    return webPSupported ? 'webp' : 'jpeg';
  },

  // Calcular tamaño de archivo en formato legible
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

export default assetOptimization;
