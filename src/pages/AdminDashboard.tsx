import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  LayoutDashboard, Wrench, CheckCircle, Clock, Edit3, 
  MessageSquare, Heart, Activity, Shield, AlertCircle, MapPin, TrendingUp
} from 'lucide-react';
import * as authApi from '../api/auth';
import type { User } from '../types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, profileData] = await Promise.all([
          authApi.getDashboardStats(),
          authApi.getProfile()
        ]);
        setStats(statsData);
        setProfile(profileData);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const mechanicStatusData = [
    { name: 'Approved', value: stats?.approvedMechanics || 0, color: '#10b981' },
    { name: 'Pending', value: stats?.pendingMechanics || 0, color: '#f59e0b' }
  ];

  const canView = (screen: string) => {
    if (localStorage.getItem('role') === 'Super Admin') return true;
    return profile?.allowedScreens?.includes(screen);
  };

  const engagementData: any[] = [];
  if (canView('Feedback')) engagementData.push({ name: 'Feedback', value: stats?.feedbackCount || 0, fill: '#3b82f6' });
  if (canView('Donations')) engagementData.push({ name: 'Donations', value: stats?.donationCount || 0, fill: '#ec4899' });
  if (canView('Updates')) engagementData.push({ name: 'Edits', value: stats?.pendingRequests || 0, fill: '#8b5cf6' });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <LayoutDashboard className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Admin Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {canView('Mechanics') && (
          <>
            <StatCard title="Total Mechanics" value={stats?.totalMechanics || 0} icon={Wrench} color="text-blue-500" bg="bg-blue-500/10" border="border-blue-500/20" />
            <StatCard title="Approved" value={stats?.approvedMechanics || 0} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-500/10" border="border-emerald-500/20" />
            <StatCard title="Pending Review" value={stats?.pendingMechanics || 0} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" border="border-amber-500/20" />
          </>
        )}
        {canView('Updates') && (
          <StatCard title="Pending Edits" value={stats?.pendingRequests || 0} icon={Edit3} color="text-violet-500" bg="bg-violet-500/10" border="border-violet-500/20" />
        )}
        {canView('Feedback') && (
          <StatCard title="Feedback" value={stats?.feedbackCount || 0} icon={MessageSquare} color="text-sky-500" bg="bg-sky-500/10" border="border-sky-500/20" />
        )}
        {canView('Donations') && (
          <StatCard title="Donations" value={stats?.donationCount || 0} icon={Heart} color="text-pink-500" bg="bg-pink-500/10" border="border-pink-500/20" />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        {canView('Mechanics') && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-6 text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" /> Mechanic Status Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mechanicStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {mechanicStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bar Chart */}
        {engagementData.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-6 text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Platform Engagement
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Extended Charts Section */}
      {canView('Mechanics') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-6 text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Registration Trend
            </h3>
            <div className="h-64">
              {stats?.mechanicsByDate?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.mechanicsByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
                    />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Not enough data</div>
              )}
            </div>
          </div>

          {/* City Distribution Chart */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-6 text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" /> Top Cities
            </h3>
            <div className="h-64">
              {stats?.mechanicsByCity?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.mechanicsByCity} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
                    />
                    <Bar dataKey="value" fill="#f43f5e" radius={[0, 6, 6, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Not enough data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Logs */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-bold mb-6 text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" /> Recent Activity Logs
        </h3>
        {stats?.recentActivities?.length === 0 ? (
          <p className="text-muted-foreground p-4 text-center border border-dashed border-border rounded-xl">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {stats?.recentActivities?.map((activity: any) => (
              <li key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-foreground text-sm">{activity.action}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{activity.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0 whitespace-nowrap">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Mechanics Records */}
      {canView('Mechanics') && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" /> Recent Mechanics Records
            </h3>
            <button onClick={() => navigate('/admin/mechanics')} className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                  <th className="p-3 font-medium text-sm">Name</th>
                  <th className="p-3 font-medium text-sm">City</th>
                  <th className="p-3 font-medium text-sm">Status</th>
                  <th className="p-3 font-medium text-sm">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats?.recentMechanics?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">No mechanics registered yet.</td>
                  </tr>
                ) : (
                  stats?.recentMechanics?.map((m: any) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-foreground font-medium text-sm">{m.businessName || m.name}</td>
                      <td className="p-3 text-muted-foreground text-sm">{m.city || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          m.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          m.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, border }: { title: string, value: number, icon: any, color: string, bg: string, border: string }) {
  return (
    <div className={`bg-card border ${border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden relative group`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${bg} rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">{title}</h3>
          <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
        </div>
        <div className={`p-3 ${bg} rounded-xl`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}
