// App.tsx
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Table, Pagination, Layout, Typography, Space, Select, Image, Divider, Spin } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import toast, { Toaster } from 'react-hot-toast';
import { ColumnType } from 'antd/es/table';

const { Header, Content } = Layout;
const { Title } = Typography;

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null;
  last_updated: string;
}

type Currency = 'usd' | 'eur';
type CurrencyLabel = 'USD' | 'EUR';
interface CurrencyOption {
  value: Currency;
  label: CurrencyLabel;
}

type Order = 'market_cap_desc' | 'market_cap_asc';
type OrderLabel = 'Market cap descending' | 'Market cap ascending';
interface OrderOption {
  value: Order;
  label: OrderLabel;
}

const PAGINATION_TOTAL = 10000;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];
const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
];

const ORDER_OPTIONS: OrderOption[] = [
  { value: 'market_cap_desc', label: 'Market cap descending' },
  { value: 'market_cap_asc', label: 'Market cap ascending' },
];

const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    toast.error('Error fetching data', { position: 'bottom-left' });
    throw error;
  }
};

interface GetCoinsHookParams {
  currency: Currency;
  order: Order;
  perPage: number;
  page: number;
  sparkline?: boolean;
  enabled?: boolean;
}

const useGetCoins = ({ currency, order, perPage, page, enabled = true, sparkline = false }: GetCoinsHookParams) => {
  const baseUrl = 'https://api.coingecko.com/api/v3/coins/markets';

  const apiUrl = `${baseUrl}?vs_currency=${currency}&order=${order}&per_page=${perPage}&page=${page}&sparkline=${sparkline}`;

  const { data, isLoading, isValidating, mutate } = useSWR(enabled ? apiUrl : null, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    errorRetryCount: 3,
  });

  const coins: Coin[] = data ? data : [];

  return { coins, isLoading, isValidating, mutate };
};

const App: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currency, setCurrency] = useState<Currency>(CURRENCY_OPTIONS[0].value);
  const [order, setOrder] = useState<Order>(ORDER_OPTIONS[0].value);

  const { coins, isLoading } = useGetCoins({
    currency: currency,
    order: order,
    perPage: pageSize,
    page,
  });

  const columns: ColumnType<Coin>[] = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (text: string) => <Image src={text} alt="coin" width={32} placeholder />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string) => text.toUpperCase(),
      responsive: ['lg'],
    },
    {
      title: 'Price',
      dataIndex: 'current_price',
      render: (text: string) => `${text.toString().toUpperCase()} ${currency}`,
      key: 'current_price',
    },
    {
      title: 'Market Cap',
      dataIndex: 'market_cap',
      key: 'market_cap',
      responsive: ['lg'],
    },
    {
      title: 'Circulating Supply',
      dataIndex: 'circulating_supply',
      key: 'circulating_supply',
    },
  ];

  const handleChangeCurrency = (value: Currency) => setCurrency(value);
  const handleChangeOrder = (value: Order) => setOrder(value);
  const handlePageSizeChange = (_: number, value: number) => setPageSize(value);
  const handlePageChange = (page: number) => setPage(page);

  return (
    <Layout style={{ width: '100%', backgroundColor: '#ffffff' }}>
      <Header style={{ backgroundColor: '#ffffff' }}>
        <Title level={2}>Hacken Test Task by Ivan Ivakhnenko</Title>
      </Header>

      <Divider />

      <Spin spinning={isLoading}>
        <Content>
          <Title level={3}>Coins & Markets</Title>

          <Space wrap style={{ marginTop: '20px', marginBottom: '10px' }}>
            <Select
              defaultValue={currency}
              style={{
                width: 'max-width',
              }}
              loading={isLoading}
              onChange={handleChangeCurrency}
              options={CURRENCY_OPTIONS}
            />

            <Select
              defaultValue={order}
              style={{
                width: 'max-width',
              }}
              loading={isLoading}
              onChange={handleChangeOrder}
              options={ORDER_OPTIONS}
            />
          </Space>

          <Table columns={columns} dataSource={coins} rowKey="id" pagination={false} loading={isLoading} />

          <Pagination
            current={page}
            total={PAGINATION_TOTAL}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            style={{ marginTop: '10px', textAlign: 'center', display: 'flex', justifyContent: 'end' }}
          />

          <Title level={3} color="rgba(0, 0, 0, 0.88)">
            App source code
          </Title>

          <CodeMirror
            theme="light"
            value={`// App.tsx\n${code}`}
            style={{ marginTop: '20px' }}
            contentEditable
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            translate="no"
            maxHeight="1000px"
          />

          <Toaster />
        </Content>
      </Spin>
    </Layout>
  );
};

