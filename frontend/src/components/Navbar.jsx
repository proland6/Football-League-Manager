import { NavLink } from "react-router";
import "../styles/Navbar.css"
import logo from "../assets/Football_League_Manager_logo.png"

function Navbar(){
  return (
    <header className="navbar">
      <nav className="navbar_container">

        <NavLink to="/" className = "navbar_logo">
          <img src={logo} alt="Football League Manager Logo"/>
          <span>Football League Manager</span>
        </NavLink>

        <div className="navbar_links">
          <NavLink to="/" end>
            Főoldal
          </NavLink>

          <NavLink to="/championships">
            Bajnokságok
          </NavLink>
        </div>

        <NavLink to="/login" className="navbar_login">
          Bejelentkezés
        </NavLink>

      </nav>
    </header>
  );
}

export default Navbar;
  
