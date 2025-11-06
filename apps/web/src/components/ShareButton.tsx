import React, { useState } from 'react';
import { FiShare2, FiCopy, FiX } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import { toast } from 'react-hot-toast';

interface ShareButtonProps {
  eventId: string;
  eventTitle: string;
  eventUrl: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  eventId,
  eventTitle,
  eventUrl,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const shareText = `Check out this event: ${eventTitle}`;
  const encodedUrl = encodeURIComponent(eventUrl);
  const encodedText = encodeURIComponent(shareText);

  const trackShare = (platform: string) => {
    // TODO: Replace with actual analytics tracking
    console.log(`Shared to ${platform}`, { eventId, eventTitle, eventUrl });
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: <FaTwitter className="text-blue-400" />,
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          '_blank',
          'noopener,noreferrer'
        );
        trackShare('twitter');
      },
    },
    {
      name: 'Facebook',
      icon: <FaFacebook className="text-blue-600" />,
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
          '_blank',
          'noopener,noreferrer'
        );
        trackShare('facebook');
      },
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin className="text-blue-700" />,
      onClick: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          '_blank',
          'noopener,noreferrer'
        );
        trackShare('linkedin');
      },
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="text-green-500" />,
      onClick: () => {
        window.open(
          `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
          '_blank',
          'noopener,noreferrer'
        );
        trackShare('whatsapp');
      },
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="text-blue-400" />,
      onClick: () => {
        window.open(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
          '_blank',
          'noopener,noreferrer'
        );
        trackShare('telegram');
      },
    },
    {
      name: 'Email',
      icon: <SiGmail className="text-red-500" />,
      onClick: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(
          `Check out this event: ${eventTitle}`
        )}&body=${encodedText}%0A%0A${encodedUrl}`;
        trackShare('email');
      },
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(eventUrl);
    toast.success('Link copied to clipboard!');
    trackShare('copy_link');
  };

  // Add Open Graph meta tags dynamically
  React.useEffect(() => {
    // Only add meta tags if they don't exist
    const addMetaTag = (property: string, content: string) => {
      if (!document.querySelector(`meta[property="${property}"]`)) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    addMetaTag('og:title', eventTitle);
    addMetaTag('og:description', shareText);
    addMetaTag('og:url', eventUrl);
    addMetaTag('og:type', 'website');
    // Add more OG tags as needed

    return () => {
      // Clean up dynamic meta tags if needed
    };
  }, [eventTitle, eventUrl, shareText]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Share"
      >
        <FiShare2 className="w-5 h-5 mr-2" />
        Share
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Share this event</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 p-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    option.onClick();
                    setIsOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-2 text-sm text-gray-700 rounded-md hover:bg-gray-50"
                  aria-label={`Share on ${option.name}`}
                >
                  <span className="text-xl mb-1">{option.icon}</span>
                  <span>{option.name}</span>
                </button>
              ))}
              
              <button
                onClick={() => {
                  copyToClipboard();
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-2 text-sm text-gray-700 rounded-md hover:bg-gray-50"
                aria-label="Copy link to clipboard"
              >
                <FiCopy className="w-5 h-5 mb-1" />
                <span>Copy link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
