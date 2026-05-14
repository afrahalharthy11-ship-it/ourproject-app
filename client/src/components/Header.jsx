import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  Button,
  Spinner,
} from 'reactstrap';
import { logoutUser } from '../redux/authSlice';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const toggle = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  /* ===== LINKS ===== */

  const patientLinks = [
    { to: '/client/dashboard', label: 'Dashboard' },
    { to: '/client/appointments', label: 'My Appointments' },
    { to: '/client/book', label: 'Book Appointment' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Bookings' },
    { to: '/doctor/availability', label: 'Manage Availability' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', label: 'Dashboard' },
    { to: '/manager/appointments', label: 'All Appointments' },
    { to: '/manager/users', label: 'All Users' },
  ];

  /* ===== SELECT LINKS BY ROLE ===== */
  let links = [];

  if (user?.role === 'manager') {
    links = managerLinks;
  } else if (user?.role === 'doctor') {
    links = doctorLinks;
  } else {
    links = patientLinks;
  }

  return (
    <Navbar className="app-navbar" expand="md" dark>
      <div className="container">
        <NavbarBrand
          tag={NavLink}
          to={
            user?.role === 'manager'
              ? '/manager/dashboard'
              : user?.role === 'doctor'
              ? '/doctor/dashboard'
              : '/client/dashboard'
          }
        >
          <span className="brand-icon">&#x2665;</span> Smart Healthcare
        </NavbarBrand>

        <NavbarToggler onClick={toggle} />

        <Collapse isOpen={isOpen} navbar>
          {user && (
            <Nav className="me-auto" navbar>
              {links.map((link) => (
                <NavItem key={link.to} className="me-2">
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      'nav-link' + (isActive ? ' active-nav-link' : '')
                    }
                  >
                    {link.label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          )}

          {user && (
            <Nav navbar className="ms-auto align-items-center">
              <NavItem>
                <NavLink to="/settings" className="nav-link nav-settings-link">
                  <span className="user-badge">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="ms-2 d-none d-md-inline">
                    {user.name}
                  </span>
                </NavLink>
              </NavItem>

              <NavItem className="ms-2">
                <Button
                  size="sm"
                  color="light"
                  outline
                  onClick={handleLogout}
                  disabled={loading}
                  className="logout-btn"
                >
                  {loading ? <Spinner size="sm" /> : 'Logout'}
                </Button>
              </NavItem>
            </Nav>
          )}
        </Collapse>
      </div>
    </Navbar>
  );
}

export default Header;