// Test script để kiểm tra API appointment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const testAppointmentAPI = async () => {
  try {
    console.log('🧪 Testing Appointment API...');
    
    // Test 1: Login as patient
    console.log('1. Testing patient login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient1@example.com',
        password: 'patient123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful');
    
    // Test 2: Get available time slots
    console.log('2. Testing available time slots...');
    const timeSlotsResponse = await fetch(`${API_BASE_URL}/patient/appointments/available-times?date=2025-10-08&locationId=68e53659a4db69563d9ba14b`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const timeSlotsData = await timeSlotsResponse.json();
    if (!timeSlotsData.success) {
      throw new Error('Time slots failed: ' + timeSlotsData.message);
    }
    
    console.log('✅ Time slots API working');
    console.log('Available slots:', timeSlotsData.data.timeSlots.filter(slot => slot.isAvailable));
    
    // Test 3: Get available doctors
    console.log('3. Testing available doctors...');
    const doctorsResponse = await fetch(`${API_BASE_URL}/patient/appointments/available-doctors?date=2025-10-08&time=13:00&locationId=68e53659a4db69563d9ba14b`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const doctorsData = await doctorsResponse.json();
    if (!doctorsData.success) {
      throw new Error('Doctors failed: ' + doctorsData.message);
    }
    
    console.log('✅ Doctors API working');
    console.log('Available doctors:', doctorsData.data.doctors.length);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testAppointmentAPI = testAppointmentAPI;
}

export default testAppointmentAPI;
