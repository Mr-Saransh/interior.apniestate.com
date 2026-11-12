import React from 'react';

interface ApniEstateLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'blue' | 'light' | 'dark';
  showSubtitle?: boolean;
  useImage?: boolean;
}

export const ApniEstateLogo: React.FC<ApniEstateLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'blue',
  showSubtitle = false,
  useImage = false
}) => {
  const brandColor = variant === 'light' ? '#FFFFFF' : variant === 'dark' ? '#0F172A' : '#1D4ED8';
  const subtitleColor = variant === 'light' ? '#93C5FD' : '#64748B';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs tracking-[0.24em]',
    md: 'text-sm tracking-[0.26em]',
    lg: 'text-lg tracking-[0.28em]',
    xl: 'text-2xl tracking-[0.30em]'
  };

  if (useImage) {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <img
          src="/apni_estate_logo.png"
          alt="Apni Estate"
          className={`${iconSizes[size]} object-contain shrink-0`}
        />
        <div className="flex flex-col">
          <div className={`font-black uppercase font-display leading-none ${textSizes[size]}`} style={{ color: brandColor }}>
            APNI ESTATE
          </div>
          {showSubtitle && (
            <div 
              className="text-[8px] sm:text-[9px] font-bold tracking-[0.22em] uppercase mt-1 leading-none font-sans"
              style={{ color: subtitleColor }}
            >
              INTERIORS ERP + CRM
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Geometric Royal Blue Mark from Brand Identity */}
      <div className={`${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg 
          className="w-full h-full drop-shadow-xs" 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue Block with Negative Space Chimney and Gable Roof */}
          <path 
            d="M 20 15 
               L 180 15 
               L 180 135 
               L 135 75 
               L 95 125 
               L 95 90 
               L 60 90 
               L 60 145 
               L 20 200 
               Z" 
            fill={brandColor} 
          />
          
          {/* 4-Pane Window in Gable */}
          <rect x="123" y="115" width="10" height="10" rx="0.5" fill={brandColor} />
          <rect x="137" y="115" width="10" height="10" rx="0.5" fill={brandColor} />
          <rect x="123" y="129" width="10" height="10" rx="0.5" fill={brandColor} />
          <rect x="137" y="129" width="10" height="10" rx="0.5" fill={brandColor} />
        </svg>
      </div>

      {/* Brand Text Block */}
      <div className="flex flex-col">
        <div className={`font-black font-display uppercase leading-none ${textSizes[size]}`} style={{ color: brandColor }}>
          APNI ESTATE
        </div>
        {showSubtitle && (
          <div 
            className="text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.24em] uppercase mt-1 leading-none font-sans"
            style={{ color: subtitleColor }}
          >
            INTERIORS ERP + CRM
          </div>
        )}
      </div>
    </div>
  );
};
