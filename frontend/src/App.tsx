import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CustomerPortal from './components/CustomerPortal';
import EmployeePortal from './components/EmployeePortal';
import './index.css';

function App() {
  // Use basename for GitHub Pages, but not for local development
  const basename = process.env.NODE_ENV === 'production' ? '/smart-supply-chain' : '';
  
  return (
    <Router basename={basename}>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customer" element={<CustomerPortal />} />
          <Route path="/employee" element={<EmployeePortal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
