import React from 'react';

const FilterOptions = ({ options, onFilterChange }) => {
  return (
    <div className="filter-options">
      {options.map(option => (
        <div key={option}>
          <input
            type="checkbox"
            id={option}
            name={option}
            onChange={onFilterChange}
          />
          <label htmlFor={option}>{option}</label>
        </div>
      ))}
    </div>
  );
};

export default FilterOptions;