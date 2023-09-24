import {useEffect} from 'react';
import { CryptoPricesTable } from './CryptoPricesTable/CryptoPricesTable';
import ReactGA from './analytics';

import './App.css';

function App() {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return (
    <div>
      <h1 className="title">Coin Market Cap</h1>
      <CryptoPricesTable />
    </div>
  );
}

export default App;
