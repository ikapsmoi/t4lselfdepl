import React from 'react';

const FALLBACK_AVATAR = '/creator-avatar-fallback.svg';

interface CreatorAvatarProps {
  name: string;
  src?: string | null;
  className: string;
}

export const CreatorAvatar: React.FC<CreatorAvatarProps> = ({ name, src, className }) => (
  <img
    src={src || FALLBACK_AVATAR}
    alt={`${name} profile`}
    className={className}
    loading="lazy"
    decoding="async"
    onError={(event) => {
      if (event.currentTarget.dataset.fallbackApplied !== 'true') {
        event.currentTarget.dataset.fallbackApplied = 'true';
        event.currentTarget.src = FALLBACK_AVATAR;
      }
    }}
  />
);
