import React from 'react';

// Sửa lại đường dẫn import ảnh tại đây
import doctor1 from '../../assets/doctors/doctors-1.jpg';
import doctor2 from '../../assets/doctors/doctors-2.jpg';
import doctor3 from '../../assets/doctors/doctors-3.jpg';
import doctor4 from '../../assets/doctors/doctors-4.jpg';

function DoctorsSection() {
  return (
    <section id="doctors" className="doctors section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Doctors</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div>{/* End Section Title */}

      <div className="container">
        <div className="row gy-4">

          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
            <div className="team-member d-flex align-items-start">
              <div className="pic"><img src={doctor1} className="img-fluid" alt="Walter White" /></div>
              <div className="member-info">
                <h4>Walter White</h4>
                <span>Chief Medical Officer</span>
                <p>Explicabo voluptatem mollitia et repellat qui dolorum quasi</p>
                <div className="social">
                  <a href=""><i className="bi bi-twitter-x"></i></a>
                  <a href=""><i className="bi bi-facebook"></i></a>
                  <a href=""><i className="bi bi-instagram"></i></a>
                  <a href=""> <i className="bi bi-linkedin"></i> </a>
                </div>
              </div>
            </div>
          </div>{/* End Team Member */}

          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
            <div className="team-member d-flex align-items-start">
              <div className="pic"><img src={doctor2} className="img-fluid" alt="Sarah Jhonson" /></div>
              <div className="member-info">
                <h4>Sarah Jhonson</h4>
                <span>Anesthesiologist</span>
                <p>Aut maiores voluptates amet et quis praesentium qui senda para</p>
                <div className="social">
                  <a href=""><i className="bi bi-twitter-x"></i></a>
                  <a href=""><i className="bi bi-facebook"></i></a>
                  <a href=""><i className="bi bi-instagram"></i></a>
                  <a href=""> <i className="bi bi-linkedin"></i> </a>
                </div>
              </div>
            </div>
          </div>{/* End Team Member */}

          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
            <div className="team-member d-flex align-items-start">
              <div className="pic"><img src={doctor3} className="img-fluid" alt="William Anderson" /></div>
              <div className="member-info">
                <h4>William Anderson</h4>
                <span>Cardiology</span>
                <p>Quisquam facilis cum velit laborum corrupti fuga rerum quia</p>
                <div className="social">
                  <a href=""><i className="bi bi-twitter-x"></i></a>
                  <a href=""><i className="bi bi-facebook"></i></a>
                  <a href=""><i className="bi bi-instagram"></i></a>
                  <a href=""> <i className="bi bi-linkedin"></i> </a>
                </div>
              </div>
            </div>
          </div>{/* End Team Member */}

          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="400">
            <div className="team-member d-flex align-items-start">
              <div className="pic"><img src={doctor4} className="img-fluid" alt="Amanda Jepson" /></div>
              <div className="member-info">
                <h4>Amanda Jepson</h4>
                <span>Neurosurgeon</span>
                <p>Dolorum tempora officiis odit laborum officiis et et accusamus</p>
                <div className="social">
                  <a href=""><i className="bi bi-twitter-x"></i></a>
                  <a href=""><i className="bi bi-facebook"></i></a>
                  <a href=""><i className="bi bi-instagram"></i></a>
                  <a href=""> <i className="bi bi-linkedin"></i> </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default DoctorsSection;