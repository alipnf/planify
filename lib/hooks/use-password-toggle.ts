'use client';

import { useState } from 'react';

export function usePasswordToggle() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = () => setIsVisible((prev) => !prev);

  return {
    isVisible,
    toggle,
    type: isVisible ? 'text' : 'password',
  };
}
