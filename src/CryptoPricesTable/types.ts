export type Cryptocurrency = {
  id: string,
  rank: string,
  symbol: string,
  name: string,
  priceUsd: string,
  marketCapUsd: string,
  changePercent24Hr: string,
  vwap24Hr: string,
  changePercent7d: number,
  sprakline7d: number[],
};
