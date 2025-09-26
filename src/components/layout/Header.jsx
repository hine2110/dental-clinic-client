import React from "react";
import { Link } from "react-router-dom";
import AuthButtons from "./AuthButtons";
import { useAuth } from "../../context/authContext";

function Header({ onOpenLogin, onOpenRegister }) {
  const { user } = useAuth();

  return (
    <header id="header" className="header sticky-top">
      {/* Topbar */}
      <div className="topbar d-flex align-items-center">
        <div className="container d-flex justify-content-center justify-content-md-between">
          <div className="contact-info d-flex align-items-center">
            <i className="bi bi-envelope d-flex align-items-center">
              <a href="mailto:contact@example.com">huy26102101@gmail.com</a>
            </i>
            <i className="bi bi-phone d-flex align-items-center ms-4">
              <span>+84 935 655 266</span>
            </i>
          </div>
          <div className="social-links d-none d-md-flex align-items-center">
            <a href="#" className="twitter">
              <i className="bi bi-twitter-x"></i>
            </a>
            <a href="#" className="facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#" className="instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="#" className="linkedin">
              <i className="bi bi-linkedin"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Branding + Nav */}
      <div className="branding d-flex align-items-center">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <a href="/" className="logo d-flex align-items-center me-auto">
            <h1 className="sitename">BeautySmile</h1>
          </a>

          <nav id="navmenu" className="navmenu">
            <ul>
              <li>
                <a href="#hero" className="active">
                  Home
                </a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#departments">Departments</a>
              </li>
              <li>
                <a href="#doctors">Doctors</a>
              </li>
              <li className="dropdown">
                <a href="#">
                  <span>Dropdown</span>{" "}
                  <i className="bi bi-chevron-down toggle-dropdown"></i>
                </a>
                <ul>
                  <li>
                    <a href="#">Dropdown 1</a>
                  </li>
                  <li className="dropdown">
                    <a href="#">
                      <span>Deep Dropdown</span>{" "}
                      <i className="bi bi-chevron-down toggle-dropdown"></i>
                    </a>
                    <ul>
                      <li>
                        <a href="#">Deep Dropdown 1</a>
                      </li>
                      <li>
                        <a href="#">Deep Dropdown 2</a>
                      </li>
                      <li>
                        <a href="#">Deep Dropdown 3</a>
                      </li>
                      <li>
                        <a href="#">Deep Dropdown 4</a>
                      </li>
                      <li>
                        <a href="#">Deep Dropdown 5</a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">Dropdown 2</a>
                  </li>
                  <li>
                    <a href="#">Dropdown 3</a>
                  </li>
                  <li>
                    <a href="#">Dropdown 4</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>

          <div
            className="d-flex align-items-center w-100"
            style={{ gap: "40px" }}
          >
            <a className="cta-btn d-none d-sm-block" href="#appointment">
              Make an Appointment
            </a>
            {user?.role === "admin" && (
              <>
                <Link
                  to="/create-account"
                  className="btn btn-outline-primary d-none d-sm-block"
                  style={{ marginRight: "10px" }}
                >
                  Create Account
                </Link>
                <Link
                  to="/admin"
                  className="btn btn-outline-secondary d-none d-sm-block"
                  style={{ marginRight: "10px" }}
                >
                  Admin Dashboard
                </Link>
              </>
            )}
            <div style={{ marginLeft: "auto" }}>
              <AuthButtons
                onOpenLogin={onOpenLogin}
                onOpenRegister={onOpenRegister}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
