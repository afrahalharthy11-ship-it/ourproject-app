import React from 'react';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="container text-center">
        <p className="mb-0">
          &copy; {year} <strong>Smart Healthcare</strong> &mdash; Your trusted appointment platform
        </p>
      </div>
    </footer>
  );
}

export default Footer;
