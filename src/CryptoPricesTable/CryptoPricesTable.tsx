import { useState, useEffect } from 'react';
import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from "@table-library/react-table-library/table";
import { usePagination } from '@table-library/react-table-library/pagination';
import { Group, Pagination } from '@mantine/core';

import { useTableTheme } from './useTableTheme';

import './CryptoPricesTable.css'

const GET_COINS_MARKETS_URL = 'https://api.coincap.io/v2/assets';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const TABLE_PAGE_SIZE = 15;
const TOTAL_ASSETS_COUNT = 2296;

export const CryptoPricesTable = () => {
  const [data, setData] = useState([]);

  function fetchCoins(page: number) {
    return fetch(`${GET_COINS_MARKETS_URL}?offset=${(page - 1) * TABLE_PAGE_SIZE}&limit=${TABLE_PAGE_SIZE}`)
      .then(resp => resp.json())
      .catch(e => console.log(e));
  }

  useEffect(() => {
    fetchCoins(1)
      .then(({ data }) => setData(data));
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const assetsIDs = data.map(item => item.id).join(',');
    const websocket = new WebSocket(`wss://ws.coincap.io/prices?assets=${assetsIDs}`);
    websocket.onmessage = (msg) => {
      const updates = JSON.parse(msg.data);
      const coinsIDsToUpdate = Object.keys(updates);

      const updatedData = data.map(item => {
        return coinsIDsToUpdate.includes(item.id)
          ? {
            ...item,
            priceUsd: updates[item.id],
            hasGrown: item.priceUsd < updates[item.id],
            hasFallen: item.priceUsd > updates[item.id]
          }
          : item;
      });

      setData(updatedData);
    };

    return () => {
      websocket.close();
    };
  }, [data]);

  const onPaginationChange = ({ payload: { page } }) => {
    fetchCoins(page + 1)
      .then(({ data }) => setData(data));
  }
  const pagination = usePagination(data, {
    state: {
      page: 0,
      size: TABLE_PAGE_SIZE,
    },
    onChange: onPaginationChange,
  });

  const theme = useTableTheme();

  return (
    <>
      <Table data={{ nodes: data }} theme={theme} layout={{ custom: true, horizontalScroll: true }} >
        {(tableList) => (
          <>
            <Header>
              <HeaderRow>
                <HeaderCell pinLeft={true}>Rank</HeaderCell>
                <HeaderCell pinLeft={true}>Name</HeaderCell>
                <HeaderCell>Price</HeaderCell>
                <HeaderCell>Market Cap</HeaderCell>
                <HeaderCell>Change (24Hr)</HeaderCell>
                <HeaderCell>VWAP (24Hr)</HeaderCell>
              </HeaderRow>
            </Header>

            <Body>
              {tableList.map((item) => {
                return (
                  <>
                    <Row key={item.id} item={item} className={item.hasGrown ? 'hasGrown' : item.hasFallen ? 'hasFallen' : undefined}>
                      <Cell pinLeft={true}>{item.rank}</Cell>
                      <Cell pinLeft={true}>
                        <img className="crypto-icon" src={`https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`} />
                        {item.name}
                      </Cell>
                      <Cell>{priceFormatter.format(item.priceUsd)}</Cell>
                      <Cell>{priceFormatter.format(item.marketCapUsd)}</Cell>
                      <Cell>{(Math.round(item.changePercent24Hr * 100) / 100).toFixed(2) + '%'}</Cell>
                      <Cell>{priceFormatter.format(item.vwap24Hr)}</Cell>
                    </Row>
                  </>
                );
              })}
            </Body>
          </>
        )}
      </Table>
      <Group position="right" mx={10} my={5}>
        <Pagination
          total={TOTAL_ASSETS_COUNT / TABLE_PAGE_SIZE}
          page={pagination.state.page + 1}
          onChange={(page) => pagination.fns.onSetPage(page - 1)}
          isServer={true}
        />
      </Group>
    </>
  );
};

