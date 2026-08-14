import { Link, Outlet, useLocation } from 'react-router-dom';
import { Wrench, MessageSquare, Heart, Sun, Moon, Home, Map as MapIcon, List, ShieldCheck, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function PublicLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/20 pb-[72px] sm:pb-0">
      <header className="hidden sm:block sticky top-0 z-50 p-4 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <Link to="/" className="flex items-center gap-2 text-xl font-black hover:scale-105 transition-transform">
            <Wrench className="w-6 h-6 text-primary" />
            <div className="tracking-tight">
              <span className="text-foreground">Road</span>
              <span className="text-primary">Res</span>
              <span className="text-blue-500">Q</span>
            </div>
          </Link>
          <div className="flex gap-2 sm:gap-6 items-center">
            <Link to="/" className={`hidden sm:flex items-center gap-1 text-sm transition-colors ${location.pathname === '/' ? 'text-primary font-bold' : 'font-medium text-foreground/80 hover:text-primary'}`}>
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link to="/map" className={`hidden sm:flex items-center gap-1 text-sm transition-colors ${location.pathname === '/map' ? 'text-primary font-bold' : 'font-medium text-foreground/80 hover:text-primary'}`}>
              <MapIcon className="w-4 h-4" /> Map
            </Link>
            <Link to="/list" className={`hidden sm:flex items-center gap-1 text-sm transition-colors ${location.pathname === '/list' ? 'text-primary font-bold' : 'font-medium text-foreground/80 hover:text-primary'}`}>
              <List className="w-4 h-4" /> List
            </Link>
            <Link to="/feedback" className={`hidden sm:flex items-center gap-1 text-sm transition-colors ${location.pathname === '/feedback' ? 'text-primary font-bold' : 'font-medium text-foreground/80 hover:text-primary'}`}>
              <MessageSquare className="w-4 h-4" /> Feedback
            </Link>
            <Link to="/about" className={`hidden sm:flex items-center gap-1 text-sm transition-colors ${location.pathname === '/about' ? 'text-primary font-bold' : 'font-medium text-foreground/80 hover:text-primary'}`}>
              <ShieldCheck className="w-4 h-4" /> About
            </Link>
            <Link to="/contact" className={`hidden sm:flex items-center gap-1 text-sm transition-colors ${location.pathname === '/contact' ? 'text-primary font-bold' : 'font-medium text-foreground/80 hover:text-primary'}`}>
              <Mail className="w-4 h-4" /> Contact
            </Link>
            <Link to="/donate" className={`hidden sm:flex items-center gap-1 text-sm font-bold transition-colors ${location.pathname === '/donate' ? 'text-pink-600' : 'text-pink-500 hover:text-pink-400'}`}>
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500/50 animate-pulse drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" /> Donate
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 -z-10" />
        <Outlet />
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex justify-around items-center h-[72px]">
          <Link to="/" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Home className={`w-6 h-6 ${location.pathname === '/' ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link to="/map" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/map' ? 'text-primary' : 'text-muted-foreground'}`}>
            <MapIcon className={`w-6 h-6 ${location.pathname === '/map' ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-bold">Map</span>
          </Link>
          <Link to="/list" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/list' ? 'text-primary' : 'text-muted-foreground hover:text-primary transition-colors'}`}>
            <List className="w-6 h-6" />
            <span className="text-[10px] font-bold">List</span>
          </Link>
          <Link to="/feedback" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/feedback' ? 'text-primary' : 'text-muted-foreground'}`}>
            <MessageSquare className={`w-6 h-6 ${location.pathname === '/feedback' ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-bold">Feedback</span>
          </Link>
          <Link to="/donate" className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/donate' ? 'text-pink-500' : 'text-pink-500/80 hover:text-pink-500 transition-colors'}`}>
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500/50 animate-pulse drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            <span className="text-[10px] font-bold">Donate</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
