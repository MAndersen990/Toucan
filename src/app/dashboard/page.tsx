'use client'

import React, { useState, useEffect, useCallback, ReactNode, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { FaThLarge, FaSearch, FaNewspaper, FaLightbulb, FaChartLine, FaWallet, FaEnvelope, FaBell, FaComments, FaCog, FaSignOutAlt } from 'react-icons/fa'
import axios from 'axios'
import { subYears, format } from 'date-fns'
import debounce from 'lodash/debounce'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Stock {
  ticker: string
  companyName: string
  percentageChange: string
  finalGrade: string
  recommendation: string
  volatilityRating: string
  currentPrice: string
  historicalPrices: number[]
}

interface SearchMatch {
  symbol: string
  name: string
}

interface ChartDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  borderWidth: number
  fill: boolean
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

interface Suggestion {
  ticker: string
  name: string
}

interface InsightItemProps {
  icon: React.ReactNode
  text: string
  badge?: number
  badgeColor?: string
}

function DashboardPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [checkedStocks, setCheckedStocks] = useState<string[]>([])
  const [chartData, setChartData] = useState<ChartData>({
    labels: Array.from({ length: 12 }, (_, i) => new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' })),
    datasets: [],
  })

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']

  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof Stock | keyof Stock; direction: 'asc' | 'desc' }>({ key: 'ticker', direction: 'asc' });


  const API_KEY = 'I5jif7iRRz8vBxvOgVZ0Sh9y59oXfAJh'

  const getSuggestions = useCallback(
    debounce(async (text: string) => {
      if (text.length > 0) {
        try {
          const response = await axios.get(`https://financialmodelingprep.com/api/v3/search?query=${text}&limit=10&apikey=${API_KEY}`)
          const matches = response.data || []
          setSuggestions(matches.map((match: SearchMatch) => ({
            ticker: match.symbol,
            name: match.name
          })))
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        }
      } else {
        setSuggestions([])
      }
    }, 300),
    []
  )

  const handleSearchChange = (text: string) => {
    setSearch(text)
    getSuggestions(text)
  }

  const selectSuggestion = async (item: { ticker: string, name: string }) => {
    setSearch('')
    setSuggestions([])
    await searchStocks(item.ticker)
  }

  const searchStocks = async (ticker: string) => {
    if (!ticker) return
    
    setIsLoading(true)
    try {
      const currentDate = new Date()
      const oneYearAgo = subYears(currentDate, 1)
      const fromDate = format(oneYearAgo, 'yyyy-MM-dd')
      const toDate = format(currentDate, 'yyyy-MM-dd')

      const fmpResponse = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}`, {
        params: {
          from: fromDate,
          to: toDate,
          apikey: API_KEY
        }
      })

      const historicalData = fmpResponse.data.historical

      // Fetch analysis data from Firebase function
      const firebaseResponse = await axios.get(`https://us-central1-alphaorbit-2cf88.cloudfunctions.net/analyzeStocks?tickers=${ticker.toUpperCase()}`)
      const analysisData = firebaseResponse.data.stockData[0]

      if (historicalData && historicalData.length > 0 && analysisData) {
        const newStock: Stock = {
          ticker: analysisData.ticker,
          companyName: analysisData.company_name,
          percentageChange: Number(analysisData.percentage_change).toFixed(2),
          finalGrade: analysisData.final_grade,
          recommendation: analysisData.recommendation,
          volatilityRating: analysisData.volatility_rating,
          currentPrice: Number(analysisData.current_price).toFixed(2),
          historicalPrices: historicalData.map((day: { close: number }) => day.close).reverse()
        }

        setStocks(prevStocks => {
          const updatedStocks = prevStocks.some(stock => stock.ticker === newStock.ticker)
            ? prevStocks.map(stock => stock.ticker === newStock.ticker ? newStock : stock)
            : [newStock, ...prevStocks]
          
          const newCheckedStocks = [...new Set([...checkedStocks, newStock.ticker])]
          setCheckedStocks(newCheckedStocks)
          updateChartData(updatedStocks, newCheckedStocks)
          
          return updatedStocks
        })
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Simulating fetched data
    const mockStocks: Stock[] = [
      {
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        percentageChange: '2.5',
        finalGrade: 'A',
        recommendation: 'Buy',
        volatilityRating: 'Low',
        currentPrice: '150.25',
        historicalPrices: [140, 145, 148, 152, 149, 155, 158, 160, 157, 159, 162, 165],
      },
    ]
    setStocks(mockStocks)
    setCheckedStocks(mockStocks.map(stock => stock.ticker))
  }, [])

  useEffect(() => {
    updateChartData(stocks, checkedStocks)
  }, [stocks, checkedStocks])

  function updateChartData(currentStocks: Stock[], checkedTickers: string[]) {
    const newDatasets = currentStocks
      .filter(stock => checkedTickers.includes(stock.ticker))
      .map((stock, index) => ({
        label: stock.ticker,
        data: stock.historicalPrices,
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}33`,
        borderWidth: 2,
        fill: true,
      }))

    setChartData(prev => ({
      ...prev,
      datasets: newDatasets,
    }))
  }

  function toggleStockCheck(ticker: string) {
    setCheckedStocks(prev => {
      const newCheckedStocks = prev.includes(ticker)
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
      return newCheckedStocks
    })
  }

  const deleteStock = (ticker: string) => {
    setStocks(prevStocks => {
      const updatedStocks = prevStocks.filter(stock => stock.ticker !== ticker)
      setCheckedStocks(prev => {
        const newCheckedStocks = prev.filter(t => t !== ticker)
        updateChartData(updatedStocks, newCheckedStocks)
        return newCheckedStocks
      })
      return updatedStocks
    })
  }
  const isNumber = (value: string | number[]) => !isNaN(Number(value));
  const handleSort = (key: keyof Stock) => {
    let direction: 'asc' | 'desc' = 'desc'; // Default to descending on the first click
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'; // Toggle back to ascending if already sorted in descending order
    }
    setSortConfig({ key, direction });
  };

  const sortedStocks = useMemo(() => {
    if (sortConfig.key) {
      return [...stocks].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (isNumber(aValue) && isNumber(bValue)) {
          // If sorting numeric columns
          const aNum = parseFloat(aValue as string);
          const bNum = parseFloat(bValue as string);

          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum; // Ascending or descending for numbers
        } else {
          // If sorting text columns
          const aText = (aValue as string).toLowerCase();
          const bText = (bValue as string).toLowerCase();

          if (sortConfig.direction === 'asc') {
            return aText < bText ? 1 : -1;
          }
          return aText > bText ? 1 : -1; // Ascending or descending for text
        }
      });
    }
    return stocks;
  }, [stocks, sortConfig]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <div className="flex items-center mb-6">
            <img src="./AlphaOrbit.png" alt="AlphaOrbit" className="w-8 h-8 mr-2" />
            <span className="text-xl font-bold">AlphaOrbit</span>
          </div>
          <nav>
            <NavItem icon={<FaThLarge />} text="Dashboard" active />
            <NavItem icon={<FaSearch />} text="Research" />
            <NavItem icon={<FaNewspaper />} text="News" />
            <NavItem icon={<FaLightbulb />} text="Strategy" />
            <NavItem icon={<FaChartLine />} text="Portfolio" />
            <NavItem icon={<FaWallet />} text="Wallet" />
          </nav>
        </div>
        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Insights</h3>
          <InsightItem icon={<FaEnvelope />} text="Messages" badge={12} badgeColor="red" />
          <InsightItem icon={<FaBell />} text="Notifications" badge={6} badgeColor="gray" />
          <InsightItem icon={<FaComments />} text="Chat" badge={6} badgeColor="red" />
        </div>
        <div className="p-4 bg-pink-100 mx-4 rounded-3xl">
          <h3 className="text-sm font-semibold mb-2">All Portfolio Activity</h3>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-3xl font-bold">350</p>
              <p className="text-xs text-gray-500">Total Stocks</p>
            </div>
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              +7% this Week
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2">Last Trade: 8/20/24</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">$2,300</p>
              <p className="text-xs text-gray-500">Amount Invested</p>
            </div>
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              <p className="font-bold">+32%</p>
              <p>All Time</p>
            </div>
          </div>
        </div>
        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between">
            <img src="/avatar.png" alt="User" className="w-10 h-10 rounded-full" />
            <div className="flex">
              <button className="text-gray-500 hover:text-gray-700 mr-2">
                <FaCog />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Watchlist</h2>
          <p className="text-green-500 font-semibold mb-4">+48% Today</p>
          <div className="h-64">
            <Line data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                },
              },
            }} />
          </div>
          <div className="flex flex-wrap justify-center mt-4">
            {chartData.datasets.map((dataset, index) => (
              <div key={index} className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: dataset.borderColor }}></div>
                <span className="text-sm">{dataset.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search Company or Ticker(s)"
                className="border rounded px-3 py-2 w-full"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {suggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((item: Suggestion) => (
                    <div
                      key={item.ticker}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSuggestion(item)}
                    >
                      <p className="text-sm">{item.ticker} - {item.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">
              Filter ▼
            </button>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex justify-center items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
              <p className="ml-4 text-lg font-semibold">Fetching stock data...</p>
            </div>
          )}

<table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="py-2 px-4 text-left cursor-pointer"
                  onClick={() => handleSort('companyName')}
                >
                  Company Name / Ticker
                  <span className="ml-2 w-4 inline-block">
                    {sortConfig.key === 'companyName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ' '}
                  </span>
                </th>
                <th
                  className="py-2 px-4 text-center cursor-pointer"
                  onClick={() => handleSort('percentageChange')}
                >
                  +/- Gain
                  <span className="ml-2 w-4 inline-block">
                    {sortConfig.key === 'percentageChange' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ' '}
                  </span>
                </th>
                <th
                  className="py-2 px-4 text-center cursor-pointer"
                  onClick={() => handleSort('finalGrade')}
                >
                  Rating
                  <span className="ml-2 w-4 inline-block">
                    {sortConfig.key === 'finalGrade' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ' '}
                  </span>
                </th>
                <th
                  className="py-2 px-4 text-center cursor-pointer"
                  onClick={() => handleSort('recommendation')}
                >
                  Signal
                  <span className="ml-2 w-4 inline-block">
                    {sortConfig.key === 'recommendation' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ' '}
                  </span>
                </th>
                <th
                  className="py-2 px-4 text-center cursor-pointer"
                  onClick={() => handleSort('volatilityRating')}
                >
                  Volatility
                  <span className="ml-2 w-4 inline-block">
                    {sortConfig.key === 'volatilityRating' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ' '}
                  </span>
                </th>
                <th
                  className="py-2 px-4 text-center cursor-pointer"
                  onClick={() => handleSort('currentPrice')}
                >
                  Current Price
                  <span className="ml-2 w-4 inline-block">
                    {sortConfig.key === 'currentPrice' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ' '}
                  </span>
                </th>
                <th className="py-2 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map((stock) => (
                <tr key={stock.ticker} className="border-b">
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={checkedStocks.includes(stock.ticker)}
                        onChange={() => toggleStockCheck(stock.ticker)}
                        className="mr-2"
                      />
                      <div>
                        <p className="font-semibold">{stock.companyName}</p>
                        <p className="text-sm text-gray-500">{stock.ticker}</p>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`py-2 px-4 text-center ${parseFloat(stock.percentageChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {stock.percentageChange}%
                  </td>
                  <td className="py-2 px-4 text-center">{stock.finalGrade}</td>
                  <td className="py-2 px-4 text-center">{stock.recommendation}</td>
                  <td className="py-2 px-4 text-center">{stock.volatilityRating}</td>
                  <td className="py-2 px-4 text-center">${stock.currentPrice}</td>
                  <td className="py-2 px-4 text-center">
                    <button
                       onClick={() => deleteStock(stock.ticker)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Featured Section */}
      <aside className="w-64 bg-gray-50 p-6">
        <h2 className="text-xl font-bold mb-4">Featured Portfolios</h2>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-semibold">Battery Tech</h3>
          <p className="text-sm text-gray-500">By Stock Guys Inc.</p>
          <p className="text-sm text-orange-500">Moderate</p>
        </div>
        <button className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-2 px-4 rounded">
          Shop Portfolios
        </button>
      </aside>
    </div>
  )
}

function NavItem({ icon, text, active = false }: { icon: ReactNode; text: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center py-2 px-4 rounded-lg mb-1 ${
        active ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </a>
  )
}

function InsightItem({ icon, text, badge, badgeColor }: InsightItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <span className="mr-3 text-gray-500">{icon}</span>
        <span className="text-gray-700">{text}</span>
      </div>
      <span className={`bg-${badgeColor}-500 text-white text-xs px-2 py-1 rounded-full`}>
        {badge}
      </span>
    </div>
  )
}

export default DashboardPage