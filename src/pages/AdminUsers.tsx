import { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, Edit2, KeyRound, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { API_URL } from '../api/apiClient';
import { Pagination } from '../components/Pagination';
import { ConfirmDialog } from '../components/ConfirmDialog';

const ITEMS_PER_PAGE = 10;

interface User {
  id: number;
  username: string;
  role: string;
  createdAt: string;
  allowedScreens: string[];
}

const AVAILABLE_SCREENS = [
  { value: 'Dashboard', label: 'Dashboard' },
  { value: 'Mechanics', label: 'Mechanics' },
  { value: 'Updates', label: 'Updates' },
  { value: 'Feedback', label: 'Feedback' },
  { value: 'Donations', label: 'Donations' }
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedScreens, setSelectedScreens] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'warning'|'info'|'success', onConfirm: () => void} | null>(null);
  
  const token = localStorage.getItem('token');
  const currentUserRole = localStorage.getItem('role');

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating admin...');
    try {
      const allowedScreens = selectedScreens.map(s => s.value);
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername, password: newPassword, allowedScreens })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      closePopup();
      toast.success('Admin created successfully!', { id: loadingToast });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    const loadingToast = toast.loading('Updating admin...');
    try {
      const allowedScreens = selectedScreens.map(s => s.value);
      const res = await fetch(`${API_URL}/admin/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername, password: newPassword, allowedScreens })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      
      closePopup();
      toast.success('Admin updated successfully!', { id: loadingToast });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleDeleteUser = async (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Admin?',
      message: 'Are you sure you want to delete this admin? This cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting admin...');
        try {
          const res = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete user');
          
          toast.success('Admin deleted successfully!', { id: loadingToast });
          fetchUsers();
        } catch (err: any) {
          toast.error(err.message, { id: loadingToast });
        }
      }
    });
  };

  const closePopup = () => {
    setShowAddForm(false);
    setEditingUserId(null);
    setNewUsername('');
    setNewPassword('');
    setSelectedScreens([]);
  };

  if (currentUserRole !== 'Super Admin') {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>Only Super Admins can access user management.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-primary" />
          User Management
        </h1>
        <button 
          onClick={() => {
            setShowAddForm(true);
            setEditingUserId(null);
            setNewUsername('');
            setNewPassword('');
            setSelectedScreens([]);
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 shadow-lg"
        >
          <UserPlus size={20} />
          Add Admin
        </button>
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold">Username</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Allowed Screens</th>
                <th className="p-4 font-semibold">Created</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground animate-pulse">Loading users...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{user.username}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.role === 'Super Admin' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.role === 'Super Admin' 
                        ? 'All Access' 
                        : (user.allowedScreens && user.allowedScreens.length > 0 ? user.allowedScreens.join(', ') : 'None')}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {user.username !== 'ajithoffice1999@gmail.com' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingUserId(user.id);
                              setNewUsername(user.username);
                              setNewPassword('');
                              setSelectedScreens(
                                user.allowedScreens 
                                  ? user.allowedScreens.map(s => AVAILABLE_SCREENS.find(a => a.value === s)).filter(Boolean)
                                  : []
                              );
                              setShowAddForm(true);
                            }}
                            className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                            title="Edit Admin"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            title="Delete Admin"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={users.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>

      {/* Popup Modal */}
      {(showAddForm || editingUserId) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingUserId ? <Edit2 className="w-6 h-6 text-primary" /> : <UserPlus className="w-6 h-6 text-primary" />}
                {editingUserId ? 'Update Admin' : 'Register New Admin'}
              </h2>
              <button onClick={closePopup} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={editingUserId ? handleUpdateUser : handleAddUser} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold">Username (Email)</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold flex items-center gap-1">
                  <KeyRound className="w-4 h-4" /> Password {editingUserId && '(Leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold">Allowed Screens (For Normal Admins)</label>
                <Select
                  isMulti
                  name="screens"
                  options={AVAILABLE_SCREENS}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={selectedScreens}
                  onChange={(newValue) => setSelectedScreens(newValue as any[])}
                  placeholder="Select access..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{ 
                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                    control: base => ({ ...base, backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }),
                    menu: base => ({ ...base, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }),
                    option: (base, state) => ({ 
                      ...base, 
                      backgroundColor: state.isFocused ? 'hsl(var(--muted))' : 'transparent', 
                      color: 'hsl(var(--foreground))',
                      cursor: 'pointer'
                    }),
                    multiValue: base => ({ ...base, backgroundColor: 'hsl(var(--primary) / 0.1)', borderRadius: '6px' }),
                    multiValueLabel: base => ({ ...base, color: 'hsl(var(--primary))', fontWeight: 'bold' }),
                    multiValueRemove: base => ({ ...base, color: 'hsl(var(--primary))', ':hover': { backgroundColor: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' } })
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closePopup} className="px-6 py-2 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2 rounded-xl font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                  {editingUserId ? 'Update' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!confirmConfig?.isOpen}
        title={confirmConfig?.title || ''}
        message={confirmConfig?.message || ''}
        type={confirmConfig?.type || 'warning'}
        onConfirm={() => {
          if (confirmConfig?.onConfirm) confirmConfig.onConfirm();
        }}
        onCancel={() => setConfirmConfig(null)}
      />
    </div>
  );
}
