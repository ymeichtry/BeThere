import { NavLink } from "react-router-dom";
import { FaSearch, FaPlus, FaCog } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
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
    </nav>
  );
};

export default Navbar;
