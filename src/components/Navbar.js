'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoFootball, IoHome, IoCalendar, IoStatsChart, IoTrophy, IoSettings, IoMenu, IoClose } from 'react-icons/io5';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: <IoHome /> },
    { href: '/fixtures', label: 'Fixtures', icon: <IoCalendar /> },
    { href: '/standings', label: 'Standings', icon: <IoStatsChart /> },
    { href: '/bracket', label: 'Bracket', icon: <IoTrophy /> },
    { href: '/admin', label: 'Admin', icon: <IoSettings /> },
  ];

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <IoFootball className="navbar-brand-icon" />
        <span className="navbar-brand-text">eFootball Cup</span>
      </Link>

      <button
        className="nav-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? <IoClose /> : <IoMenu />}
      </button>

      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="navbar-link-icon">{link.icon}</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
