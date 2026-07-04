import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wrench, Users, LogOut, Menu, X, Sun, Moon, Edit3, UserCircle, CheckCircle, BellRing, MessageSquare, Heart, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '../api/apiClient';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profile, setProfile] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    // Theme setup
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Fetch Profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditUsername(data.username || '');
          setEditEmail(data.email || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload: any = { username: editUsername, email: editEmail };
      if (editPassword) payload.password = editPassword;

      const res = await fetch(`${API_URL}/admin/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast('Profile updated successfully');
        setProfile({ ...profile, username: editUsername, email: editEmail });
        setShowEditProfile(false);
        setEditPassword('');
      } else {
        toast('Failed to update profile');
      }
    } catch (err) {
      toast('Error connecting to server');
    }
    setSaveLoading(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Mechanics', path: '/admin/mechanics', icon: Wrench },
    { name: 'Updates', path: '/admin/update-requests', icon: BellRing },
    { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
    { name: 'Donations', path: '/admin/donations', icon: Heart },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const currentUserRole = localStorage.getItem('role');
  
  const filteredNavItems = navItems.filter(item => {
    if (currentUserRole === 'Super Admin') return true;
    if (profile?.allowedScreens) {
      return profile.allowedScreens.includes(item.name);
    }
    if (item.name === 'Settings' && currentUserRole !== 'Super Admin') return false;
    return true; 
  });

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 flex flex-col shadow-sm
        ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        ${isExpanded ? 'lg:w-72' : 'lg:w-20'}
      `}>
        <div className={`flex items-center p-4 border-b border-border relative ${isExpanded ? 'justify-between' : 'justify-center lg:px-0'}`}>
          <h2 className={`text-xl font-bold text-primary whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:w-0 lg:opacity-0'}`}>Admin Portal</h2>
          <button className="lg:hidden text-muted-foreground ml-auto" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
          {/* Desktop Toggle */}
          <button 
            className="hidden lg:flex absolute -right-3 top-5 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-primary z-50 shadow-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isExpanded ? item.name : undefined}
                className={`flex items-center gap-3 py-3 rounded-lg transition-colors group relative ${
                  isExpanded ? 'px-4' : 'px-0 justify-center'
                } ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} className="shrink-0" />
                <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                    {item.name}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-foreground"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className={`border-t border-border p-4 bg-muted/10 transition-all duration-300 ${isExpanded ? '' : 'flex flex-col items-center p-2'}`}>
          <div className={`flex items-center justify-between mb-4 ${isExpanded ? '' : 'flex-col gap-4'}`}>
            <div className={`flex items-center gap-3 overflow-hidden ${isExpanded ? '' : 'justify-center'}`}>
              <UserCircle size={isExpanded ? 40 : 32} className="text-primary shrink-0" />
              <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0 h-0'}`}>
                <p className="font-bold text-sm truncate">{profile?.username || 'Loading...'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email || 'No email set'}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowEditProfile(true)}
              className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors shrink-0"
              title="Edit Profile"
            >
              <Edit3 size={18} />
            </button>
          </div>

          <div className={`flex gap-2 ${isExpanded ? '' : 'flex-col w-full'}`}>
            <button 
              onClick={toggleTheme}
              title={!isExpanded ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
              className={`flex items-center justify-center gap-2 py-2 text-sm text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors ${isExpanded ? 'flex-1' : 'w-full'}`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 hidden'}`}>
                {theme === 'light' ? 'Dark' : 'Light'} Mode
              </span>
            </button>
            <button 
              onClick={handleLogout}
              className={`flex items-center justify-center p-2 text-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors ${isExpanded ? '' : 'w-full'}`}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="text-xl font-bold text-primary">Admin Portal</h2>
          <button className="text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <UserCircle className="text-primary" /> Update Profile
              </h3>
              <button onClick={() => setShowEditProfile(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username / Name</label>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full p-2 rounded border border-border bg-background outline-none focus:border-primary" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full p-2 rounded border border-border bg-background outline-none focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password (leave blank to keep current)</label>
                <input 
                  type="password" 
                  value={editPassword} 
                  onChange={e => setEditPassword(e.target.value)}
                  className="w-full p-2 rounded border border-border bg-background outline-none focus:border-primary" 
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowEditProfile(false)} className="px-4 py-2 border border-border rounded font-medium hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saveLoading} className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50">
                  <CheckCircle size={18} /> {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
