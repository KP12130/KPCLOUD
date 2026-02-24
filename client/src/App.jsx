import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Uploader from './components/Uploader';
import FileList from './components/FileList';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="bg-grid"></div>
      <div className="bg-vignette"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <Hero />
        <Uploader />
        <FileList />
      </main>

      <Footer />

      {/* Tailwind-like Utility Classes */}
      <style>{`
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-row { flex-direction: row; }
        .items-center { align-items: center; }
        .items-end { align-items: flex-end; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        .m-4 { margin: 1rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mt-8 { margin-top: 2rem; }
        .mt-12 { margin-top: 3rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-12 { margin-bottom: 3rem; }
        .mb-16 { margin-bottom: 4rem; }
        .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-1.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .pt-8 { padding-top: 2rem; }
        .pt-20 { padding-top: 5rem; }
        .pb-16 { padding-bottom: 4rem; }
        .pb-24 { padding-bottom: 6rem; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .sticky { position: sticky; }
        .top-0 { top: 0; }
        .left-0 { left: 0; }
        .left-1/2 { left: 50%; }
        .-translate-x-1/2 { transform: translateX(-50%); }
        .z-50 { z-index: 50; }
        .z-10 { z-index: 10; }
        .-z-10 { z-index: -10; }
        .w-1 { width: 0.25rem; }
        .w-1.5 { width: 0.375rem; }
        .w-4 { width: 1rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-16 { width: 4rem; }
        .w-[600px] { width: 600px; }
        .h-1.5 { height: 0.375rem; }
        .h-4 { height: 1rem; }
        .h-8 { height: 2rem; }
        .h-10 { height: 2.5rem; }
        .h-16 { height: 4rem; }
        .h-[300px] { height: 300px; }
        .min-h-screen { min-height: 100vh; }
        .rounded-full { border-radius: 9999px; }
        .rounded-sm { border-radius: 0.125rem; }
        .border { border-width: 1px; }
        .border-2 { border-width: 2px; }
        .border-b { border-bottom-width: 1px; }
        .border-t { border-top-width: 1px; }
        .border-dashed { border-style: dashed; }
        .border-white\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .border-white\/10 { border-color: rgba(255, 255, 255, 0.1); }
        .border-white\/20 { border-color: rgba(255, 255, 255, 0.2); }
        .border-white\/[0.02] { border-color: rgba(255, 255, 255, 0.02); }
        .border-cyan-400 { border-color: #00f3ff; }
        .bg-white\/5 { background-color: rgba(255, 255, 255, 0.05); }
        .bg-black\/50 { background-color: rgba(0, 0, 0, 0.5); }
        .bg-cyan-500\/10 { background-color: rgba(6, 182, 212, 0.1); }
        .bg-cyan-500\/20 { background-color: rgba(6, 182, 212, 0.2); }
        .bg-cyan-900\/40 { background-color: rgba(22, 78, 99, 0.4); }
        .bg-cyan-400 { background-color: #00f3ff; }
        .text-center { text-align: center; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-5xl { font-size: 3rem; }
        .text-7xl { font-size: 4.5rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-[10px] { font-size: 10px; }
        .text-[9px] { font-size: 9px; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .tracking-tight { letter-spacing: -0.025em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-[0.2em] { letter-spacing: 0.2em; }
        .tracking-[0.5em] { letter-spacing: 0.5em; }
        .opacity-40 { opacity: 0.4; }
        .blur-[120px] { filter: blur(120px); }
        .backdrop-blur-md { backdrop-filter: blur(12px); }
        .max-w-2xl { max-width: 42rem; }
        .max-w-7xl { max-width: 80rem; }
        .overflow-x-hidden { overflow-x: hidden; }

        @media (min-width: 768px) {
          .md\:flex-row { flex-direction: row; }
          .md\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        }
      `}</style>
    </div>
  );
}

export default App;
