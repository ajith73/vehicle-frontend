import { AlertCircle, CheckCircle, Edit, Eye, Trash2 } from 'lucide-react';
import type { RowData } from '../../utils/bulkUploadUtils';

interface BulkUploadTableProps {
  data: RowData[];
  selectedIds: Set<string>;
  searchQuery: string;
  filterStatus: string;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onViewRow: (row: RowData) => void;
  onEditRow: (row: RowData) => void;
  onDeleteRow: (id: string) => void;
}

export default function BulkUploadTable({
  data,
  selectedIds,
  searchQuery,
  filterStatus,
  onSelectAll,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow
}: BulkUploadTableProps) {
  let filteredData = data;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredData = filteredData.filter(r => 
      (r.businessName && String(r.businessName).toLowerCase().includes(q)) || 
      (r.mechanicName && String(r.mechanicName).toLowerCase().includes(q)) || 
      (r.city && String(r.city).toLowerCase().includes(q)) || 
      (r.phone && String(r.phone).includes(q))
    );
  }
  if (filterStatus === 'Valid') filteredData = filteredData.filter(r => !r.error);
  if (filterStatus === 'Errors') filteredData = filteredData.filter(r => r.error);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-muted border-b border-border">
            <th className="p-4 font-medium w-10">
              <input 
                type="checkbox" 
                checked={selectedIds.size === data.length && data.length > 0}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="p-4 font-medium">Name</th>
            <th className="p-4 font-medium">Phone</th>
            <th className="p-4 font-medium">Location</th>
            <th className="p-4 font-medium">Vehicles</th>
            <th className="p-4 font-medium">Status / Errors</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredData.map((row) => (
            <tr key={row.id} className={`hover:bg-muted/50 ${row.error ? 'bg-red-50/10 dark:bg-red-950/20' : ''}`}>
              <td className="p-4">
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(row.id)}
                  onChange={(e) => onSelectRow(row.id, e.target.checked)}
                />
              </td>
              <td className="p-4 text-foreground font-medium" title={row.businessName}>
                {row.businessName && row.businessName.length > 15 ? row.businessName.substring(0, 15) + '...' : row.businessName}
              </td>
              <td className="p-4 text-muted-foreground">{row.phone}</td>
              <td className="p-4 text-muted-foreground" title={`${row.city}, ${row.state}`}>
                {(() => {
                  const locationStr = `${row.city}, ${row.state}`;
                  return locationStr.length > 15 ? locationStr.substring(0, 15) + '...' : locationStr;
                })()}
              </td>
              <td className="p-4 text-muted-foreground max-w-[200px] truncate" title={row.vehicleTypes}>
                {row.vehicleTypes}
              </td>
              <td className="p-4 max-w-[200px] whitespace-normal break-words">
                {row.error ? (
                  <span className="flex items-start gap-1 text-red-600 text-sm font-medium" title={row.error}>
                    <AlertCircle size={16} className="shrink-0 mt-0.5" /> <span>{row.error}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle size={16} /> Valid
                  </span>
                )}
              </td>
              <td className="p-4 text-right flex justify-end gap-2">
                <button 
                  onClick={() => onViewRow({ ...row })}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded"
                  title="View Row"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => onEditRow({ ...row })}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded"
                  title="Edit Row"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => onDeleteRow(row.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                  title="Delete Row"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
