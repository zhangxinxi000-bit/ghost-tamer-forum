import React from 'react';

interface ForumPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const ForumPagination: React.FC<ForumPaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
}) => {
  const totalPages: number = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible: number = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i: number = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    let start: number = Math.max(2, page - 1);
    let end: number = Math.min(totalPages - 1, page + 1);

    if (page <= 3) {
      end = maxVisible - 1;
    } else if (page >= totalPages - 2) {
      start = totalPages - (maxVisible - 2);
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i: number = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  const pages: (number | string)[] = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 text-sm bg-[#141414] border border-[#262626] text-[#a3a3a3] rounded-sm hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-40 disabled:hover:border-[#262626] disabled:hover:text-[#a3a3a3] disabled:cursor-not-allowed transition-colors"
      >
        上一页
      </button>

      {pages.map((p: number | string, idx: number) =>
        typeof p === 'number' ? (
          <button
            key={idx}
            onClick={() => onPageChange(p)}
            className={`min-w-[32px] h-8 text-sm rounded-sm border transition-colors ${
              p === page
                ? 'bg-[#d4af37] border-[#d4af37] text-[#0a0a0a] font-medium'
                : 'bg-[#141414] border-[#262626] text-[#a3a3a3] hover:border-[#d4af37] hover:text-[#d4af37]'
            }`}
          >
            {p}
          </button>
        ) : (
          <span
            key={idx}
            className="min-w-[32px] h-8 flex items-center justify-center text-[#737373] text-sm"
          >
            {p}
          </span>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1 text-sm bg-[#141414] border border-[#262626] text-[#a3a3a3] rounded-sm hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-40 disabled:hover:border-[#262626] disabled:hover:text-[#a3a3a3] disabled:cursor-not-allowed transition-colors"
      >
        下一页
      </button>
    </div>
  );
};

export default ForumPagination;
