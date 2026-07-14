import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon,
  RedditShareButton,
  RedditIcon,
} from 'react-share';
import { Link2 } from 'lucide-react';

const XIcon = ({ size = 40 }) => (
  <div style={{ width: size, height: size, backgroundColor: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="white">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  </div>
);

const Github = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Instagram = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import toast from 'react-hot-toast';

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleInstagramClick = () => {
    handleCopyLink();
    setTimeout(() => {
      window.open('https://instagram.com', '_blank');
    }, 500);
  };

  const handleGithubClick = () => {
    // Redirect to the project's github if you have one, or just show a message.
    window.open('https://github.com', '_blank');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={40} round />
      </WhatsappShareButton>

      <FacebookShareButton url={url} title={title}>
        <FacebookIcon size={40} round />
      </FacebookShareButton>

      <TwitterShareButton url={url} title={title}>
        <XIcon size={40} />
      </TwitterShareButton>

      <LinkedinShareButton url={url} title={title}>
        <LinkedinIcon size={40} round />
      </LinkedinShareButton>
      
      <RedditShareButton url={url} title={title}>
        <RedditIcon size={40} round />
      </RedditShareButton>

      {/* Instagram doesn't have a web share API, so we provide a copy link button with Instagram styling/idea */}
      <button 
        onClick={handleInstagramClick}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white transition-transform hover:scale-110"
        title="Copy link for Instagram"
      >
        <Instagram size={20} />
      </button>

      {/* Github button */}
      <button 
        onClick={handleGithubClick}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white transition-transform hover:scale-110 dark:bg-gray-700"
        title="View on GitHub"
      >
        <Github size={20} />
      </button>

      {/* Generic Copy Link */}
      <button 
        onClick={handleCopyLink}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-transform hover:scale-110"
        title="Copy Link"
      >
        <Link2 size={20} />
      </button>
    </div>
  );
}
