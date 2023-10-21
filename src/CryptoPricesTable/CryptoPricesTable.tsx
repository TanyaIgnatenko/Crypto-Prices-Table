import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from '@table-library/react-table-library/table';
import { usePagination } from '@table-library/react-table-library/pagination';
import { Action } from '@table-library/react-table-library/types/common';
import { Group, Pagination } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

import { ReactComponent as ArrowUpIcon } from '../assets/icons/arrow-up.svg';
import { ReactComponent as ArrowDownIcon } from '../assets/icons/arrow-down.svg';
import { useRealtimePricesUpdates } from './useRealtimePricesUpdates';
import { useTableTheme } from './useTableTheme';
import { CHART_OPTIONS } from './chartSettings';
import { fetchCoins } from './fetchData';
import { Cryptocurrency } from './types';

import './CryptoPricesTable.css';

Chart.register(...registerables);

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatPriceChange(priceChange: number) {
  return Math.abs(Math.round(priceChange * 10) / 10).toFixed(2) + '%';
}

const TABLE_PAGE_SIZE = 15;
const TOTAL_CRYPTOCURRENCY_COUNT = 2296;

const CHART_HEIGHT = 54;

export const CryptoPricesTable = () => {
  const [data, setData] = useState<{ nodes: Cryptocurrency[] }>({ nodes: [] });
  const [isFetchError, setIsFetchError] = useState(false);

  useEffect(() => {
    fetchCoins(1, TABLE_PAGE_SIZE)
      .then(data => setData({ nodes: data }))
      .catch(() => setIsFetchError(true));
  }, []);

  const onPaginationChange = ({ payload: { page } }: Action) => {
    fetchCoins(page, TABLE_PAGE_SIZE)
      .then(data => setData({ nodes: data }))
      .catch(() => setIsFetchError(true));
  };
  const pagination = usePagination(data, {
    state: {
      page: 1,
      size: TABLE_PAGE_SIZE,
    },
    onChange: onPaginationChange,
  });

  const handleCryptocurrenciesChange = useCallback(
    (cryptocurrencies: Cryptocurrency[]) => {
      setData({ nodes: cryptocurrencies });
    },
    [],
  );
  useRealtimePricesUpdates(data.nodes, handleCryptocurrenciesChange);

  const theme = useTableTheme();
  const tableOptions = useMemo(() => {
    return {
      custom: true,
      horizontalScroll: true,
    };
  }, []);

  return isFetchError ? (
    <p className='error-msg'>Server Error</p>
  ) : (
    <div className='table-container'>
      <Table data={data} theme={theme} layout={tableOptions}>
        {(tableList: Cryptocurrency[]) => (
          <>
            <Header>
              <HeaderRow>
                <HeaderCell pinLeft>Rank</HeaderCell>
                <HeaderCell pinLeft>Name</HeaderCell>
                <HeaderCell>Price</HeaderCell>
                <HeaderCell>Change (24Hr)</HeaderCell>
                <HeaderCell>Change (7d)</HeaderCell>
                <HeaderCell>Market Cap</HeaderCell>
                <HeaderCell>Last 7 days</HeaderCell>
              </HeaderRow>
            </Header>

            <Body>
              {tableList.map(item => {
                const is24hChangePositive = +item.changePercent24Hr > 0;
                const is7dChangePositive = item.changePercent7d > 0;

                const priceChartData = {
                  labels: item.sprakline7d.map((v, i) => i),
                  datasets: [
                    {
                      data: item.sprakline7d,
                      borderColor: 'rgb(75, 202, 129)',
                      borderWidth: 1,
                      backgroundColor: 'rgba(75, 202, 129, 0.1)',
                      fill: true,
                    },
                  ],
                };

                return (
                  <Row key={item.id} item={item}>
                    <div className='row'>
                      <Cell pinLeft>{item.rank}</Cell>
                      <Cell pinLeft>
                        <img
                          alt=''
                          className='crypto-icon'
                          src={`https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`}
                        />
                        {item.name}&nbsp;
                        <span className='crypto-symbol'>{item.symbol}</span>
                      </Cell>
                      <Cell>{priceFormatter.format(+item.priceUsd)}</Cell>
                      <Cell className={is24hChangePositive ? 'green' : 'red'}>
                        {is24hChangePositive ? (
                          <ArrowUpIcon className='arrow-icon' />
                        ) : (
                          <ArrowDownIcon className='arrow-icon' />
                        )}
                        &nbsp;
                        {formatPriceChange(+item.changePercent24Hr)}
                      </Cell>
                      <Cell className={is7dChangePositive ? 'green' : 'red'}>
                        {is7dChangePositive ? (
                          <ArrowUpIcon className='arrow-icon' />
                        ) : (
                          <ArrowDownIcon className='arrow-icon' />
                        )}
                        &nbsp;
                        {priceFormatter.format(Math.abs(item.changePercent7d))}
                      </Cell>
                      <Cell>{priceFormatter.format(+item.marketCapUsd)}</Cell>
                      <Cell>
                        <Line
                          options={CHART_OPTIONS}
                          data={priceChartData}
                          height={CHART_HEIGHT}
                        />
                      </Cell>
                    </div>
                  </Row>
                );
              })}
            </Body>
          </>
        )}
      </Table>
      <Group position='right' mx={10} my={5}>
        <Pagination
          total={TOTAL_CRYPTOCURRENCY_COUNT / TABLE_PAGE_SIZE}
          page={pagination.state.page}
          onChange={pagination.fns.onSetPage}
        />
      </Group>
    </div>
  );
};
