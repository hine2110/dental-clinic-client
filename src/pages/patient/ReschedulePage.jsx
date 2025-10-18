import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AppointmentService from '../../services/appointmentService'; 

// Bạn có thể import CSS chung của dự án nếu cần
// import './ReschedulePage.css';

function ReschedulePage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [appointment, setAppointment] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    useEffect(() => {
        if (!token) {
            setError("Không tìm thấy token đổi lịch. Vui lòng kiểm tra lại đường link.");
            setLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await AppointmentService.verifyRescheduleToken(token);
                setAppointment(response.data);
                setSelectedDate(new Date(response.data.appointmentDate).toISOString().split('T')[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    useEffect(() => {
        if (selectedDate && appointment?.doctor?._id) {
            const fetchDoctorTimes = async () => {
                try {
                    // Gọi hàm mới để lấy giờ trống của chính bác sĩ này
                    const response = await AppointmentService.getDoctorAvailableSlots(appointment.doctor._id, selectedDate);
                    setAvailableTimes(response.data);
                } catch (err) {
                    console.error("Lỗi khi lấy giờ hẹn của bác sĩ:", err);
                    setAvailableTimes([]);
                }
            };
            fetchDoctorTimes();
        }
    }, [selectedDate, appointment]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setSelectedTime(''); // Reset giờ đã chọn khi đổi ngày
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            setError("Vui lòng chọn ngày và giờ mới.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await AppointmentService.updateRescheduledAppointment(token, selectedDate, selectedTime);
            setSuccess(`Đổi lịch hẹn thành công! Lịch hẹn mới của bạn là ${selectedTime} ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="page-container"><h2>Đang kiểm tra link đổi lịch...</h2></div>;
    }

    if (success) {
        return (
            <div className="page-container success-message">
                <h2>✅ {success}</h2>
                <Link to="/">Quay về trang chủ</Link>
            </div>
        );
    }
    
    return (
        <div className="page-container">
            {error && <div className="error-message"><h3>❌ {error}</h3></div>}

            {appointment && !error && (
                <form onSubmit={handleSubmit}>
                    <h1>Đổi lịch hẹn</h1>
                    <div className="current-appointment-info">
                        <p><strong>Lịch hẹn hiện tại của bạn:</strong></p>
                        <p>Bác sĩ: {appointment.doctor.user.fullName}</p>
                        <p>Ngày: {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</p>
                        <p>Giờ: {appointment.startTime}</p>
                    </div>

                    <hr />

                    <h2>Chọn lịch hẹn mới</h2>
                    <div className="form-group">
                        <label htmlFor="newDate">Chọn ngày mới:</label>
                        <input 
                            type="date" 
                            id="newDate" 
                            value={selectedDate}
                            onChange={handleDateChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Chọn giờ mới:</label>
                        <div className="time-slot-grid">
                            {availableTimes.length > 0 ? (
                                availableTimes.map(slot => (
                                    <button 
                                        type="button"
                                        key={slot.time}
                                        className={`time-slot-button ${selectedTime === slot.time ? 'selected' : ''}`}
                                        onClick={() => setSelectedTime(slot.time)}
                                    >
                                        {slot.displayTime}
                                    </button>
                                ))
                            ) : (
                                <p>Không có giờ hẹn trống trong ngày này.</p>
                            )}
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading || !selectedTime}>
                        {loading ? 'Đang xử lý...' : 'Xác nhận đổi lịch'}
                    </button>
                </form>
            )}
            <style jsx>{`
                .page-container { max-width: 600px; margin: 40px auto; padding: 20px; font-family: sans-serif; }
                .error-message { color: #D8000C; background-color: #FFD2D2; padding: 15px; border-radius: 8px; }
                .success-message { text-align: center; color: #4F8A10; background-color: #DFF2BF; padding: 20px; border-radius: 8px; }
                .form-group { margin-bottom: 20px; }
                label { display: block; margin-bottom: 8px; font-weight: bold; }
                input[type="date"] { width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc; }
                .time-slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; }
                .time-slot-button { padding: 10px; border: 1px solid #007bff; color: #007bff; background: #fff; cursor: pointer; border-radius: 4px; }
                .time-slot-button.selected { background: #007bff; color: #fff; }
                button[type="submit"] { width: 100%; padding: 15px; background: #007bff; color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
                button[type="submit"]:disabled { background: #ccc; }
            `}</style>
        </div>
    );
}

export default ReschedulePage;
