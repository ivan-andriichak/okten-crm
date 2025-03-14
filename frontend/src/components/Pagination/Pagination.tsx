import  { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage = 25, onPageChange }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}>
        Previous
      </button>
      <span style={{ margin: '0 10px' }}>Page {currentPage}</span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={totalItems < itemsPerPage}>
        Next
      </button>
    </div>
  );
};

export default Pagination;