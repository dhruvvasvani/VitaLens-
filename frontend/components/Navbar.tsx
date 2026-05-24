"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",           label: "Home" },
  { href: "/docs",       label: "Guides" },
  { href: "/snippet",    label: "Get Script" },
  { href: "/demo/fast",  label: "Demo" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/" className="navbar-logo">
            <div className="logo-mark">VL</div>
            VitaLens
          </Link>
        </div>

        <div className="navbar-nav">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${pathname === l.href || (l.href !== '/' && pathname?.startsWith(l.href)) ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Empty div to balance the 3-column grid and keep nav links perfectly centered */}
        <div></div>

      </div>
    </nav>
  );
}
