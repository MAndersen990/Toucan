'use client'

import React, { useState, useEffect, useCallback, ReactNode, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { FaThLarge, FaSearch, FaNewspaper, FaLightbulb, FaChartLine, FaWallet, FaEnvelope, FaBell, FaComments, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa'
import axios from 'axios'
import { format, subMonths } from 'date-fns'
import debounce from 'lodash/debounce'
import { useFirebase } from '../../contexts/FirebaseContext'

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

// Update the type definition for userData if not already defined
interface UserData {
  name?: string;
  watchlist: string[];
}

function DashboardPage() {
  const { user, getUserData, addToWatchlist, removeFromWatchlist, logout } = useFirebase()
  // Ensure the initial state matches this type
  const [userData, setUserData] = useState<UserData | null>(null)
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

  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]); // To store filtered data
  const [filterType, setFilterType] = useState(''); // For tracking filter type (Volatility, Rating, Signal)
  const [filterValue, setFilterValue] = useState(''); // For tracking the filter value
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Track filter dropdown visibility
  const [filterOptions, setFilterOptions] = useState<string[]>([]);

  const API_KEY = 'uTTgIOsbzexCpY8Smz9olz8SPAOj3ETu'

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUserDataAndStocks = async () => {
      if (user) {
        const data = await getUserData()
        setUserData(data)
        if (data?.watchlist) {
          for (const ticker of data.watchlist) {
            await searchStocks(ticker)
          }
        }
      }
    }
    fetchUserDataAndStocks()
  }, [user])

  const searchStocks = async (ticker: string) => {
    if (!ticker) return
    
    setIsLoading(true)
    try {
      const currentDate = new Date()
      const sixMonthsAgo = subMonths(currentDate, 6)
      const fromDate = format(sixMonthsAgo, 'yyyy-MM-dd')
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
            : [...prevStocks, newStock]
          
          setCheckedStocks(prevCheckedStocks => {
            // Maintain existing checked stocks and add the new one
            return [...new Set([...prevCheckedStocks, newStock.ticker])]
          })
          
          updateChartData(updatedStocks, [...new Set([...checkedStocks, newStock.ticker])])
          setFilteredStocks(updatedStocks)
          
          return updatedStocks
        })
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    
    if (user) {
      try {
        // Check if the ticker is already in the watchlist
        if (userData?.watchlist.includes(item.ticker)) {
          console.log(`${item.ticker} is already in the watchlist`)
          // Optionally, show a message to the user
          return
        }

        await addToWatchlist(item.ticker)
        console.log(`Added ${item.ticker} to watchlist`)
        // Update the local userData state
        setUserData(prevData => {
          if (!prevData) {
            // Handle the case where prevData is null
            return {
              watchlist: [item.ticker],
              name: undefined, // or provide a default value if necessary
              // Add other required properties of UserData with default values
            }
          }
          return {
            ...prevData,
            watchlist: [...prevData.watchlist, item.ticker]
          }
        })
        // Fetch and add the new stock data
        await searchStocks(item.ticker)
      } catch (error) {
        console.error('Error adding to watchlist:', error)
        // Optionally, show an error message to the user
      }
    } else {
      console.log('User not logged in. Unable to add to watchlist.')
      // Optionally, show a message to the user prompting them to log in
    }
  }

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

  const deleteStock = async (ticker: string) => {
    try {
      await removeFromWatchlist(ticker);
      setStocks(prevStocks => {
        const updatedStocks = prevStocks.filter(stock => stock.ticker !== ticker);
        setCheckedStocks(prev => {
          const newCheckedStocks = prev.filter(t => t !== ticker);
          updateChartData(updatedStocks, newCheckedStocks);
          setFilteredStocks(updatedStocks);
          return newCheckedStocks;
        });
        return updatedStocks;
      });
      // Update the local userData state
      setUserData(prevData => {
        if (!prevData) return null; // Handle the case where prevData is null
        return {
          ...prevData,
          watchlist: prevData.watchlist.filter(item => item !== ticker)
        };
      });
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
      // Optionally, show an error message to the user
    }
  };
  
  const handleSort = (key: keyof Stock) => {
    let direction: 'asc' | 'desc' = 'desc'; // Default to descending on the first click
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'; // Toggle back to ascending if already sorted in descending order
    }
    setSortConfig({ key, direction });
  };

  const sortedStocks = useMemo(() => {
    if (sortConfig.key) {
      return [...filteredStocks].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Sort by number
        if (!isNaN(parseFloat(aValue as string)) && !isNaN(parseFloat(bValue as string))) {
          return sortConfig.direction === 'asc'
            ? parseFloat(aValue as string) - parseFloat(bValue as string)
            : parseFloat(bValue as string) - parseFloat(aValue as string);
        }

        // Sort by string
        return sortConfig.direction === 'desc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return filteredStocks;
  }, [filteredStocks, sortConfig]);

  const handleFilter = () => {
    if (!filterType || !filterValue) return; // No filtering if type or value is missing

    const filteredData = stocks.filter((stock) => {
      switch (filterType) {
        case 'Volatility':
          return stock.volatilityRating.toLowerCase() === filterValue.toLowerCase();
        case 'Rating':
          return stock.finalGrade.toLowerCase() === filterValue.toLowerCase();
        case 'Signal':
          return stock.recommendation.toLowerCase() === filterValue.toLowerCase();
        case 'Company Name':
        case 'Ticker':
          return stock.companyName.toLowerCase().includes(filterValue.toLowerCase()) || stock.ticker.toLowerCase().includes(filterValue.toLowerCase());
        default:
          return true;
      }
    });

    setFilteredStocks(filteredData);
  };

  const resetFilter = () => {
    setFilteredStocks(stocks); // Show all stocks again
    setFilterType(''); // Clear filter type and value
    setFilterValue('');
  };

  // Generate unique filter options based on the selected filter type
  useEffect(() => {
    if (filterType) {
      let options: string[] = [];

      switch (filterType) {
        case 'Volatility':
          options = Array.from(new Set(stocks.map((stock) => stock.volatilityRating)));
          break;
        case 'Rating':
          options = Array.from(new Set(stocks.map((stock) => stock.finalGrade)));
          break;
        case 'Signal':
          options = Array.from(new Set(stocks.map((stock) => stock.recommendation)));
          break;
        default:
          options = [];
      }

      setFilterOptions(options); // Update the filter options based on the selected filter type
    } else {
      setFilterOptions([]); // Clear options if no filter type is selected
    }
  }, [filterType, stocks]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center lg:hidden">
        <div className="flex items-center">
          <img src="./AlphaOrbit.png" alt="AlphaOrbit" className="w-8 h-8 mr-2" />
          <span className="text-xl font-bold">AlphaOrbit</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500">
          <FaBars size={24} />
        </button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 lg:hidden">
          <div className="bg-white h-full w-64 p-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500">
                &times;
              </button>
            </div>
            <nav className="mb-6">
              <MobileNavItem icon={<FaThLarge />} text="Dashboard" active />
              <MobileNavItem icon={<FaSearch />} text="Research" />
              <MobileNavItem icon={<FaNewspaper />} text="News" />
              <MobileNavItem icon={<FaLightbulb />} text="Strategy" />
              <MobileNavItem icon={<FaChartLine />} text="Portfolio" />
              <MobileNavItem icon={<FaWallet />} text="Wallet" />
            </nav>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Insights</h3>
              <MobileInsightItem icon={<FaEnvelope />} text="Messages" badge={12} />
              <MobileInsightItem icon={<FaBell />} text="Notifications" badge={6} />
              <MobileInsightItem icon={<FaComments />} text="Chat" badge={6} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar (hidden on mobile) */}
        <aside className="hidden lg:block lg:w-64 bg-white shadow-md h-screen sticky top-0 overflow-y-auto">
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
              <span>{userData?.name}</span>
              <div className="flex">
                <button className="text-gray-500 hover:text-gray-700 mr-2" onClick={() => logout()}>
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
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-4 lg:mb-8">
              <h2 className="text-2xl font-bold mb-2">Watchlist</h2>
              <p className="text-green-500 font-semibold mb-4">+48% Today</p>
              <div className="h-64 lg:h-96 overflow-x-auto">
                <div className="min-w-[600px] h-full">
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
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 lg:p-6 relative">
              {/* Search and filter section */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                <div className="relative w-full lg:max-w-md mb-4 lg:mb-0">
                  <input
                    type="text"
                    placeholder="Search Company or Ticker(s)"
                    className="border rounded px-3 py-2 w-full"
                    value={search}
                    onChange={(e) => {handleSearchChange(e.target.value); setFilterValue(e.target.value);}}
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
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded w-full lg:w-auto"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  Filter ▼
                </button>
              </div>

              {/* Filter dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 w-full lg:w-auto">
                  {/* Filter Type Dropdown */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="block w-full border rounded px-3 py-2 mb-2"
                  >
                    <option value="">Select Filter Type</option>
                    <option value="Volatility">Volatility</option>
                    <option value="Rating">Rating</option>
                    <option value="Signal">Signal</option>
                  </select>

                  {/* Dynamic Filter Value Dropdown */}
                  {filterOptions.length > 0 && (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="block w-full border rounded px-3 py-2 mb-2"
                    >
                      <option value="">Select Value</option>
                      {filterOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex space-x-4 justify-end">
                    {/* Apply Filter Button */}
                    <button
                      onClick={() => {
                        handleFilter();
                        setIsFilterOpen(false); // Close dropdown after applying filter
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Apply Filter
                    </button>

                    {/* Reset Filter Button */}
                    <button onClick={() => {
                        resetFilter();
                        setIsFilterOpen(false); // Close dropdown after applying filter
                      }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
                      Reset Filter
                    </button>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
                  <p className="ml-4 text-lg font-semibold">Fetching stock data...</p>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  {/* Table header */}
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Company Name / Ticker</th>
                      <th className="py-2 px-4 text-center">+/- Gain</th>
                      <th className="py-2 px-4 text-center">Rating</th>
                      <th className="py-2 px-4 text-center">Signal</th>
                      <th className="py-2 px-4 text-center">Volatility</th>
                      <th className="py-2 px-4 text-center">Current Price</th>
                      <th className="py-2 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  {/* Table body */}
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
                        <td className={`py-2 px-4 text-center ${parseFloat(stock.percentageChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
            </div>
          </div>
        </main>

        {/* Featured Section (hidden on mobile) */}
        <aside className="hidden lg:block lg:w-64 bg-gray-50 p-4 lg:p-6">
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

function MobileNavItem({ icon, text, active = false }: { icon: ReactNode; text: string; active?: boolean }) {
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

function MobileInsightItem({ icon, text, badge }: { icon: ReactNode; text: string; badge?: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <span className="mr-3 text-gray-500">{icon}</span>
        <span className="text-gray-700">{text}</span>
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
  )
}

export default DashboardPage