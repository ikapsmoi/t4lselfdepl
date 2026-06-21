import { useState } from 'react';
import { Camera, MapPin, Heart, User } from 'lucide-react';
import { useGallery } from '../../hooks/useGallery';
import { OptimizedImage } from '../ui/OptimizedImage';

export function ClientGallery() {
  const { images, loading } = useGallery();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="columns-2 md:columns-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`mb-4 rounded-[20px] bg-gray-200 animate-pulse ${i % 3 === 0 ? 'h-80' : i % 3 === 1 ? 'h-60' : 'h-72'}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <Camera className="w-4 h-4" />
            <span>Community Gallery</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Captured <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-500">Memories</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Real adventures, real smiles. See the world through our travelers' eyes.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-3 gap-4 md:gap-5">
          {images.map((image, index) => {
            const heights = ['h-64', 'h-80', 'h-72', 'h-96', 'h-64', 'h-80'];
            const heightClass = heights[index % heights.length];
            const shuffleDelay = `${(index * 1.5) % 8}s`;

            return (
              <div
                key={image.id}
                className={`relative mb-4 md:mb-5 rounded-[20px] overflow-hidden group cursor-pointer break-inside-avoid gallery-shuffle-item ${heightClass}`}
                style={{ animationDelay: shuffleDelay }}
                onClick={() => setSelectedImage(index)}
              >
                <OptimizedImage
                  src={image.image_url}
                  alt={`${image.client_name || 'Traveler'} at ${image.location || 'adventure'}`}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />

                {/* Hover overlay with creator attribution */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">
                        {image.client_name || 'Travel4life Traveler'}
                      </p>
                      {image.location && (
                        <div className="flex items-center gap-1 text-white/70">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{image.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Like icon top-right */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <OptimizedImage
              src={images[selectedImage].image_url}
              alt={images[selectedImage].client_name || 'Gallery image'}
              className="w-full h-full max-h-[85vh] object-contain rounded-2xl"
            />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-bold text-lg">{images[selectedImage].client_name || 'Traveler'}</p>
              {images[selectedImage].location && (
                <p className="text-white/70 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {images[selectedImage].location}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
