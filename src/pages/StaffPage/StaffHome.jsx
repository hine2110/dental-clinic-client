import React from 'react';

function StaffHome() {
  return (
    <>
      <h1>Dashboard</h1>
      <p>
        Nội dung chính của trang sẽ được đặt ở đây. Bạn có thể thêm các card, bảng biểu, và biểu đồ vào khu vực này để xem trước.
      </p>
      <div className="content-card">
        <h3>Thống kê tuần</h3>
        <p>Biểu đồ thống kê tuần sẽ nằm ở đây.</p>
      </div>
      <div className="content-card">
        <h3>Công việc cần làm</h3>
        <p>Danh sách các công việc...</p>
      </div>
    </>
  );
}

export default StaffHome;


