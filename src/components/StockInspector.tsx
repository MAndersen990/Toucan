import React from 'react';
import Image from 'next/image';
import { FaAppStore, FaTrash } from 'react-icons/fa';

interface StockInspectorProps {
  stock: {
    logo: string;
    companyName: string;
    ticker: string;
    currentPrice: string;
    revenue: string;
    eps: string;
    peRatio: number;
    dividendYield: number;
    rating: string;
    volatility: string;
    recommendation: string;
    actionInsight: string;
  };
  onClose: () => void;
}

const StockInspector: React.FC<StockInspectorProps> = ({ stock, onClose }) => {
    console.log(stock)
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out transform">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Stock Inspector</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center mb-4">
        <Image src={stock.logo} alt={stock.companyName} width={48} height={48} className="rounded-2xl mr-4" />
        <div>
          <h3 className="font-bold">{stock.companyName}</h3>
          <p className="text-gray-500">{stock.ticker}</p>
        </div>
        <p className="ml-auto text-xl font-bold">${stock.currentPrice}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-semibold mb-2">Financials</h4>
          <p>Revenue: {stock.revenue}</p>
          <p>EPS: ${stock.eps}</p>
          <p>P/E: {stock.peRatio}</p>
          <p>Dividend Yield: {stock.dividendYield}%</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Asset Report</h4>
          <p>Rating: <span className="bg-green-500 text-white px-2 py-1 rounded">{stock.rating}</span></p>
          <p>Current Signal: <span className="bg-green-400 text-white px-2 py-1 rounded">{stock.recommendation}</span></p>
          <p>Volatility: {stock.volatility}</p>
          <p>Action Insight: {stock.actionInsight}</p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button className="flex items-center justify-center bg-purple-100 text-purple-600 px-4 py-2 rounded-full">
          <FaAppStore className="mr-2" /> Add to Watchlist
        </button>
        <button className="flex items-center justify-center bg-red-100 text-red-600 px-4 py-2 rounded-full">
          <FaTrash className="mr-2" /> Remove
        </button>
      </div>
    </div>
  );
};

export default StockInspector;
