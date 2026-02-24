import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileList from './components/FileList';

function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#030303] text-white font-mono overflow-hidden relative">
      {/* Background Visuals */}
      <div className="bg-grid"></div>
      <div className="bg-vignette"></div>

      {/* Top Header */}
      <Header />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Central Drive Panel (Rounded Rectangle) */}
        <main className="flex-1 m-4 ml-0 bg-[#0a0a0a]/90 backdrop-blur-xl border border-cyan-900/30 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">

          <div className="content-scroll p-6 lg:p-8">
            <h1 className="text-2xl text-gray-100 font-normal tracking-wide mb-8 pl-2">Welcome to Grid Access</h1>

            <FileList />
          </div>

        </main>
      </div>

    </div>
  );
}

export default App;
