'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/fixtures', label: 'Fixtures', icon: '📋' },
    { href: '/standings', label: 'Standings', icon: '📊' },
    { href: '/bracket', label: 'Bracket', icon: '🏆' },
    { href: '/admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <span className="navbar-brand-icon">⚽</span>
        <span className="navbar-brand-text">eFootball Cup</span>
      </Link>

      <button
        className="nav-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
