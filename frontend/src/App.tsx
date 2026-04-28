import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CustomerPortal from './components/CustomerPortal';
import EmployeePortal from './components/EmployeePortal';
import './index.css';

function App() {
  return (
    <Router>
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
