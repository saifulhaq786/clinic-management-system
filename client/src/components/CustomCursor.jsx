import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Only enable on non-touch devices
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;
    
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    
    if (!dot || !ring) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;
    
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);
    };
    
    const handleMouseLeave = () => {
      setIsVisible(false);
    };
    
    const handleMouseEnter = () => {
      setIsVisible(true);
    };
    
    const handleMouseDown = () => {
      setIsClicking(true);
    };
    
    const handleMouseUp = () => {
      setIsClicking(false);
    };
    
    // Detect hoverable elements
    const handleElementHover = (e) => {
      const target = e.target;
      const isHoverable = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('hoverable') ||
        target.closest('.hoverable');
      
      setIsHovering(isHoverable);
    };
    
    // Animation loop for smooth cursor
    let animationId;
    const animate = () => {
      // Smooth follow for dot
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;
      
      // Slower follow for ring
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      
      dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleElementHover, { passive: true });
    
    // Add class to body for cursor hiding
    document.body.classList.add('custom-cursor-active');
    
    // Start animation
    animate();
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleElementHover);
      document.body.classList.remove('custom-cursor-active');
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }
  
  return (
    <>
      {/* Cursor Dot */}
      <div
        ref={cursorDotRef}
        className="custom-cursor cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          backgroundColor: '#14b8a6',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s ease, transform 0.15s ease-out',
          mixBlendMode: 'difference',
        }}
      />
      
      {/* Cursor Ring */}
      <div
        ref={cursorRingRef}
        className="custom-cursor cursor-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '60px' : '40px',
          height: isHovering ? '60px' : '40px',
          border: `2px solid ${isHovering ? '#5eead4' : '#14b8a6'}`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: isVisible ? (isHovering ? 0.8 : 0.5) : 0,
          transition: 'opacity 0.2s ease, width 0.3s ease, height 0.3s ease, border-color 0.3s ease',
          transform: isClicking ? 'scale(0.8)' : 'scale(1)',
          mixBlendMode: 'difference',
        }}
      />
    </>
  );
}
