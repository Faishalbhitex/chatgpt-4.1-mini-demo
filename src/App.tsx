// src/App.tsx
import React from 'react';
import ChatPage from './pages/ChatPage';
import './styles/main.css'; // Import global CSS
// import './App.css'; // Hapus atau gunakan jika perlu style khusus App

function App() {
  return (
    <div className="App">
      <ChatPage />
    </div>
  );
}

export default App;
