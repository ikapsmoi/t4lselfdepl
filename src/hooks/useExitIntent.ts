import { useState, useEffect } from 'react';

export const useExitIntent = () => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  useEffect(() => {
    // Check if modal has been shown in this session
    const modalShown = sessionStorage.getItem('exitModalShown');
    if (modalShown) {
      setHasShownModal(true);
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from the top of the viewport
      if (e.clientY <= 0 && !hasShownModal && isSubscribed) {
        setShowExitModal(true);
        setHasShownModal(true);
        sessionStorage.setItem('exitModalShown', 'true');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !hasShownModal && isSubscribed) {
        // Small delay to avoid triggering on quick tab switches
        timeoutId = setTimeout(() => {
          if (isSubscribed) {
            setShowExitModal(true);
            setHasShownModal(true);
            sessionStorage.setItem('exitModalShown', 'true');
          }
        }, 1000);
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const closeModal = () => {
    setShowExitModal(false);
  };

  return {
    showExitModal,
    closeModal
  };
};