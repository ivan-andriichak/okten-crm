import  { ChangeEvent } from 'react';
import Button from '../Button/Button';
import css from './Filters.module.css';

interface FiltersProps {
  filters: Record<string, string>;
  setFilters: (filters: Record<string, string>) => void;
  myOrdersOnly: boolean;
  setMyOrdersOnly: (value: boolean) => void;
  resetFilters: () => void;
}

const Filters = ({
  filters,
  setFilters,
  myOrdersOnly,
  setMyOrdersOnly,
  resetFilters,
}: FiltersProps) => {

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMyOrdersOnly(e.target.checked);
  };

  return (
    <div className={css.filtersContainer}>
      <label className={css.filterLabel}>
        Name:
        <input
          type="text"
          name="name"
          value={filters.name || ''}
          onChange={handleFilterChange}
          placeholder="Filter by name"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Surname:
        <input
          type="text"
          name="surname"
          value={filters.surname || ''}
          onChange={handleFilterChange}
          placeholder="Filter by surname"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Email:
        <input
          type="text"
          name="email"
          value={filters.email || ''}
          onChange={handleFilterChange}
          placeholder="Filter by email"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Phone:
        <input
          type="text"
          name="phone"
          value={filters.phone || ''}
          onChange={handleFilterChange}
          placeholder="Filter by phone"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Age:
        <input
          type="text"
          name="age"
          value={filters.age || ''}
          onChange={handleFilterChange}
          placeholder="Filter by age"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Course:
        <input
          type="text"
          name="course"
          value={filters.course || ''}
          onChange={handleFilterChange}
          placeholder="Filter by course"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Course Format:
        <input
          type="text"
          name="course_format"
          value={filters.course_format || ''}
          onChange={handleFilterChange}
          placeholder="Filter by course format"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Course Type:
        <input
          type="text"
          name="course_type"
          value={filters.course_type || ''}
          onChange={handleFilterChange}
          placeholder="Filter by course type"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Status:
        <input
          type="text"
          name="status"
          value={filters.status || ''}
          onChange={handleFilterChange}
          placeholder="Filter by status"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Sum:
        <input
          type="text"
          name="sum"
          value={filters.sum || ''}
          onChange={handleFilterChange}
          placeholder="Filter by sum"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Already Paid:
        <input
          type="text"
          name="alreadyPaid"
          value={filters.alreadyPaid || ''}
          onChange={handleFilterChange}
          placeholder="Filter by already paid"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Group:
        <input
          type="text"
          name="group"
          value={filters.group || ''}
          onChange={handleFilterChange}
          placeholder="Filter by group"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Created At:
        <input
          type="text"
          name="created_at"
          value={filters.created_at || ''}
          onChange={handleFilterChange}
          placeholder="Filter by created at (e.g., 2025-03-25)"
          className={css.filterInput}
        />
      </label>
      <label className={css.filterLabel}>
        Manager:
        <input
          type="text"
          name="manager"
          value={filters.manager || ''}
          onChange={handleFilterChange}
          placeholder="Filter by manager"
          className={css.filterInput}
        />
      </label>
      <label className={css.checkboxLabel}>
        <input
          type="checkbox"
          checked={myOrdersOnly}
          onChange={handleCheckboxChange}
        />
        Only my orders
      </label>
      <Button variant="secondary" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  );
};

export { Filters };