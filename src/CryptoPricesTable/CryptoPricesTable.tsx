import { useState, useEffect, useCallback } from 'react';
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

const GET_COINS_MARKETS_URL = 'https://api.coincap.io/v2/assets'

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const TABLE_PAGE_SIZE = 12;
const TOTAL_ASSETS_COUNT = 2296;

export const CryptoPricesTable = ({ isFeed = false }) => {
  const [data, setData] = useState([]);

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

  const [page, setPage] = useState(1);
  const [loadingID, setLoadingID] = useState();
  const handleLoadMoreClick = (item) => {
    setLoadingID(item.id);
    fetchCoins(page + 1)
      .then(({ data: newData }) => {
        setData([...data, ...newData]);
        setPage(page + 1);
        setLoadingID(null);
      })
  };

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
              {tableList.map((item, idx) => {
                console.log(tableList.length);
                const showLoadMore = isFeed && idx === (tableList.length - 1) && idx < TOTAL_ASSETS_COUNT;
                const showLoading = item.id === loadingID;
                console.log(showLoadMore);
                return (
                  <>
                    <Row key={item.id} item={item}>
                      <Cell pinLeft={true}>{item.rank}</Cell>
                      <Cell pinLeft={true}>
                        <img className="crypto-icon" src={`https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`} />
                        {item.name}
                      </Cell>
                      <Cell>{priceFormatter.format(item.priceUsd)}</Cell>
                      <Cell>{priceFormatter.format(item.marketCapUsd)}</Cell>
                      <Cell>{(Math.round(item.changePercent24Hr * 100) / 100).toFixed(2) + '%'}</Cell>
                    </Row>
                    {(showLoadMore || showLoading) && (
                      <div className="loadMoreButton">
                        {showLoading
                          ? 'Loading...'
                          : <button onClick={() => handleLoadMoreClick(item)}>View more...</button>
                        }
                      </div>
                    )}
                  </>
                );
              })}
            </Body>
          </>
        )}
      </Table>
      {!isFeed && (<Group position="right" mx={10}>
        <Pagination
          total={TOTAL_ASSETS_COUNT / TABLE_PAGE_SIZE}
          page={pagination.state.page + 1}
          onChange={(page) => pagination.fns.onSetPage(page - 1)}
          isServer={true}
        />
      </Group>
      )}
    </div>
  );
};

