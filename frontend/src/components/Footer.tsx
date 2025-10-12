import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">© {new Date().getFullYear()} LC. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
