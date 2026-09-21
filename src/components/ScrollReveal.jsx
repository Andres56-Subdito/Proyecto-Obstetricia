import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const delayClass = delay === 1 ? 'reveal-delay-1' : delay === 2 ? 'reveal-delay-2' : delay === 3 ? 'reveal-delay-3' : '';

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
