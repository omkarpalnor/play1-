import Avatar from "react-avatar";
import { ChevronUp, ChevronDown } from "lucide-react";

const TransactionTable = ({
  transactions,
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="modern-table-shell">
      <div className="modern-table-scroll">
      <table className="modern-table">
        <thead>
          <tr>
            <th>User</th>
            <th>
              <button
                className="flex items-center"
                onClick={() => onSort("createdAt")}
              >
                Date
                {sortField === "createdAt" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  ))}
              </button>
            </th>
            <th>Turf</th>
            <th>Status</th>
            <th>Order ID</th>
            <th>Payment ID</th>
            <th>
              <button
                className="flex items-center"
                onClick={() => onSort("totalPrice")}
              >
                Amount
                {sortField === "totalPrice" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  ))}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-sm text-base-content/60">
                No transactions match the current filters.
              </td>
            </tr>
          ) : transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td className="flex items-center space-x-3">
                <Avatar name={transaction.user?.name || "User"} size="40" round={true} />
                <span>{transaction.user?.name || "N/A"}</span>
              </td>
              <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
              <td>{transaction.turf?.name || "N/A"}</td>
              <td>
                <span
                  className={`badge ${
                    transaction.status === "cancelled"
                      ? "badge-error badge-outline"
                      : "badge-success badge-outline"
                  }`}
                >
                  {transaction.status || "confirmed"}
                </span>
              </td>
              <td>{transaction.payment?.orderId || "N/A"}</td>
              <td>{transaction.payment?.paymentId || "N/A"}</td>
              <td>₹{Number(transaction.totalPrice || 0).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default TransactionTable;
