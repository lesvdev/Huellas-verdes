import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

interface CasdShieldProps {
  className?: string;
  size?: number;
}

export const CasdShield: React.FC<CasdShieldProps> = ({ className = '', size = 56 }) => {
  const [shieldSrc, setShieldSrc] = useState<string>('/escudo-casd.png');

  useEffect(() => {
    try {
      const custom = storageService.getShieldUrl();
      if (custom) {
        setShieldSrc(custom);
      }
      const unsubscribe = storageService.subscribeShieldUrl((url) => {
        if (url) setShieldSrc(url);
      });
      return () => unsubscribe();
    } catch {
      // fallback
    }
  }, []);

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title="Institución Educativa CASD José Prudencio Padilla - Barrancabermeja"
    >
      <img
        src={shieldSrc}
        alt="Escudo CASD Barrancabermeja"
        className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-200"
        loading="eager"
        onError={() => setShieldSrc('/escudo-casd.png')}
      />
    </div>
  );
};
