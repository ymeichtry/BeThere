import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaPlus, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (!isAuthenticated) {
    return null; // Keine Navbar anzeigen, wenn nicht eingeloggt
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-item">
        <FaSearch className="nav-icon" />
        <span className="nav-text">Search</span>
      </NavLink>
      <NavLink to="/host" className="nav-item">
        <FaPlus className="nav-icon" />
        <span className="nav-text">Host Party</span>
      </NavLink>
      <NavLink to="/settings" className="nav-item">
        <FaCog className="nav-icon" />
        <span className="nav-text">Settings</span>
      </NavLink>
      <button onClick={handleLogout} className="nav-item">
        <FaSignOutAlt className="nav-icon" />
        <span className="nav-text">Logout</span>
      </button>
    </nav>
  );
};

export default Navbar;
