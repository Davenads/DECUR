import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight IntersectionObserver hook.
 * Returns a [ref, isVisible] tuple. Fires once when the element enters the
 * viewport, then disconnects. Immediately resolves to visible when the user
 * has opted into prefers-reduced-motion.
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -32px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, isVisible] as const;
}
