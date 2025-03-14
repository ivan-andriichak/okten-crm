import { FC } from 'react';
import Button from '../Button/Button';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: FC<PaginationProps> = ({
                                           currentPage,
                                           totalItems,
                                           itemsPerPage = 25,
                                           onPageChange,
                                         }) => {
  const totalPages = React.useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);
  const isLastPage = currentPage >= totalPages;

  return (
    <div style={{ marginTop: '20px' }}>
      <Button
        variant="primary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span style={{ margin: '0 10px' }}>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="primary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;