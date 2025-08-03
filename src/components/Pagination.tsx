import React, { useState } from 'react';
import { FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from 'react-icons/fi';

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [inputPage, setInputPage] = useState(page.toString());

  const handleJump = () => {
    const num = parseInt(inputPage, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onPageChange(num);
    } else {
      setInputPage(page.toString());
    }
  };

  // 生成页码按钮（最多显示7个，含省略号）
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/90 dark:bg-gray-900/90 shadow-2xl rounded-2xl px-6 py-4 flex md:flex-nowrap flex-wrap items-center justify-between gap-2 border border-gray-100 dark:border-gray-700 mt-8">
      <div className="flex md:flex-nowrap flex-wrap items-center gap-2">
        <button
          className="flex items-center px-2.5 py-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-medium shadow-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-sm cursor-pointer"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <FiChevronsLeft className="mr-1" /> 首页
        </button>
        <button
          className="flex items-center px-2.5 py-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-medium shadow-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-sm cursor-pointer"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <FiChevronLeft className="mr-1" /> 上一页
        </button>
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((p, idx) =>
            p === '...'
              ? <span key={idx} className="px-2 text-gray-400">...</span>
              : <button
                key={p}
                className={`w-9 h-9 rounded-full font-bold transition-all duration-150 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 ${p === page
                    ? 'bg-blue-600 text-white shadow-lg scale-110 border-2 border-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer'
                  }`}
                onClick={() => onPageChange(Number(p))}
                disabled={p === page}
              >
                {p}
              </button>
          )}
        </div>
        <button
          className="flex items-center px-2.5 py-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-medium shadow-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-sm cursor-pointer"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          下一页 <FiChevronRight className="ml-1" />
        </button>
        <button
          className="flex items-center px-2.5 py-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-medium shadow-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-sm cursor-pointer"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          末页 <FiChevronsRight className="ml-1" />
        </button>
      </div>
      <div className="flex md:flex-nowrap flex-wrap items-center gap-2">
        <span className="text-gray-600 dark:text-gray-300">跳转</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={e => setInputPage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleJump(); }}
          className="w-12 px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm text-sm"
        />
        <span className="text-gray-600 dark:text-gray-300">页</span>
        <button
          className="px-3 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-semibold shadow transition-all duration-150 text-sm cursor-pointer  "
          onClick={handleJump}
        >
          跳转
        </button>
      </div>
      {onPageSizeChange && (
        <div className="flex md:flex-nowrap flex-wrap items-center gap-2">
          <span className="text-gray-600 dark:text-gray-300">每页</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm text-sm cursor-pointer"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-gray-600 dark:text-gray-300">条</span>
        </div>
      )}
      <div className="text-gray-500 dark:text-gray-400 ml-auto font-medium whitespace-nowrap">
        共 <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{total}</span> 条记录
      </div>
    </div>
  );
} 