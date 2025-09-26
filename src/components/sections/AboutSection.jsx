import React from 'react';

function AboutSection() {
  return (
    <section id="about" className="about section">
      <div className="container">
        <div className="row gy-4 gx-5">
          <div className="col-lg-6 position-relative align-self-start" data-aos="fade-up" data-aos-delay="200">
            <img src="/assets/img/about.jpg" className="img-fluid" alt="" />
            <a href="https://www.youtube.com/watch?v=Y7f98aduVJ8" className="glightbox pulsating-play-btn"></a>
          </div>
          <div className="col-lg-6 content" data-aos="fade-up" data-aos-delay="100">
            <h3>About Us</h3>
            <p>
              At BeautySmile Clinic, we believe a healthy smile is the key to confidence and happiness. 
              Our experienced dental team is dedicated to providing gentle, modern, and personalized care for every patient. 
              From routine check-ups to advanced cosmetic dentistry, we use the latest technology to ensure your smile is both healthy and beautiful.
            </p>
            <ul>
              <li>
                <i className="fa-solid fa-vial-circle-check"></i>
                <div>
                  <h5>Comprehensive Dental Services</h5>
                  <p>From routine check-ups to cosmetic and restorative treatments, we provide a full range of dental care for every need.</p>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-pump-medical"></i>
                <div>
                  <h5>Personalized & Gentle Care</h5>
                  <p>We listen to your concerns and tailor every treatment to make your dental experience comfortable and stress-free.</p>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-heart-circle-xmark"></i>
                <div>
                  <h5>Trusted Quality & Safety</h5>
                  <p>Using advanced technology and strict hygiene standards, we ensure safe, reliable, and long-lasting results for your smile.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
