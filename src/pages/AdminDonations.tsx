import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { API_URL, apiClient } from '../api/apiClient';
import { Pagination } from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(donations.length / ITEMS_PER_PAGE);
  const paginatedDonations = donations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await apiClient<any>('/admin/donations');
      setDonations(data);
    } catch (err) {
      console.error('Failed to fetch donations', err);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Heart className="text-pink-500" /> Support & Donations
        </h2>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <div className="overflow-x-auto min-w-[600px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="p-4 font-medium">Donor Name</th>
                <th className="p-4 font-medium">Amount (INR)</th>
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedDonations.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No donations found</td></tr>
              ) : (
                paginatedDonations.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium text-foreground">{item.name || 'Anonymous'}</td>
                    <td className="p-4 text-green-600 font-bold font-mono">₹{item.amount.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground text-sm font-mono">{item.paymentReference}</td>
                    <td className="p-4 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={donations.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </div>
  );
}
