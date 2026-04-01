import { FC, ReactNode, useEffect, useState } from 'react';
import { useInView } from '../../../hooks/useInView';

interface FadeInCardProps {
  children: ReactNode;
  /** Extra classes forwarded to the transition wrapper div */
  className?: string;
  /** Optional stagger delay in ms (e.g. index * 40) */
  delay?: number;
}

/**
 * Wraps any content in an IntersectionObserver-driven fade-in.
 * Transitions from opacity-0 translate-y-2 -> opacity-100 translate-y-0
 * over 500ms once the element scrolls into view.
 * Respects prefers-reduced-motion (immediately visible).
 */
const FadeInCard: FC<FadeInCardProps> = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (delay) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
    setVisible(true);
  }, [inView, delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeInCard;
