import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  return (
    <>
      {/* Header */}
      <header className="header sticky-top">
        <div className="topbar d-flex align-items-center">
          <div className="container d-flex justify-content-center justify-content-md-between">
            <div className="contact-info d-flex align-items-center">
              <i className="bi bi-envelope d-flex align-items-center">
                <a href="mailto:contact@example.com">contact@example.com</a>
              </i>
              <i className="bi bi-phone d-flex align-items-center ms-4">
                <span>+1 5589 55488 55</span>
              </i>
            </div>
            <div className="social-links d-none d-md-flex align-items-center">
              <a href="#" className="twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" className="instagram"><i className="bi bi-instagram"></i></a>
              <a href="#" className="linkedin"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>

        <div className="branding d-flex align-items-center">
          <div className="container position-relative d-flex align-items-center justify-content-between">
            <a href="/" className="logo d-flex align-items-center me-auto">
              <h1 className="sitename">Medilab</h1>
            </a>

            <nav id="navmenu" className="navmenu">
              <ul>
                <li><a href="#hero" className="active">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#departments">Departments</a></li>
                <li><a href="#doctors">Doctors</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
              <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
            </nav>

            <div className="auth-buttons d-flex align-items-center">
              {user ? (
                <div className="d-flex align-items-center">
                  <span className="me-3 text-white">
                    Xin chào, {user.firstName} {user.lastName}!
                  </span>
                  <button 
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={() => {
                      // Navigate to dashboard based on role
                      if (user.role === 'patient') navigate('/patient/dashboard');
                      else if (user.role === 'doctor') navigate('/doctor/dashboard');
                      else if (user.role === 'admin') navigate('/admin/dashboard');
                      else if (user.role === 'receptionist') navigate('/receptionist/dashboard');
                    }}
                  >
                    Dashboard
                  </button>
                  <button 
                    className="btn btn-light btn-sm"
                    onClick={logout}
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập
                  </button>
                  <button 
                    className="btn btn-light btn-sm"
                    onClick={() => navigate('/register')}
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero section light-background">
        <img src="/assets/img/hero-bg.jpg" alt="" data-aos="fade-in" />
        
        <div className="container position-relative">
          <div className="welcome position-relative" data-aos="fade-down" data-aos-delay="100">
            <h2>WELCOME TO MEDILAB</h2>
            <p>We are team of talented designers making websites with Bootstrap</p>
          </div>

          <div className="content row gy-4">
            <div className="col-lg-4 d-flex align-items-stretch">
              <div className="why-box" data-aos="zoom-out" data-aos-delay="200">
                <h3>Why Choose Medilab?</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <div className="text-center">
                  <a href="#about" className="more-btn"><span>Learn More</span> <i className="bi bi-chevron-right"></i></a>
                </div>
              </div>
            </div>

            <div className="col-lg-8 d-flex align-items-stretch">
              <div className="d-flex flex-column justify-content-center">
                <div className="row gy-4">
                  <div className="col-xl-4 d-flex align-items-stretch">
                    <div className="icon-box" data-aos="zoom-out" data-aos-delay="300">
                      <i className="bi bi-clipboard-data"></i>
                      <h4>Corporis voluptates officia eiusmod</h4>
                      <p>Consequuntur sunt aut quasi enim aliquam quae harum pariatur laboris nisi ut aliquip</p>
                    </div>
                  </div>

                  <div className="col-xl-4 d-flex align-items-stretch">
                    <div className="icon-box" data-aos="zoom-out" data-aos-delay="400">
                      <i className="bi bi-gem"></i>
                      <h4>Ullamco laboris ladore pan</h4>
                      <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt</p>
                    </div>
                  </div>

                  <div className="col-xl-4 d-flex align-items-stretch">
                    <div className="icon-box" data-aos="zoom-out" data-aos-delay="500">
                      <i className="bi bi-inboxes"></i>
                      <h4>Labore consequatur incidid dolore</h4>
                      <p>Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut maiores omnis facere</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About Section */}
<section id="about" className="about section">
  <div className="container">
    <div className="row gy-4 gx-5">
      <div className="col-lg-6 position-relative align-self-start" data-aos="fade-up" data-aos-delay="200">
        <img src="/assets/img/about.jpg" className="img-fluid" alt="" />
      </div>
      <div className="col-lg-6 content" data-aos="fade-up" data-aos-delay="100">
        <h3>About Us</h3>
        <p>Dolor iure expedita id fuga asperiores qui sunt consequatur minima. Quidem voluptas deleniti. Sit quia molestiae quia quas qui magnam itaque veritatis dolores.</p>
        <ul>
          <li>
            <i className="fa-solid fa-vial-circle-check"></i>
            <div>
              <h5>Ullamco laboris nisi ut aliquip consequat</h5>
              <p>Magni facilis facilis repellendus cum excepturi quaerat praesentium libre trade</p>
            </div>
          </li>
          <li>
            <i className="fa-solid fa-pump-medical"></i>
            <div>
              <h5>Magnam soluta odio exercitationem reprehenderi</h5>
              <p>Quo totam dolorum at pariatur aut distinctio dolorum laudantium illo direna pasata redi</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

{/* Stats Section */}
<section id="stats" className="stats section light-background">
  <div className="container" data-aos="fade-up" data-aos-delay="100">
    <div className="row gy-4">
      <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
        <i className="fa-solid fa-user-doctor"></i>
        <div className="stats-item">
          <span data-purecounter-start="0" data-purecounter-end="85" data-purecounter-duration="1" className="purecounter"></span>
          <p>Doctors</p>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
        <i className="fa-regular fa-hospital"></i>
        <div className="stats-item">
          <span data-purecounter-start="0" data-purecounter-end="18" data-purecounter-duration="1" className="purecounter"></span>
          <p>Departments</p>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
        <i className="fas fa-flask"></i>
        <div className="stats-item">
          <span data-purecounter-start="0" data-purecounter-end="12" data-purecounter-duration="1" className="purecounter"></span>
          <p>Research Labs</p>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 d-flex flex-column align-items-center">
        <i className="fas fa-award"></i>
        <div className="stats-item">
          <span data-purecounter-start="0" data-purecounter-end="150" data-purecounter-duration="1" className="purecounter"></span>
          <p>Awards</p>
        </div>
      </div>
    </div>
  </div>
</section>
{/* Services Section */}
<section id="services" className="services section">
  <div className="container">
    <div className="row">
      <div className="col-12">
        <div className="section-title" data-aos="fade-up" data-aos-delay="100">
          <h2>Services</h2>
          <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
        </div>
      </div>
    </div>
    <div className="row gy-4">
      <div className="col-lg-4 col-md-6 d-flex align-items-stretch" data-aos="zoom-in" data-aos-delay="200">
        <div className="service-item d-flex flex-column">
          <div className="icon">
            <i className="fas fa-heart-pulse"></i>
          </div>
          <h4>Lorem Ipsum</h4>
          <p>Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi</p>
          <a href="#" className="readmore stretched-link"><span>Read More</span><i className="bi bi-arrow-right"></i></a>
        </div>
      </div>
      <div className="col-lg-4 col-md-6 d-flex align-items-stretch" data-aos="zoom-in" data-aos-delay="300">
        <div className="service-item d-flex flex-column">
          <div className="icon">
            <i className="fas fa-pills"></i>
          </div>
          <h4>Sed ut perspiciatis</h4>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore</p>
          <a href="#" className="readmore stretched-link"><span>Read More</span><i className="bi bi-arrow-right"></i></a>
        </div>
      </div>
      <div className="col-lg-4 col-md-6 d-flex align-items-stretch" data-aos="zoom-in" data-aos-delay="400">
        <div className="service-item d-flex flex-column">
          <div className="icon">
            <i className="fas fa-thermometer"></i>
          </div>
          <h4>Magni Dolores</h4>
          <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia</p>
          <a href="#" className="readmore stretched-link"><span>Read More</span><i className="bi bi-arrow-right"></i></a>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Doctors Section */}
<section id="doctors" className="doctors section">
  <div className="container">
    <div className="row">
      <div className="col-12">
        <div className="section-title" data-aos="fade-up" data-aos-delay="100">
          <h2>Doctors</h2>
          <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem</p>
        </div>
      </div>
    </div>
    <div className="row gy-4">
      <div className="col-lg-6 col-md-6 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="100">
        <div className="team-member d-flex flex-column">
          <div className="member-img">
            <img src="/assets/img/doctors/doctors-1.jpg" className="img-fluid" alt="" />
            <div className="social">
              <a href="https://twitter.com"><i className="bi bi-twitter-x"></i></a>
              <a href="https://facebook.com"><i className="bi bi-facebook"></i></a>
              <a href="https://instagram.com"><i className="bi bi-instagram"></i></a>
              <a href="https://linkedin.com"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
          <div className="member-info">
            <h4>Walter White</h4>
            <span>Chief Medical Officer</span>
            <p>Explicabo voluptatem mollitia et repellat qui dolorum quasi</p>
          </div>
        </div>
      </div>
      <div className="col-lg-6 col-md-6 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="200">
        <div className="team-member d-flex flex-column">
          <div className="member-img">
            <img src="/assets/img/doctors/doctors-2.jpg" className="img-fluid" alt="" />
            <div className="social">
              <a href="https://twitter.com"><i className="bi bi-twitter-x"></i></a>
              <a href="https://facebook.com"><i className="bi bi-facebook"></i></a>
              <a href="https://instagram.com"><i className="bi bi-instagram"></i></a>
              <a href="https://linkedin.com"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
          <div className="member-info">
            <h4>Sarah Jhonson</h4>
            <span>Anesthesiologist</span>
            <p>Aut maiores voluptates amet et quis praesentium qui senda para</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Contact Section */}
