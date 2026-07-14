import { useState, useEffect } from 'react';
import { Heart, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Pagination } from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [donorFilter, setDonorFilter] = useState<'All' | 'Named' | 'Anonymous'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest'>('newest');

  let filteredDonations = donations;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredDonations = filteredDonations.filter((item) =>
      (item.name || 'Anonymous').toLowerCase().includes(q) ||
      String(item.paymentReference || '').toLowerCase().includes(q) ||
      String(item.amount || '').includes(q)
    );
  }

  if (donorFilter === 'Named') {
    filteredDonations = filteredDonations.filter((item) => item.name && item.name.trim() !== '');
  }

  if (donorFilter === 'Anonymous') {
    filteredDonations = filteredDonations.filter((item) => !item.name || item.name.trim() === '');
  }

  filteredDonations = [...filteredDonations].sort((a, b) => {
    if (sortOrder === 'highest') {
      return Number(b.amount || 0) - Number(a.amount || 0);
    }

    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await apiClient<any>('/admin/donations');
      setDonations(data);
    } catch (err) {
      console.error('Failed to fetch donations', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, donorFilter, sortOrder]);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-64 rounded-xl bg-muted/50 animate-pulse" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
            <div className="h-11 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-11 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-11 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-11 rounded-lg bg-muted/50 animate-pulse" />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-4 gap-4 border-b border-border bg-muted/40 p-4">
            <div className="h-5 rounded bg-muted/60 animate-pulse" />
            <div className="h-5 rounded bg-muted/60 animate-pulse" />
            <div className="h-5 rounded bg-muted/60 animate-pulse" />
            <div className="h-5 rounded bg-muted/60 animate-pulse" />
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 border-b border-border/70 p-4 last:border-b-0">
              <div className="h-5 rounded bg-muted/40 animate-pulse" />
              <div className="h-5 rounded bg-muted/40 animate-pulse" />
              <div className="h-5 rounded bg-muted/40 animate-pulse" />
              <div className="h-5 rounded bg-muted/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Heart className="text-pink-500" /> Support & Donations
        </h2>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto] xl:w-full">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search donor, reference, or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <select
              value={donorFilter}
              onChange={(e) => setDonorFilter(e.target.value as 'All' | 'Named' | 'Anonymous')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            >
              <option value="All">All Donors</option>
              <option value="Named">Named Only</option>
              <option value="Anonymous">Anonymous</option>
            </select>

            <button
              onClick={() => setSortOrder((prev) => prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'highest' : 'newest')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground text-sm whitespace-nowrap"
              title="Change sort order"
            >
              <ArrowUpDown size={16} />
              <span>{sortOrder === 'newest' ? 'Newest' : sortOrder === 'oldest' ? 'Oldest' : 'Highest Amount'}</span>
            </button>

            <button
              onClick={fetchDonations}
              className="flex items-center justify-center px-3 py-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground"
              title="Refresh Donations"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <div className="overflow-x-auto min-w-[600px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="p-4 font-medium">Donor Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Amount (INR)</th>
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedDonations.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No donations found</td></tr>
              ) : (
                paginatedDonations.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium text-foreground">{item.name || 'Anonymous'}</td>
                    <td className="p-4 text-muted-foreground">{item.email || '-'}</td>
                    <td className="p-4 text-green-600 font-bold font-mono">₹{item.amount.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground text-sm font-mono">{item.paymentReference}</td>
                    <td className="p-4 text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredDonations.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </div>
  );
}
