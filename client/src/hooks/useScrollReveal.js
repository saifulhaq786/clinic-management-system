import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useScrollReveal - Premium scroll animation hook
 * Reveals elements with smooth animations as they enter viewport
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);
  
  return [ref, isVisible];
}

/**
 * useParallax - Premium parallax scrolling effect
 */
export function useParallax(speed = 0.5) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);
  
  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const scrolled = window.innerHeight - rect.top;
    const newOffset = scrolled * speed * 0.1;
    setOffset(newOffset);
  }, [speed]);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  return [ref, offset];
}

/**
 * useSmoothScroll - Smooth scroll to element
 */
export function useSmoothScroll() {
  const scrollTo = useCallback((elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);
  
  return scrollTo;
}

/**
 * useScrollProgress - Track scroll progress (0 to 1)
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(1, Math.max(0, scrollProgress)));
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return progress;
}

/**
 * useStaggeredReveal - Reveal multiple children with stagger
 */
export function useStaggeredReveal(itemCount, baseDelay = 0.1) {
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState([]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger reveal each item
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => [...prev, i]);
            }, i * baseDelay * 1000);
          }
          observer.unobserve(container);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(container);
    
    return () => observer.disconnect();
  }, [itemCount, baseDelay]);
  
  return [containerRef, visibleItems];
}

/**
 * useMousePosition - Track mouse position for hover effects
 */
export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return [elementRef, position];
}
