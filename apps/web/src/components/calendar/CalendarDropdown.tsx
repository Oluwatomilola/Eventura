'use client'

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

type CalendarProvider = 'google' | 'outlook' | 'apple' | 'ics';

interface CalendarOption {
  id: CalendarProvider;
  name: string;
  icon: JSX.Element;
  action: () => void;
}

interface CalendarDropdownProps {
  event: {
    id: string;
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    location: string;
    metadata: {
      highlights: string[];
      refundPolicy: string;
      languages?: string[];
    };
  };
  className?: string;
}

export function CalendarDropdown({ event, className = '' }: CalendarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CalendarProvider>('google');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGoogleCalendar = () => {
    const startDate = new Date(event.startTime * 1000);
    const endDate = new Date(event.endTime * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[^0-9]/g, '').slice(0, 15) + 'Z';
    };

    const url = new URL('https://www.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    url.searchParams.append('details', event.description);
    url.searchParams.append('location', event.location);
    url.searchParams.append('dates', `${formatDate(startDate)}/${formatDate(endDate)}`);
    
    window.open(url.toString(), '_blank');
  };

  const handleOutlookCalendar = () => {
    const startDate = new Date(event.startTime * 1000);
    const endDate = new Date(event.endTime * 1000);
    
    const url = new URL('https://outlook.live.com/calendar/0/action/compose');
    url.searchParams.append('path', '/calendar/action/compose');
    url.searchParams.append('rru', 'addevent');
    url.searchParams.append('subject', event.title);
    url.searchParams.append('body', event.description);
    url.searchParams.append('location', event.location);
    url.searchParams.append('startdt', startDate.toISOString());
    url.searchParams.append('enddt', endDate.toISOString());
    
    window.open(url.toString(), '_blank');
  };

  const handleAppleCalendar = () => {
    const startDate = new Date(event.startTime * 1000);
    const endDate = new Date(event.endTime * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[^0-9]/g, '').slice(0, 15) + 'Z';
    };
    
    const url = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
    
    window.open(encodeURI(url), '_blank');
  };

  const handleICSExport = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Eventura//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}@eventura.app
DTSTAMP:${new Date().toISOString().replace(/[^0-9]/g, '')}
DTSTART:${new Date(event.startTime * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(event.endTime * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calendarOptions: CalendarOption[] = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: <span className="text-red-500">G</span>,
      action: handleGoogleCalendar,
    },
    {
      id: 'outlook',
      name: 'Outlook Calendar',
      icon: <span className="text-blue-500">O</span>,
      action: handleOutlookCalendar,
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: <span className="text-gray-700 dark:text-gray-300">A</span>,
      action: handleAppleCalendar,
    },
    {
      id: 'ics',
      name: 'Download ICS',
      icon: <Download className="w-4 h-4" />,
      action: handleICSExport,
    },
  ];

  const selectedOption = calendarOptions.find(opt => opt.id === selectedProvider);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          id="calendar-menu"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Add to Calendar</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="calendar-menu"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {calendarOptions.map((option) => (
              <button
                key={option.id}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${
                  selectedProvider === option.id ? 'bg-purple-900/30 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedProvider(option.id);
                  option.action();
                  setIsOpen(false);
                }}
                role="menuitem"
                tabIndex={-1}
              >
                <div className="w-5 flex items-center justify-center">
                  {option.icon}
                </div>
                <span>{option.name}</span>
                {selectedProvider === option.id && (
                  <Check className="ml-auto w-4 h-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
