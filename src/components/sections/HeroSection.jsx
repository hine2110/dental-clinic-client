import React from 'react';

function HeroSection() {
  return (
    <section id="hero" className="hero section light-background">
      <img src="/assets/img/hero-bg.jpg" alt="" data-aos="fade-in" />
      <div className="container position-relative">
        <div className="welcome position-relative" data-aos="fade-down" data-aos-delay="100">
          <h2>WELCOME TO</h2>
          <h2>BeautySmile Clinic</h2>
          <p>Confidence Begins with a Smile</p>
        </div>
        <div className="content row gy-4">
          <div className="col-lg-4 d-flex align-items-stretch">
            <div className="why-box" data-aos="zoom-out" data-aos-delay="200">
              <h3>Why Choose BeautySmile Clinic?</h3>
              <p>
                At BeautySmile Clinic, we believe a healthy smile is the key to confidence and happiness. 
                Our experienced dental team is dedicated to providing gentle, modern, and personalized care for every patient. 
                From routine check-ups to advanced cosmetic dentistry, we use the latest technology to ensure your smile is both healthy and beautiful.
              </p>
              <div className="text-center">
                <a href="#about" className="more-btn">
                  <span>Learn More</span> <i className="bi bi-chevron-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-8 d-flex align-items-stretch">
            <div className="d-flex flex-column justify-content-center">
              <div className="row gy-4">
                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="300">
                    <i className="bi bi-clipboard-data"></i>
                    <h4>Professional Dental Care</h4>
                    <p>At BeautySmile Clinic, we provide gentle, modern, and personalized treatments to keep your smile healthy and beautiful.</p>
                  </div>
                </div>
                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="400">
                    <i className="bi bi-gem"></i>
                    <h4>Advanced Technology</h4>
                    <p>We use modern equipment and the latest techniques to ensure safe, effective, and comfortable dental care for every patient.</p>
                  </div>
                </div>
                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="500">
                    <i className="bi bi-inboxes"></i>
                    <h4>Experienced Dental Team</h4>
                    <p>Our skilled and caring dentists are dedicated to providing personalized treatments and ensuring your comfort at every visit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
