// Image optimization utilities for TravelTag

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

// Optimize Pexels images with query parameters
export const optimizePexelsImage = (url: string, options: ImageOptions = {}): string => {
  const { width = 600, height = 400, quality = 75 } = options;
  
  // Check if it's a Pexels URL
  if (!url.includes('pexels.com')) {
    return url;
  }
  
  // Add optimization parameters
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}auto=compress&cs=tinysrgb&w=${width}&h=${height}&q=${quality}&fm=webp`;
};

// Generate responsive image srcset for different screen sizes
export const generateResponsiveImageSrcSet = (baseUrl: string): string => {
  const sizes = [
    { width: 320, suffix: '320w' },
    { width: 640, suffix: '640w' },
    { width: 960, suffix: '960w' },
    { width: 1280, suffix: '1280w' }
  ];
  
  return sizes
    .map(size => `${optimizePexelsImage(baseUrl, { width: size.width })} ${size.suffix}`)
    .join(', ');
};

// Get appropriate sizes attribute for responsive images
export const getImageSizes = (type: 'hero' | 'card' | 'thumbnail' | 'avatar'): string => {
  switch (type) {
    case 'hero':
      return '100vw';
    case 'card':
      return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px';
    case 'thumbnail':
      return '(max-width: 768px) 25vw, 120px';
    case 'avatar':
      return '64px';
    default:
      return '100vw';
  }
};

// Default optimized images for common use cases
export const DEFAULT_IMAGES = {
  tripFallback: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fm=webp',
  heroFallback: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&fm=webp',
  avatarFallback: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fm=webp'
};

// Preload critical images
export const preloadCriticalImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizePexelsImage(url, { width: 800, height: 600 });
    document.head.appendChild(link);
  });
};