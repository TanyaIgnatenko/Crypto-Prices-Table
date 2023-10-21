import { mockDataForAPI2 } from './mockData';
import { Cryptocurrency } from './types';

const GET_COINS_MARKETS_URL = 'https://api.coincap.io/v2/assets';
const GET_COINS_MARKETS_URL2 = 'https://api.coingecko.com/api/v3/coins/markets';

export function fetchCoins(page: number, page_size = 10) {
  return Promise.allSettled([
    fetch(
      `${GET_COINS_MARKETS_URL}?offset=${
        (page - 1) * page_size
      }&limit=${page_size}`,
    ).then(resp => resp.json()),
    fetch(
      `${GET_COINS_MARKETS_URL2}?vs_currency=usd&price_change_percentage=7d&sparkline=true&page=${page}&per_page=${page_size}`,
    ).then(resp => resp.json()),
  ]).then(([result1, result2]) => {
    if (result1.status !== 'fulfilled') {
      throw new Error();
    }

    const { data: data1 } = result1.value;
    const data2 =
      result2.status === 'fulfilled' ? result2.value : mockDataForAPI2;

    return data1.map((item: Cryptocurrency, i: number) => {
      return {
        ...item,
        changePercent7d: data2[i].price_change_percentage_7d_in_currency,
        sprakline7d: data2[i].sparkline_in_7d.price,
      };
    });
  });
}
