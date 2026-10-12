import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { FocusEvent } from 'react';

export function useSlowMobileCarousel<T extends HTMLElement>(enabled = true) {
  const carouselRef = useRef<T>(null);
  const isPaused = useRef(false);
  const isPointerOver = useRef(false);
  const hasFocus = useRef(false);
  const isVisible = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !enabled || reduceMotion) return undefined;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(carousel);

    const advance = () => {
      if (!mediaQuery.matches || !isVisible.current || isPaused.current || document.hidden) return;

      const cards = Array.from(carousel.children).filter((child) => child.getAttribute('aria-hidden') !== 'true');
      if (cards.length < 2) return;

      const cardWidth = cards[0].getBoundingClientRect().width;
      const styles = window.getComputedStyle(carousel);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      const step = cardWidth + gap;
      const maximumScroll = carousel.scrollWidth - carousel.clientWidth;

      carousel.scrollTo({
        left: carousel.scrollLeft + step >= maximumScroll - 8 ? 0 : carousel.scrollLeft + step,
        behavior: 'smooth',
      });
    };

    const interval = window.setInterval(advance, 6500);
    return () => {
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, [enabled, reduceMotion]);

  return {
    carouselRef,
    onPointerEnter: () => {
      isPointerOver.current = true;
      isPaused.current = true;
    },
    onPointerLeave: () => {
      isPointerOver.current = false;
      isPaused.current = hasFocus.current;
    },
    onFocusCapture: () => {
      hasFocus.current = true;
      isPaused.current = true;
    },
    onBlurCapture: (event: FocusEvent<T>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        hasFocus.current = false;
        isPaused.current = isPointerOver.current;
      }
    },
  };
}
