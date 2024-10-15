import React from 'react';
import Image from 'next/image';
import { FaShare, FaTrash } from 'react-icons/fa';

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
    volatilityPercent: number;
    recommendation: string;
    actionInsight: string;
  };
  onClose: () => void;
  removeStock: (ticker:string) => void;
}

const StockInspector: React.FC<StockInspectorProps> = ({ stock, onClose, removeStock }) => {
  function getVolPercent(percent: number): string {
    if (percent <= 10) {
      return 'bg-[##1AD598] w-1/5';
    } else if (percent <= 25) {
      return 'bg-[#F9B035] w-1/3';
    } else if (percent <= 50) {
      return 'bg-[#F9B035] w-1/2';
    } else if (percent <= 75) {
      return 'bg-[#F96767] w-3/4'; 
    } else {
      return 'bd-[##BDC6CC] w-full';
    }
  }
  return (
    <div className="w-auto bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out transform">
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
              <p className="bg-green-500 text-white px-2 py-1 rounded font-bold text-center">{stock.rating}</p>
            </div>
            <div className='flex-col mr-4'>
              <p className='text-xs font-bold'>Signal:</p>
              <p className="bg-green-400 text-white px-2 py-1 rounded font-bold text-center">{stock.recommendation}</p>
            </div>
          </div>
          <p className='text-sm font-bold mb-1'>{stock.volatility}</p>
          <div className='h-1.5 bg-[#F6EFFF] w-auto'><div className={`h-1.5 ${getVolPercent(stock.volatilityPercent)}`}/></div>
          <p className='font-bold text-xs mt-3'>Action Insight:</p>
          <p className='font-bold text-green-600 text-xs'>{stock.actionInsight}</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="flex items-center justify-center bg-purple-100 text-purple-600 px-4 py-2 rounded-full mr-3">
          <FaShare />
        </button>
        <button className="flex items-center justify-center bg-red-100 text-red-600 px-4 py-2 rounded-full" onClick={() => removeStock(stock.ticker)}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default StockInspector;
