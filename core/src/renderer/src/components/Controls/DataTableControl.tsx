import * as React from "react";

const DataTableControl = ({ data }) => {
  // Assume that the first item in the list has keys that match all other items' keys
  const columns = data && data[0] ? Object.keys(data[0]) : [];

  // Helper function to ensure cell value is properly rendered as a string
  const renderCell = (value) => {
    if (typeof value === "boolean") {
      return value ? "True" : "False";
    } else if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };

  return (
    <div className="w-full overflow-x-auto max-h-64 overflow-y-auto">
      <table className="rounded-sm border border-neutral-600 min-w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="text-left px-2 border-b border-b-neutral-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-b-neutral-800 last:border-b-neutral-600 hover:bg-neutral-50 hover:bg-opacity-5"
            >
              {columns.map((column) => (
                <td
                  key={`${column}-${item.id}`}
                  className="px-2 py-0.5 text-neutral-400 whitespace-nowrap max-w-lg overflow-ellipsis overflow-hidden"
                  title={renderCell(item[column])}
                >
                  {renderCell(item[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTableControl;
