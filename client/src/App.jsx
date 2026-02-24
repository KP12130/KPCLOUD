import React from 'react';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import FileList from './components/FileList';
import Uploader from './components/Uploader';
import Footer from './components/Footer';

function App() {
  return (
    <div className="dashboard-container relative overflow-hidden bg-[#030303]">
      <div className="bg-grid"></div>
      <div className="bg-vignette"></div>

      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <SearchBar />

        <main className="content-scroll">
          {/* Quick Upload Action */}
          <div className="mb-10">
            <Uploader />
          </div>

          {/* Files Dashboard Area */}
          <FileList />
        </main>

        <Footer />
      </div>

      {/* Grid Utility styles for Tailwind-like behavior in dashboard */}
      <style>{`
        .bg-vignette {
          background: radial-gradient(circle at center, transparent 0%, rgba(3,3,3,0.95) 100%);
        }
        .content-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .content-scroll::-webkit-scrollbar-track {
          background: rgba(0,243,255,0.02);
        }
        .content-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,243,255,0.1);
          border-radius: 10px;
        }
        .content-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0,243,255,0.2);
        }
      `}</style>
    </div>
  );
}

export default App;
