import React from 'react';
import Image from 'next/image';
import { FaShare, FaTrash, FaStar, FaCheck } from 'react-icons/fa';

interface Stock {
  logo: string;
  companyName: string;
  ticker: string;
  currentPrice: string;
  revenue: string;
  eps: string;
  peRatio: number;
  dividendYield: number;
  finalGrade: string;
  volatilityRating: string;
  volatilityPercentage: number;
  recommendation: string;
}

interface StockInspectorProps {
  stocks: Stock[];
  watchlist: string[];
  onClose: () => void;
  removeStock: (ticker: string) => void;
  removeFromHistory: (ticker: string) => void;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
}

const StockInspector: React.FC<StockInspectorProps> = ({ 
  stocks, 
  watchlist,
  onClose, 
  removeFromHistory, 
  addToWatchlist,
  removeFromWatchlist
}) => {
  function getVolPercent(percent: number): string {
    if (percent <= 10) {
      return 'bg-[#1AD598] w-1/5';
    } else if (percent <= 25) {
      return 'bg-[#F9B035] w-1/3';
    } else if (percent <= 50) {
      return 'bg-[#F9B035] w-1/2';
    } else if (percent <= 75) {
      return 'bg-[#F96767] w-3/4'; 
    } else {
      return 'bg-[#BDC6CC] w-full';
    }
  }

  function getRatingColor(grade: string) {
    const gradeUpperCase = grade.toUpperCase()
    switch (gradeUpperCase) {
      case 'A':
        return 'bg-green-500'
      case 'B':
        return 'bg-blue-500'
      case 'C':
        return 'bg-yellow-500'
      case 'D':
        return 'bg-orange-500'
      case 'F':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  function getSignalColor(signal: string) {
    const signalLowerCase = signal.toLowerCase()
    switch (signalLowerCase) {
      case 'buy':
      case 'strong buy':
        return 'bg-green-500'
      case 'hold':
        return 'bg-yellow-500'
      case 'sell':
      case 'strong sell':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="w-auto bg-transparent rounded-lg transition-all duration-300 ease-in-out transform overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Stock Inspector</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {stocks.map((stock, index) => (
        <div key={index} className="bg-white mb-6 rounded-lg shadow-md mt-6 p-6">
          <div className="flex-2 justify-between items-center ">
            <div className="flex items-center w-full">
              <Image src={stock.logo ? stock.logo : './placeholder-image.png'} alt={stock.companyName} width={48} height={48} className="rounded-2xl mr-4" />
              <div className='flex-1'>
                <h3 className="font-bold">{stock.companyName}</h3>
                <p className="text-gray-500">{stock.ticker}</p>
              </div>
              <div className='w-full flex-1 justify-center align-middle'>
                <p className="ml-auto text-xl font-bold">${stock.currentPrice}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className='border-r border-black'>
              <h4 className="font-semibold mb-2">Financials</h4>
              <p className='text-lg font-bold'>{stock.revenue}</p>
              <p className='text-xs font-bold'>Revenue</p>
              <p className='text-lg font-bold'>{stock.eps}</p>
              <p className='text-xs font-bold'>EPS</p>
              <p className='text-lg font-bold'>{stock.peRatio}</p>
              <p className='text-xs font-bold'>P/E</p>
              <p className='text-lg font-bold'>{stock.dividendYield ? stock.dividendYield : 'N/A'}</p>
              <p className='text-xs font-bold'>Dividend Yield</p>
            </div>
            <div className='ml-2'>
              <h4 className="font-semibold mb-2">Asset Report</h4>
              <div className='flex-row flex justify-between mb-5'>
                <div className='flex-col mr-4'>
                  <p className='text-xs font-bold'>Rating: </p>
                  <p className={`${getRatingColor(stock.finalGrade)} text-white px-2 py-1 rounded font-bold text-center`}>
                    {stock.finalGrade}
                  </p>
                </div>
                <div className='flex-col mr-4'>
                  <p className='text-xs font-bold'>Signal:</p>
                  <p className={`${getSignalColor(stock.recommendation)} text-white px-2 py-1 rounded font-bold text-center`}>
                    {stock.recommendation}
                  </p>
                </div>
              </div>
              <p className='text-sm font-bold mb-1'>{stock.volatilityRating}</p>
              <div className='h-1.5 bg-[#F6EFFF] w-auto'><div className={`h-1.5 ${getVolPercent(stock.volatilityPercentage)}`}/></div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            {watchlist.includes(stock.ticker) ? (
              <button 
                className="flex items-center justify-center bg-green-100 text-green-600 px-4 py-2 rounded-full mr-3"
                onClick={() => removeFromWatchlist(stock.ticker)}
              >
                <FaCheck className="mr-2" />
                In Watchlist
              </button>
            ) : (
              <button 
                className="flex items-center justify-center bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full mr-3"
                onClick={() => addToWatchlist(stock.ticker)}
              >
                <FaStar className="mr-2" />
                Add to Watchlist
              </button>
            )}
            <button className="flex items-center justify-center bg-purple-100 text-purple-600 px-4 py-2 rounded-full mr-3">
              <FaShare />
            </button>
            <button 
              className="flex items-center justify-center bg-red-100 text-red-600 px-4 py-2 rounded-full" 
              onClick={() => removeFromHistory(stock.ticker)}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockInspector;