<section id="contact" className="contact section">
  <div className="container">
    <div className="row">
      <div className="col-12">
        <div className="section-title" data-aos="fade-up" data-aos-delay="100">
          <h2>Contact</h2>
          <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem</p>
        </div>
      </div>
    </div>
    <div className="row gy-4">
      <div className="col-lg-6">
        <div className="row gy-4">
          <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
            <div className="info-box">
              <i className="bi bi-geo-alt"></i>
              <h3>Address</h3>
              <p>A108 Adam Street,<br />New York, NY 535022</p>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
            <div className="info-box">
              <i className="bi bi-telephone"></i>
              <h3>Call Us</h3>
              <p>+1 5589 55488 55<br />+1 6678 254445 41</p>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
            <div className="info-box">
              <i className="bi bi-envelope"></i>
              <h3>Email Us</h3>
              <p>info@example.com<br />contact@example.com</p>
            </div>
          </div>
          <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
            <div className="info-box">
              <i className="bi bi-clock"></i>
              <h3>Open Hours</h3>
              <p>Monday - Friday<br />9:00AM - 05:00PM</p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
        <form className="php-email-form">
          <div className="row gy-4">
            <div className="col-md-6">
              <input type="text" name="name" className="form-control" placeholder="Your Name" required />
            </div>
            <div className="col-md-6">
              <input type="email" className="form-control" name="email" placeholder="Your Email" required />
            </div>
            <div className="col-md-12">
              <input type="text" className="form-control" name="subject" placeholder="Subject" required />
            </div>
            <div className="col-md-12">
              <textarea className="form-control" name="message" rows="6" placeholder="Message" required></textarea>
            </div>
            <div className="col-md-12 text-center">
              <div className="loading">Loading</div>
              <div className="error-message"></div>
              <div className="sent-message">Your message has been sent. Thank you!</div>
              <button type="submit">Send Message</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
{/* Footer */}
<footer id="footer" className="footer light-background">
  <div className="container">
    <div className="row">
      <div className="col-lg-4 col-md-6 footer-contact">
        <h3>Medilab</h3>
        <p>
          A108 Adam Street <br />
          New York, NY 535022<br />
          United States <br /><br />
          <strong>Phone:</strong> +1 5589 55488 55<br />
          <strong>Email:</strong> info@example.com<br />
        </p>
      </div>

      <div className="col-lg-2 col-md-6 footer-links">
        <h4>Useful Links</h4>
        <ul>
          <li><a href="#hero">Home</a></li>
          <li><a href="#about">About us</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#doctors">Doctors</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <div className="col-lg-3 col-md-6 footer-links">
        <h4>Our Services</h4>
        <ul>
          <li><a href="#">Web Design</a></li>
          <li><a href="#">Web Development</a></li>
          <li><a href="#">Product Management</a></li>
          <li><a href="#">Marketing</a></li>
          <li><a href="#">Graphic Design</a></li>
        </ul>
      </div>

      <div className="col-lg-3 col-md-6 footer-newsletter">
        <h4>Our Newsletter</h4>
        <p>Tamen quem nulla quae legam multos aute sint culpa legam noster magna</p>
        <form className="form-inline">
          <input className="form-control" name="newsletter" placeholder="Email" />
          <button type="submit"><i className="bi bi-arrow-right"></i></button>
        </form>
      </div>
    </div>
  </div>

  <div className="container footer-bottom clearfix">
    <div className="copyright">
      &copy; Copyright <strong><span>Medilab</span></strong>. All Rights Reserved
    </div>
    <div className="credits">
      Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
    </div>
  </div>
</footer>
    </>
  );
}

export default Home;