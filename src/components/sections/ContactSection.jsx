import React from 'react';

function ContactSection() {
  return (
    <section id="contact" className="contact section">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-title" data-aos="fade-up" data-aos-delay="100">
              <h2>Contact</h2>
              <p>If you have any questions or would like to book an appointment, our team is here to help you. Contact us today and let us take care of your smile.</p>
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
                  <p>K47/32 Hoang Van Thai<br />Da Nang</p>
                </div>
              </div>
              <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
                <div className="info-box">
                  <i className="bi bi-telephone"></i>
                  <h3>Call Us</h3>
                  <p>+84 935 655 266<br />+84 888 708 368</p>
                </div>
              </div>
              <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
                <div className="info-box">
                  <i className="bi bi-envelope"></i>
                  <h3>Email Us</h3>
                  <p>huy26102101@gmail.com<br />huyntgde170695@fpt.edu.vn</p>
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
  );
}

export default ContactSection;
