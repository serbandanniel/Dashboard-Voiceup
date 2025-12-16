import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CompetitorsTable from './components/CompetitorsTable';

const App: React.FC = () => {
  return (
    <div className="min-h-screen pb-12">
      <Header />
      <div className="max-w-[1200px] mx-auto px-4 -mt-12 relative z-10">
        <Dashboard />
        <CompetitorsTable />
      </div>
      <footer className="text-center py-8 text-gray-600 text-sm">
        <p>&copy; 2025 VoiceUP Festival. Toate drepturile rezervate.</p>
        <p className="mt-1"><strong className="text-[#ff2e63]">Versiunea 2.2 (React Online)</strong></p>
      </footer>
    </div>
  );
};

export default App;