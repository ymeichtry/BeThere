import { NavLink } from "react-router-dom";
import { FaSearch, FaPlus, FaCog } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
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