const code: string = `import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Table, Pagination, Layout, Typography, Space, Select, Image, Divider, Spin } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import toast, { Toaster } from 'react-hot-toast';
import { ColumnType } from 'antd/es/table';

const { Header, Content } = Layout;
const { Title } = Typography;

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null;
  last_updated: string;
}

type Currency = 'usd' | 'eur';
type CurrencyLabel = 'USD' | 'EUR';
interface CurrencyOption {
  value: Currency;
  label: CurrencyLabel;
}

type Order = 'market_cap_desc' | 'market_cap_asc';
type OrderLabel = 'Market cap descending' | 'Market cap ascending';
interface OrderOption {
  value: Order;
  label: OrderLabel;
}

const PAGINATION_TOTAL = 10000;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];
const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' },
];

const ORDER_OPTIONS: OrderOption[] = [
  { value: 'market_cap_desc', label: 'Market cap descending' },
  { value: 'market_cap_asc', label: 'Market cap ascending' },
];

const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    toast.error('Error fetching data', { position: 'bottom-left' });
    throw error;
  }
};

interface GetCoinsHookParams {
  currency: Currency;
  order: Order;
  perPage: number;
  page: number;
  sparkline?: boolean;
  enabled?: boolean;
}

const useGetCoins = ({ currency, order, perPage, page, enabled = true, sparkline = false }: GetCoinsHookParams) => {
  const baseUrl = 'https://api.coingecko.com/api/v3/coins/markets';

  const apiUrl = \`\${baseUrl}?vs_currency=\${currency}&order=\${order}&per_page=\${perPage}&page=\${page}&sparkline=\${sparkline}\`;

  const { data, isLoading, isValidating, mutate } = useSWR(enabled ? apiUrl : null, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    errorRetryCount: 3,
  });

  const coins: Coin[] = data ? data : [];

  return { coins, isLoading, isValidating, mutate };
};

const App: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currency, setCurrency] = useState<Currency>(CURRENCY_OPTIONS[0].value);
  const [order, setOrder] = useState<Order>(ORDER_OPTIONS[0].value);

  const { coins, isLoading } = useGetCoins({
    currency: currency,
    order: order,
    perPage: pageSize,
    page,
  });

  const columns: ColumnType<Coin>[] = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (text: string) => <Image src={text} alt="coin" width={32} placeholder />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string) => text.toUpperCase(),
      responsive: ['lg'],
    },
    {
      title: 'Price',
      dataIndex: 'current_price',
      render: (text: string) => \`\${text.toString().toUpperCase()} \${currency}\`,
      key: 'current_price',
    },
    {
      title: 'Market Cap',
      dataIndex: 'market_cap',
      key: 'market_cap',
      responsive: ['lg'],
    },
    {
      title: 'Circulating Supply',
      dataIndex: 'circulating_supply',
      key: 'circulating_supply',
    },
  ];

  const handleChangeCurrency = (value: Currency) => setCurrency(value);
  const handleChangeOrder = (value: Order) => setOrder(value);
  const handlePageSizeChange = (_: number, value: number) => setPageSize(value);
  const handlePageChange = (page: number) => setPage(page);

  return (
    <Layout style={{ width: '100%', backgroundColor: '#ffffff' }}>
      <Header style={{ backgroundColor: '#ffffff' }}>
        <Title level={2}>Hacken Test Task by Ivan Ivakhnenko</Title>
      </Header>

      <Divider />

      <Spin spinning={isLoading}>
        <Content>
          <Title level={3}>Coins & Markets</Title>

          <Space wrap style={{ marginTop: '20px', marginBottom: '10px' }}>
            <Select
              defaultValue={currency}
              style={{
                width: 'max-width',
              }}
              loading={isLoading}
              onChange={handleChangeCurrency}
              options={CURRENCY_OPTIONS}
            />

            <Select
              defaultValue={order}
              style={{
                width: 'max-width',
              }}
              loading={isLoading}
              onChange={handleChangeOrder}
              options={ORDER_OPTIONS}
            />
          </Space>

          <Table columns={columns} dataSource={coins} rowKey="id" pagination={false} loading={isLoading} />

          <Pagination
            current={page}
            total={PAGINATION_TOTAL}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            style={{ marginTop: '10px', textAlign: 'center', display: 'flex', justifyContent: 'end' }}
          />

          <Title level={3} color="rgba(0, 0, 0, 0.88)">
            App source code
          </Title>

          <CodeMirror
            theme="light"
            value={\`// App.tsx\n\${code}\`}
            style={{ marginTop: '20px' }}
            contentEditable
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            translate="no"
            maxHeight="1000px"
          />

          <Toaster />
        </Content>
      </Spin>
    </Layout>
  );
};
`;

export default App;
