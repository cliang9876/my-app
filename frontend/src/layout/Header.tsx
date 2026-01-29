import React from "react";

type HeaderProps = {
  isAuthed?: boolean;
  onLogout?: () => void;
};

const Header: React.FC<HeaderProps> = ({ isAuthed, onLogout }) => {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <h1 className="app-header-title">LC</h1>
        {isAuthed && (
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
