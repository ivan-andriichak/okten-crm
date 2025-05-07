import { ChangeEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, fetchGroups } from '../../store';
import css from './Filters.module.css';
import resetImage from '../../images/reset.png';
import excel from '../../images/excel.png';

interface FiltersProps {
  filters: Record<string, string>;
  setFilters: (filters: Record<string, string>) => void;
  myOrdersOnly: boolean;
  setMyOrdersOnly: (value: boolean) => void;
  resetFilters: () => void;
}

interface RootState {
  orders: { groups: string[] };
  auth: { token: string | null };
}

const Filters = ({
                   filters,
                   setFilters,
                   myOrdersOnly,
                   setMyOrdersOnly,
                   resetFilters,
                 }: FiltersProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector((state: RootState) => state.orders.groups) || [];
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token && groups.length === 0) {
      dispatch(fetchGroups());
    }
  }, [dispatch, token, groups.length]);

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMyOrdersOnly(e.target.checked);
  };

  // Фіксовані списки для випадаючих меню
  const courseOptions = ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'];
  const courseFormatOptions = ['static', 'online'];
  const courseTypeOptions = ['pro', 'minimal', 'premium', 'incubator', 'vip'];
  const statusOptions = ['In work', 'New', 'Agree', 'Disagree', 'Dubbing'];

  return (
    <div className={css.filtersContainer}>
      <div className={css.filtersBody}>
        <input
          type="text"
          name="name"
          value={filters.name || ''}
          onChange={handleFilterChange}
          placeholder="Filter by name"
          className={css.filterInput}
        />
        <input
          type="text"
          name="surname"
          value={filters.surname || ''}
          onChange={handleFilterChange}
          placeholder="Filter by surname"
          className={css.filterInput}
        />
        <input
          type="text"
          name="email"
          value={filters.email || ''}
          onChange={handleFilterChange}
          placeholder="Filter by email"
          className={css.filterInput}
        />
        <input
          type="text"
          name="phone"
          value={filters.phone || ''}
          onChange={handleFilterChange}
          placeholder="Filter by phone"
          className={css.filterInput}
        />
        <input
          type="text"
          name="age"
          value={filters.age || ''}
          onChange={handleFilterChange}
          placeholder="Filter by age"
          className={css.filterInput}
        />
        <select
          name="course"
          value={filters.course || ''}
          onChange={handleFilterChange}
          className={css.filterInput}
        >
          <option value="">Filter by course</option>
          {courseOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          name="course_format"
          value={filters.course_format || ''}
          onChange={handleFilterChange}
          className={css.filterInput}
        >
          <option value="">Filter by course format</option>
          {courseFormatOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          name="course_type"
          value={filters.course_type || ''}
          onChange={handleFilterChange}
          className={css.filterInput}
        >
          <option value="">Filter by course type</option>
          {courseTypeOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={filters.status || ''}
          onChange={handleFilterChange}
          className={css.filterInput}
        >
          <option value="">Filter by status</option>
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          name="group"
          value={filters.group || ''}
          onChange={handleFilterChange}
          className={css.filterInput}
        >
          <option value="">Filter by group</option>
          {groups.map(group => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="created_at"
          value={filters.created_at || ''}
          onChange={handleFilterChange}
          placeholder="Filter by created(2025-03-25)"
          className={css.filterInput}
        />
        <input
          type="text"
          name="manager"
          value={filters.manager || ''}
          onChange={handleFilterChange}
          placeholder="Filter by manager"
          className={css.filterInput}
        />
      </div>
      <div className={css.checkboxContainer}>
        <div className={css.checkboxLabel}>
          <input
            type="checkbox"
            checked={myOrdersOnly}
            onChange={handleCheckboxChange}
            className={css.customCheckbox}
          />
          My
        </div>
        <a onClick={resetFilters}>
          <img
            src={resetImage}
            alt="Reset Filters"
            className={css.resetButton}
          />
        </a>
        <a>
          <img
            src={excel}
            alt="excel file"
            style={{ width: '25px', borderRadius: '10px' }}
          />
        </a>
      </div>
    </div>
  );
};

export { Filters };