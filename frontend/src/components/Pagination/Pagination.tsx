import React from 'react';
import Button from '../Button/Button';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (newPage: number) => void;
  total?: any;
}

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage = 25,
  onPageChange,
}: PaginationProps) => {
  const totalPages = React.useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  );

  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    const isFirstHalf = currentPage <= Math.floor(totalPages / 2);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (isFirstPage) {
        items.push(1, 2, 3, 4, 5, 6, 7, '...', totalPages);
      } else if (isLastPage) {
        items.push(
          1,
          '...',
          totalPages - 6,
          totalPages - 5,
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else if (isFirstHalf) {
        items.push(1, 2, 3, 4, 5, 6, 7, '...', totalPages);
      } else {
        items.push(
          1,
          '...',
          totalPages - 6,
          totalPages - 5,
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      }
    }

    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <div
      style={{
        margin: '20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}>
      {currentPage > 1 && (
        <Button
          variant="primary"
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            padding: 0,
          }}>
          ←
        </Button>
      )}

      {paginationItems.map((item, index) => (
        <Button
          key={index}
          variant={item === currentPage ? 'secondary' : 'primary'}
          onClick={() => typeof item === 'number' && onPageChange(item)}
          disabled={typeof item !== 'number'}
          style={{
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: typeof item === 'number' ? 'pointer' : 'default',
          }}>
          {item}
        </Button>
      ))}

      {currentPage < totalPages && (
        <Button
          variant="primary"
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            padding: 0,
          }}>
          →
        </Button>
      )}
    </div>
  );
};

export { Pagination };
