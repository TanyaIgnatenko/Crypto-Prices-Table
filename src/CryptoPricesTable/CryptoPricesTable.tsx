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

const GET_COINS_MARKETS_URL = 'https://api.coincap.io/v2/assets'

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const TABLE_PAGE_SIZE = 15;
const TOTAL_ASSETS_COUNT = 2296;

export const CryptoPricesTable = () => {
  const [data, setData] = useState([]);

  const onPaginationChange = ({ payload: { page } }) => {
    fetchCoins(page + 1);
  }
  const pagination = usePagination(data, {
    state: {
      page: 0,
      size: TABLE_PAGE_SIZE,
    },
    onChange: onPaginationChange,
  });

  function fetchCoins(page: number) {
    fetch(`${GET_COINS_MARKETS_URL}?offset=${(page - 1) * TABLE_PAGE_SIZE}&limit=${TABLE_PAGE_SIZE}`)
      .then(resp => resp.json())
      .then(({ data }) => setData(data))
      .catch(e => console.log(e));
  }

  useEffect(() => {
    fetchCoins(1);
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
            priceUsd: updates[item.id]
          }
          : item;
      });

      setData(updatedData);
    };

    return () => {
      websocket.close();
    };
  }, [data]);

  const theme = useTableTheme();

  return (
    <div>
      <h1 style={{ textAlign: 'center', color: 'rgb(33, 33, 33)' }}>Crypto Prices</h1>
      <Table data={{ nodes: data }} theme={theme} layout={{ custom: true, horizontalScroll: true }}>
        {(tableList) => (
          <>
            <Header>
              <HeaderRow>
                <HeaderCell pinLeft={true}>Rank</HeaderCell>
                <HeaderCell pinLeft={true}>Name</HeaderCell>
                <HeaderCell>Price</HeaderCell>
                <HeaderCell>Market Cap</HeaderCell>
                <HeaderCell>Change (24Hr)</HeaderCell>
              </HeaderRow>
            </Header>

            <Body>
              {tableList.map((item) => (
                <Row key={item.id} item={item}>
                  <Cell pinLeft={true}>{item.rank}</Cell>
                  <Cell pinLeft={true}>{item.name}</Cell>
                  <Cell>{priceFormatter.format(item.priceUsd)}</Cell>
                  <Cell>{priceFormatter.format(item.marketCapUsd)}</Cell>
                  <Cell>{(Math.round(item.changePercent24Hr * 100) / 100).toFixed(2) + '%'}</Cell>
                </Row>
              ))}
            </Body>
          </>
        )}
      </Table>
      <Group position="right" mx={10}>
        <Pagination
          total={TOTAL_ASSETS_COUNT / TABLE_PAGE_SIZE}
          page={pagination.state.page + 1}
          onChange={(page) => pagination.fns.onSetPage(page - 1)}
          isServer={true}
        />
      </Group>
    </div>
  );
};

