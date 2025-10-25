// file: pages/management/ManagementLocationsPage.jsx (Ví dụ)

import React, { useState, useEffect } from 'react';
import CreateLocation from './CreateLocation'; // Form của bạn
import LocationList from '../../components/LocationList'; // Component hiển thị danh sách

function ManagementLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLocations, setActiveLocations] = useState([]);

  // Fetch danh sách cơ sở khi component được mount lần đầu
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/management/locations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            const active = data.data.filter(location => location.isActive);
            setActiveLocations(active);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // ✅ HÀM QUAN TRỌNG: Hàm này sẽ được gọi từ component con (CreateLocation)
  // để cập nhật danh sách mà không cần tải lại trang.
  const handleLocationCreated = (newLocation) => {
    setLocations(prevLocations => [...prevLocations, newLocation]);
  };

  if (isLoading) return <div>Đang tải danh sách cơ sở...</div>;

  return (
    <div>
      {/* Truyền hàm handleLocationCreated xuống component con qua props */}
      <CreateLocation onLocationCreated={handleLocationCreated} />
      
      <hr style={{ margin: '2rem 0' }} />

      {/* Component này sẽ tự động re-render khi `locations` thay đổi */}
      <LocationList locations={locations} />
    </div>
  );
}

export default ManagementLocationsPage;