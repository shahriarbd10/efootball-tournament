import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "eFootball Tournament Cup 2026",
  description: "Live tournament tracker for the ultimate eFootball championship. View fixtures, standings, and knockout bracket in real-time.",
  keywords: "eFootball, tournament, esports, football, gaming",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <footer className="footer">
          <p className="footer-text">
            ⚽ eFootball Tournament Cup 2026 — Built with 🔥 for competitive gaming
          </p>
        </footer>
        {/* Subtle particle background */}
        <div className="particles-bg" aria-hidden="true">
          {Array.from({ length: 15 }).map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${8 + Math.random() * 15}s`,
                animationDelay: `${Math.random() * 10}s`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
              }}
            />
          ))}
        </div>
      </body>
    </html>
  );
}
