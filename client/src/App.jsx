import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileList from './components/FileList';
import PaywallModal from './components/PaywallModal';

function App() {
  const [currentMenu, setCurrentMenu] = useState('My Data');
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [kpcBalance, setKpcBalance] = useState(500); // Start with 500 KPC mock

  return (
    <div className="h-screen w-screen flex flex-col bg-[#030303] text-white font-mono overflow-hidden relative">
      {/* Background Visuals */}
      <div className="bg-grid"></div>
      <div className="bg-vignette"></div>

      {/* Top Header */}
      <Header
        kpcBalance={kpcBalance}
        onOpenStore={() => setIsPaywallOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentMenu={currentMenu}
          setCurrentMenu={setCurrentMenu}
          onOpenStore={() => setIsPaywallOpen(true)}
          kpcBalance={kpcBalance}
        />

        {/* Central Drive Panel (Rounded Rectangle) */}
        <main className="flex-1 m-4 ml-0 bg-[#0a0a0a]/90 backdrop-blur-xl border border-cyan-900/30 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">

          <div className="content-scroll p-6 lg:p-8">
            <h1 className="text-2xl text-gray-100 font-normal tracking-wide mb-8 pl-2">
              {currentMenu === 'My Data' ? 'Welcome to Grid Access' : currentMenu}
            </h1>

            <FileList currentMenu={currentMenu} />
          </div>

        </main>
      </div>

      {/* KPC Store Modal */}
      {isPaywallOpen && (
        <PaywallModal
          kpcBalance={kpcBalance}
          onClose={() => setIsPaywallOpen(false)}
          onTopUp={(amount) => {
            setKpcBalance(prev => prev + amount);
            // Here we will eventually trigger the backend API to deduct KPC and update DB
            alert(`Purchase successful! Added ${amount.toLocaleString()} KPC to your balance.`);
          }}
        />
      )}
    </div>
  );
}

export default App;
