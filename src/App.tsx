import React from 'react';
import { CryptoPricesTable } from './CryptoPricesTable/CryptoPricesTable';

import './App.css';

function App() {

  return (
    <div>
      <h1 className="title">Coin Market Cap</h1>
      <CryptoPricesTable />
    </div>
  );
}

export default App;
