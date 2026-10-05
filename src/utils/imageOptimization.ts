// Image optimization utilities for Travel4life

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
  
  const imageUrl = new URL(url);
  imageUrl.searchParams.set('auto', 'compress');
  imageUrl.searchParams.set('cs', 'tinysrgb');
  imageUrl.searchParams.set('w', String(width));
  imageUrl.searchParams.set('h', String(height));
  imageUrl.searchParams.set('q', String(quality));
  imageUrl.searchParams.set('fm', 'webp');
  return imageUrl.toString();
};

export const optimizeSupabaseImage = (url: string, options: ImageOptions = {}): string => {
  const { width = 640, quality = 75 } = options;

  try {
    const imageUrl = new URL(url);
    if (
      !imageUrl.hostname.endsWith('.supabase.co') ||
      !imageUrl.pathname.includes('/storage/v1/object/public/')
    ) {
      return url;
    }

    imageUrl.pathname = imageUrl.pathname.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/',
    );
    imageUrl.searchParams.set('width', String(width));
    imageUrl.searchParams.set('quality', String(quality));
    if (!imageUrl.pathname.toLowerCase().endsWith('.gif')) {
      imageUrl.searchParams.set('format', 'webp');
    }
    return imageUrl.toString();
  } catch {
    return url;
  }
};

export const optimizeImageUrl = (url: string, options: ImageOptions = {}): string =>
  optimizeSupabaseImage(optimizePexelsImage(url, options), options);

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
