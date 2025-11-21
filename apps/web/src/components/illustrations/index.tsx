export function CalendarIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 14H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 14H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 14H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 18H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 18H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function TicketIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V15C21 16.1046 20.1046 17 19 17H5C3.89543 17 3 16.1046 3 15V9Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="7" cy="12" r="1" fill="currentColor"/>
      <circle cx="9" cy="12" r="1" fill="currentColor"/>
    </svg>
  )
}

export function LockIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
      <path d="M12 13V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function FilterIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <circle cx="10" cy="12.46" r="2" fill="currentColor"/>
    </svg>
  )
}

export function HandshakeIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5L8 9L9.41 10.41L12 7.83L14.59 10.41L16 9L12 5Z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
      <path d="M7 7L3 11L4.41 12.41L7 9.83L9.59 12.41L11 11L7 7Z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.5"/>
      <path d="M17 7L21 11L19.59 12.41L17 9.83L14.41 12.41L13 11L17 7Z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.5"/>
      <path d="M12 19L8 15L9.41 13.59L12 16.17L14.59 13.59L16 15L12 19Z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
    </svg>
  )
}

export function InboxIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <rect x="7" y="3" width="10" height="5" rx="1" fill="currentColor" opacity="0.2"/>
      <path d="M9 8L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function RocketIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 16.5C4.5 14 7 12 7 12S2 14 2 17.5C2 20 4.5 22 4.5 22S9 20 9 20S12.5 22 12.5 22C12.5 22 17 20 17 20S22 17 22 17.5C22 14 19.5 12 19.5 12S14 14 14 14C14 14 11.5 12 9.5 10C7.5 8 4.5 16.5 4.5 16.5Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <path d="M9 13L12 10L9 7" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
      <path d="M8 17H9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 3L14.5 6L17 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function QrCodeIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
      <rect x="3" y="14" width="4" height="4" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
      <rect x="17" y="14" width="4" height="4" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
      <rect x="3" y="17" width="4" height="4" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="3" width="1" height="1" fill="currentColor" opacity="0.5"/>
      <rect x="10" y="5" width="1" height="1" fill="currentColor" opacity="0.5"/>
      <rect x="12" y="3" width="1" height="1" fill="currentColor" opacity="0.5"/>
      <rect x="3" y="10" width="1" height="1" fill="currentColor" opacity="0.5"/>
      <rect x="5" y="10" width="1" height="1" fill="currentColor" opacity="0.5"/>
      <rect x="3" y="12" width="1" height="1" fill="currentColor" opacity="0.5"/>
    </svg>
  )
}

export function ShoppingIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
      <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
      <path d="M1 1H5L7.68 14.59C7.77144 15.0867 8.02191 15.5348 8.38755 15.8661C8.75318 16.1973 9.2107 16.3927 9.69 16.39H19.4C19.8695 16.3927 20.3175 16.1973 20.6811 15.8661C21.0447 15.5348 21.2935 15.0867 21.38 14.59L23 6H6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
    </svg>
  )
}

export function TagIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.59 13.41L13.41 20.59C12.9954 21.0046 12.4648 21.2921 11.8847 21.4169C11.3046 21.5418 10.7013 21.4982 10.1462 21.2915C9.59105 21.0848 9.10968 20.7236 8.75958 20.2514C8.40949 19.7792 8.20524 19.2193 8.17 18.63L8 18L6.59 16.59L2 21L3.41 22.41L7.83 18C8.224 17.606 8.5245 17.1287 8.70979 16.6075C8.89508 16.0863 8.96027 15.5334 8.99 14.97L9 14C9.00164 13.4139 8.79868 12.8446 8.41559 12.3496C8.03251 11.8546 7.4875 11.4553 6.83 11.19L1 9.83V13L2.17 13C2.67733 12.9997 3.1759 13.1624 3.58983 13.4632C4.00376 13.7641 4.30969 14.1873 4.46 14.67L5 18L6.41 16.59L5.17 15.35C4.99631 15.1763 4.87667 14.9526 4.82433 14.7067C4.77199 14.4608 4.78904 14.2027 4.8735 13.9647C4.95797 13.7268 5.10643 13.5197 5.2998 13.3698C5.49317 13.2198 5.7225 13.1341 5.96 13.12L10 13C10.5863 13.0016 11.1556 13.2045 11.6506 13.5876C12.1456 13.9706 12.5449 14.5157 12.81 15.17L14.02 17.99L14.36 18.33C14.5337 18.5037 14.7574 18.6233 15.0033 18.6757C15.2492 18.728 15.5073 18.711 15.7453 18.6265C15.9832 18.5421 16.1903 18.3936 16.3402 18.2002C16.4902 18.0069 16.5759 17.7775 16.59 17.54L16.6 17.33L18.83 15.1C19.4853 14.8349 20.0304 14.4356 20.4134 13.9406C20.7965 13.4455 20.9984 12.8763 21 12.29L21 9.83L20.59 13.41Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <circle cx="7.5" cy="12.5" r="1" fill="currentColor"/>
    </svg>
  )
}

export function ChatBubbleIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="12" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
    </svg>
  )
}

export function UsersIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
    </svg>
  )
}

export function SearchIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M8 11C8 9.89543 8.89543 9 10 9C11.1046 9 12 9.89543 12 11C12 12.1046 11.1046 13 10 13C8.89543 13 8 12.1046 8 11Z" fill="currentColor" opacity="0.5"/>
    </svg>
  )
}