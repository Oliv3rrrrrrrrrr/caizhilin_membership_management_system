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
    <div className="w-full max-w-full mx-auto bg-white/90 dark:bg-gray-900/90 shadow-2xl rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col lg:flex-row lg:flex-nowrap items-center justify-between gap-3 sm:gap-4 border border-gray-100 dark:border-gray-700 mt-6 sm:mt-8">
      {/* 导航按钮组 */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start gap-1 sm:gap-2 w-full lg:w-auto">
        <button
          className="flex items-center px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-medium shadow-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <FiChevronsLeft className="mr-0.5 sm:mr-1 text-xs sm:text-sm" />
          <span className="hidden sm:inline">首页</span>
          <span className="sm:hidden">首</span>
        </button>
        <button
          className="flex items-center px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-medium shadow-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <FiChevronLeft className="mr-0.5 sm:mr-1 text-xs sm:text-sm" />
          <span className="hidden sm:inline">上一页</span>
          <span className="sm:hidden">上</span>
        </button>
        
        {/* 页码按钮 */}
        <div className="flex items-center gap-0.5 sm:gap-1 mx-1 sm:mx-2">
          {getPageNumbers().map((p, idx) =>
            p === '...'
              ? <span key={idx} className="px-1 sm:px-2 text-gray-400 dark:text-gray-500 text-xs sm:text-sm">...</span>
              : <button
                key={p}
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full font-bold transition-all duration-150 text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 ${p === page
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
          className="flex items-center px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-medium shadow-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <span className="hidden sm:inline">下一页</span>
          <span className="sm:hidden">下</span>
          <FiChevronRight className="ml-0.5 sm:ml-1 text-xs sm:text-sm" />
        </button>
        <button
          className="flex items-center px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900 font-medium shadow-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <span className="hidden sm:inline">末页</span>
          <span className="sm:hidden">末</span>
          <FiChevronsRight className="ml-0.5 sm:ml-1 text-xs sm:text-sm" />
        </button>
      </div>

      {/* 右侧控制区域 */}
      <div className="flex flex-col sm:flex-row lg:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
        {/* 跳转控制 */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">跳转</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={e => setInputPage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleJump(); }}
            className="w-10 sm:w-12 px-1 sm:px-2 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm text-xs sm:text-sm"
          />
          <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">页</span>
          <button
            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-semibold shadow transition-all duration-150 text-xs sm:text-sm cursor-pointer"
            onClick={handleJump}
          >
            <span className="hidden sm:inline">跳转</span>
            <span className="sm:hidden">跳</span>
          </button>
        </div>

        {/* 每页条数选择 */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">每页</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="px-1 sm:px-2 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm text-xs sm:text-sm cursor-pointer"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">条</span>
          </div>
        )}

        {/* 总记录数 */}
        <div className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap text-xs sm:text-sm lg:ml-auto">
          共 <span className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-lg">{total}</span> 条记录
        </div>
      </div>
    </div>
  );
} 