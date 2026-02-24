import React from 'react';

const Navbar = () => {
  return (
    <nav className="glass sticky top-0 z-50 flex items-center justify-between px-8 py-4 m-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f3ff]"></div>
        </div>
        <span className="text-2xl font-bold tracking-tighter neon-text-blue">KPCloud</span>
      </div>
      
      <button 
        className="px-6 py-2 rounded-full border border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-400 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] text-sm font-medium transition-all duration-300"
        onClick={() => {}}
      >
        [ BACK TO KPHUB ]
      </button>

      <style jsx>{`
        nav {
          margin: 1rem 2rem;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
