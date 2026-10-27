import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Facebook, Instagram } from 'lucide-react';

export function SocialRail() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return undefined;

    const timeoutId = window.setTimeout(() => setIsOpen(false), 5000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <nav
      aria-label="Travel4life social media"
      className={`fixed left-1 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-gray-200/80 bg-white/95 p-1 shadow-lg backdrop-blur transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-[calc(100%-2.25rem)]'
      }`}
    >
      {isOpen && (
        <>
          <a
            href="https://www.instagram.com/travel4life_net/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Travel4life on Instagram"
            title="Instagram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#C13584] transition-colors hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="https://www.facebook.com/thetravellersstore/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Travel4life on Facebook"
            title="Facebook"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1877F2] transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Facebook className="h-4 w-4" aria-hidden="true" />
          </a>
        </>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Hide social links' : 'Show social links'}
        aria-expanded={isOpen}
        title={isOpen ? 'Hide social links' : 'Show social links'}
        className="inline-flex h-5 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </nav>
  );
}
