import React from 'react';
import './App.css';
import AppHeader from './components/AppHeader';
import DeviceList from './components/DeviceList';

function App() {
  return (
    <div className="App">
      <AppHeader />
      <DeviceList devices={[{ id: 1, name: "Belfast", ip_addr: "192.168.1.6" }, { id: 2, name: "İstanbul", ip_addr: "192.168.1.6" }]} />
    </div>
  );
}

export default App;
