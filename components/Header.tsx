import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#0e1b38] text-white pt-8 pb-16 px-4 text-center relative" style={{ clipPath: 'ellipse(150% 100% at 50% 0%)' }}>
      <div className="w-[120px] h-[120px] mx-auto mb-4 bg-white rounded-full p-2 shadow-[0_0_0_8px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
        {/* Placeholder for logo if original link fails, though we use the provided one */}
        <img 
            src="https://i.postimg.cc/KkvxQ5bF/logo.jpg" 
            alt="VoiceUP Logo" 
            className="rounded-full w-full h-auto"
            onError={(e) => {
                e.currentTarget.src = 'https://picsum.photos/120/120?grayscale';
            }}
        />
      </div>
      <h1 className="font-[900] text-3xl uppercase tracking-wider mb-1">
        Voice<span className="text-[#ff2e63]">UP</span> Festival
      </h1>
      <p className="opacity-90 font-light">Raport Financiar & Program</p>
    </header>
  );
};

export default Header;