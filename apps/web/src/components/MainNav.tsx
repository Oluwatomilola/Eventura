import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from './ConnectButton';

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
    <header className="border-b">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Eventura</span>
        </Link>
        <nav className="ml-6 flex items-center space-x-4 lg:space-x-6">
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
        <div className="ml-auto flex items-center space-x-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
