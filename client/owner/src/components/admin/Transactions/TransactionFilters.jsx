
const TransactionFilters = ({ filters, onFilterChange, onResetFilters }) => {
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,0.8fr))_auto]">
      <input
        type="text"
        placeholder="Search..."
        name="search"
        value={filters.search}
        onChange={onFilterChange}
        className="modern-input w-full"
      />
      <input
        type="number"
        placeholder="Min Amount"
        name="minAmount"
        value={filters.minAmount}
        onChange={onFilterChange}
        className="modern-input w-full"
      />
      <input
        type="number"
        placeholder="Max Amount"
        name="maxAmount"
        value={filters.maxAmount}
        onChange={onFilterChange}
        className="modern-input w-full"
      />
      <input
        type="date"
        name="startDate"
        value={filters.startDate}
        onChange={onFilterChange}
        className="modern-input w-full"
      />
      <input
        type="date"
        name="endDate"
        value={filters.endDate}
        onChange={onFilterChange}
        className="modern-input w-full"
      />
      <select
        name="status"
        value={filters.status}
        onChange={onFilterChange}
        className="modern-select w-full"
      >
        <option value="all">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button className="btn btn-outline" onClick={onResetFilters}>
        Reset Filters
      </button>
    </div>
  );
};

export default TransactionFilters;
