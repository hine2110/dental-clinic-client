import React from 'react';

function Footer() {
  return (
    <footer id="footer" className="footer light-background">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 footer-contact">
            <h3>Medilab</h3>
            <p>
              K47/32 Hoang Van Thai <br />
              Da Nang<br />
              Vietnam <br /><br />
              <strong>Phone:</strong> +84 935 655 266<br />
              <strong>Email:</strong> huy26102101@gmail.com<br />
            </p>
          </div>
          <div className="col-lg-2 col-md-6 footer-links">
            <h4>Useful Links</h4>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#about">About us</a></li>
              <li><a href="#services">Services</a></li>
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
      </div>
    </footer>
  );
}

export default Footer;
