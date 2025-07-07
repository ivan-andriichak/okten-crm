import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, fetchGroups, generateExcel } from '../../store';
import css from './Filters.module.css';
import resetImage from '../../images/reset.png';
import excel from '../../images/excel.png';
import { debounce } from '../../utils/debounce';

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

  const [inputValues, setInputValues] =
    useState<Record<string, string>>(filters);

  useEffect(() => {
    setInputValues(filters);
  }, [filters]);

  useEffect(() => {
    if (token && groups.length === 0) {
      dispatch(fetchGroups());
    }
  }, [dispatch, token, groups.length]);

  const debouncedSetFilters = useMemo(
    () => debounce(setFilters, 1000),
    [setFilters],
  );

  useEffect(() => {
    return () => {
      debouncedSetFilters.cancel();
    };
  }, [debouncedSetFilters]);

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update input values immediately
    setInputValues(prev => ({ ...prev, [name]: value }));

    if (e.target.tagName === 'INPUT') {
      debouncedSetFilters({ ...filters, [name]: value });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMyOrdersOnly(e.target.checked);
  };

  const handleGenerateExcel = async () => {
    try {
      const result = await dispatch(
        generateExcel({
          filters: {
            ...filters,
            myOrders: myOrdersOnly.toString(),
          },
        }),
      ).unwrap();

      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate Excel:', error);
    }
  };

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
          value={inputValues.name || ''}
          onChange={handleFilterChange}
          placeholder="Filter by name"
          className={css.filterInput}
        />
        <input
          type="text"
          name="surname"
          value={inputValues.surname || ''}
          onChange={handleFilterChange}
          placeholder="Filter by surname"
          className={css.filterInput}
        />
        <input
          type="text"
          name="email"
          value={inputValues.email || ''}
          onChange={handleFilterChange}
          placeholder="Filter by email"
          className={css.filterInput}
        />
        <input
          type="text"
          name="phone"
          value={inputValues.phone || ''}
          onChange={handleFilterChange}
          placeholder="Filter by phone"
          className={css.filterInput}
        />
        <input
          type="number"
          name="age"
          value={inputValues.age || ''}
          onChange={handleFilterChange}
          placeholder="Filter by age"
          className={css.filterInput}
          min="0"
        />
        <select
          name="course"
          value={filters.course || ''}
          onChange={handleFilterChange}
          className={`${css.filterInput} ${filters.course ? css.selectedInput : ''}`}>
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
          className={`${css.filterInput} ${filters.course_format ? css.selectedInput : ''}`}>
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
          className={`${css.filterInput} ${filters.course_type ? css.selectedInput : ''}`}>
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
          className={`${css.filterInput} ${filters.status ? css.selectedInput : ''}`}>
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
          className={`${css.filterInput} ${filters.group ? css.selectedInput : ''}`}>
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
          value={inputValues.created_at || ''}
          onChange={handleFilterChange}
          placeholder="Filter by created (2025-03-25)"
          className={css.filterInput}
        />
        <input
          type="text"
          name="manager"
          value={inputValues.manager || ''}
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
            className={`${css.resetButton} ${Object.values(filters).some(v => v) ? css.activeReset : ''}`}
          />
        </a>
        <a onClick={handleGenerateExcel}>
          <img
            src={excel}
            alt="Generate Excel"
            style={{ width: '23px', borderRadius: '10px', cursor: 'pointer' }}
          />
        </a>
      </div>
    </div>
  );
};

export { Filters };