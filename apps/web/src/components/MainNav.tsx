import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from './ConnectButton';
import { NetworkSwitcher } from './NetworkSwitcher';

export function MainNav() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/events",
      label: "Events",
      active: pathname.startsWith("/events"),
    },
    {
      href: "/tickets",
      label: "Tickets",
      active: pathname.startsWith("/tickets"),
    },
    {
      href: "/create",
      label: "Create Event",
      active: pathname.startsWith("/create"),
    },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 sm:h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-lg sm:text-xl">Eventura</span>
        </Link>
        
        {/* Mobile Navigation Toggle */}
        <button className="md:hidden ml-auto p-2 text-foreground/70 hover:text-foreground">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-4 lg:space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                route.active ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden md:ml-auto md:flex md:items-center md:space-x-3">
          <NetworkSwitcher />
          <ConnectButton />
        </div>
      </div>
      
      {/* Mobile Navigation Menu (placeholder - would need state management) */}
      <div className="md:hidden hidden border-t bg-background">
        <nav className="px-4 py-4 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                route.active ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              {route.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
            <NetworkSwitcher />
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
