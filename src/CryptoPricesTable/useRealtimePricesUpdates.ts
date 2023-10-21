import { useEffect } from 'react';
import { Cryptocurrency } from './types';

const WEB_SOCKETS_API_URL = 'wss://ws.coincap.io/prices';

export function useRealtimePricesUpdates(
  cryptocurrencies: Cryptocurrency[],
  onChange: (cryptocurrencies: Cryptocurrency[]) => void,
) {
  useEffect(() => {
    if (!cryptocurrencies.length) return;

    const assetsIDs = cryptocurrencies.map(item => item.id).join(',');
    const websocket = new WebSocket(
      `${WEB_SOCKETS_API_URL}?assets=${assetsIDs}`,
    );
    websocket.onmessage = msg => {
      const updates = JSON.parse(msg.data);
      const coinsIDsToUpdate = Object.keys(updates);

      const updatedData = cryptocurrencies.map((item, i) => {
        const hasUpdates = coinsIDsToUpdate.includes(item.id);

        return hasUpdates
          ? {
              ...item,
              priceUsd: updates[item.id],
            }
          : item;
      });

      onChange(updatedData);
    };

    return () => {
      websocket.close();
    };
  }, [cryptocurrencies, onChange]);
}
