import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Users, Trash2, Edit2, KeyRound, X, Search, ArrowUpDown, RefreshCw, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { apiClient } from '../api/apiClient';
import { Pagination } from '../components/Pagination';
import { ConfirmDialog } from '../components/ConfirmDialog';

const ITEMS_PER_PAGE = 10;

interface User {
  id: number;
  name?: string;
  email?: string;
  role: string;
  createdAt: string;
  allowedScreens: string[];
}

const AVAILABLE_SCREENS = [
  { value: 'Dashboard', label: 'Dashboard' },
  { value: 'Mechanics', label: 'Mechanics' },
  { value: 'Updates', label: 'Updates' },
  { value: 'Feedback', label: 'Feedback' },
  { value: 'Donations', label: 'Donations' },
  { value: 'Settings', label: 'Settings' }
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedScreens, setSelectedScreens] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'warning'|'info'|'success', onConfirm: () => void} | null>(null);
  
  const token = localStorage.getItem('token');
  const currentUserRole = localStorage.getItem('role');

  const fetchUsers = async () => {
    try {
      const data = await apiClient<any>('/admin/users');
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

  const validateForm = () => {
    const nextErrors: { name?: string; email?: string; password?: string } = {};
    const normalizedName = newName.trim();
    const normalizedEmail = newEmail.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedName) {
      nextErrors.name = 'Name is required';
    }

    if (!normalizedEmail) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!editingUserId && !newPassword.trim()) {
      nextErrors.password = 'Password is required';
    } else if (newPassword.trim() && newPassword.trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const loadingToast = toast.loading('Creating admin...');
    try {
      const allowedScreens = selectedScreens.map(s => s.value);
      await apiClient('/admin/users', {
        method: 'POST',
        data: { email: newEmail.trim(), name: newName.trim(), password: newPassword, allowedScreens }
      });
      
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
    if (!validateForm()) return;
    const loadingToast = toast.loading('Updating admin...');
    try {
      const allowedScreens = selectedScreens.map(s => s.value);
      const payload: Record<string, unknown> = {
        email: newEmail.trim(),
        name: newName.trim(),
        allowedScreens
      };
      if (newPassword.trim()) {
        payload.password = newPassword;
      }
      await apiClient(`/admin/users/${editingUserId}`, {
        method: 'PUT',
        data: payload
      });
      
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
          await apiClient(`/admin/users/${id}`, {
            method: 'DELETE'
          });
          
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
    setNewEmail('');
    setNewName('');
    setNewPassword('');
    setShowPassword(false);
    setSelectedScreens([]);
    setFieldErrors({});
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

  let filteredUsers = users;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredUsers = filteredUsers.filter(u => 
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }

  filteredUsers.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 bg-muted/50 rounded-lg w-1/3 animate-pulse"></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-20 animate-pulse"></div>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm h-96 animate-pulse"></div>
      </div>
    );
  }

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
            setNewEmail('');
            setNewName('');
            setNewPassword('');
            setSelectedScreens([]);
            setFieldErrors({});
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 shadow-lg"
        >
          <UserPlus size={20} />
          Add Admin
        </button>
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">{error}</div>}

      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="p-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap flex-1 sm:flex-none justify-center"
              title="Toggle Sort Order"
            >
              <ArrowUpDown size={16} />
              <span className="hidden sm:inline">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>
            <button 
              onClick={() => fetchUsers()}
              className="p-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground flex items-center justify-center flex-1 sm:flex-none"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="w-[20%] p-4 border-b border-border">Name</th>
                <th className="w-[26%] p-4 border-b border-border">Email</th>
                <th className="w-[12%] p-4 border-b border-border">Role</th>
                <th className="w-[24%] p-4 border-b border-border">Allowed Screens</th>
                <th className="w-[10%] p-4 border-b border-border whitespace-nowrap">Created</th>
                <th className="w-[8%] p-4 border-b border-border text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Loading users...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 align-top">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground break-words">{user.name || '-'}</p>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="min-w-0">
                        <p className="text-foreground break-all">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        user.role === 'Super Admin' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 align-top text-muted-foreground">
                      <div className="whitespace-normal break-words">
                        {user.role === 'Super Admin'
                          ? 'All Access'
                          : (user.allowedScreens && user.allowedScreens.length > 0 ? user.allowedScreens.join(', ') : 'None')}
                      </div>
                    </td>
                    <td className="p-4 align-top text-muted-foreground whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-top">
                      {user.email !== 'ajithoffice1999@gmail.com' && (
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <button 
                            onClick={() => {
                              setEditingUserId(user.id);
                              setNewEmail(user.email || '');
                              setNewName(user.name || '');
                              setNewPassword('');
                              setSelectedScreens(
                                user.allowedScreens 
                                  ? user.allowedScreens.map(s => AVAILABLE_SCREENS.find(a => a.value === s)).filter(Boolean)
                                  : []
                              );
                              setFieldErrors({});
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
                      {user.email === 'ajithoffice1999@gmail.com' && (
                        <div className="flex justify-end">
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Protected
                          </span>
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
            totalItems={filteredUsers.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>

      {/* Popup Modal */}
      {(showAddForm || editingUserId) && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm">
          <div className="flex min-h-screen items-center justify-center p-4">
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
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full p-3 bg-background border rounded-xl focus:ring-2 transition-all outline-none ${
                      fieldErrors.name
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="Enter full name"
                  />
                  {fieldErrors.name && (
                    <p className="mt-2 text-sm text-destructive">{fieldErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full p-3 bg-background border rounded-xl focus:ring-2 transition-all outline-none ${
                      fieldErrors.email
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="admin@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-2 text-sm text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold flex items-center gap-1">
                    <KeyRound className="w-4 h-4" /> Password {editingUserId && '(Leave blank to keep current)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUserId}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      className={`w-full p-3 pr-12 rounded-xl border bg-background outline-none transition-all ${
                        fieldErrors.password
                          ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-sm text-destructive">{fieldErrors.password}</p>
                  )}
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
        </div>,
        document.body
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
