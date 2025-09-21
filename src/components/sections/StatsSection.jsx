import React from 'react';

function StatsSection() {
  return (
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
  );
}

export default StatsSection;
