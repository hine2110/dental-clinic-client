// src/pages/AdminPage/HistoryModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, List, Spin, Button, Descriptions, message } from 'antd';
import { adminService } from '../../services/adminService';
import moment from 'moment';

const HistoryModal = ({ patientUser, visible, onCancel }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Chỉ fetch dữ liệu khi modal được mở (visible) và có patientUser
        if (visible && patientUser) {
            const fetchHistory = async () => {
                setLoading(true);
                try {
                    // Dùng User ID của bệnh nhân để gọi API
                    const res = await adminService.getPatientHistory(patientUser._id); 
                    if (res.success) {
                        setHistoryData(res.data || []);
                    } else {
                        message.error(res.message || "Failed to load history.");
                    }
                } catch (error) {
                    message.error(error.message || "Error fetching history.");
                } finally {
                    setLoading(false);
                }
            };
            
            fetchHistory();
        } else {
            // Reset data khi modal đóng
            setHistoryData([]);
        }
    }, [visible, patientUser]); // Phụ thuộc vào visible và patientUser

    return (
        <Modal
            title={`Medical History: ${patientUser?.fullName || ''}`}
            open={visible}
            onCancel={onCancel} // Dùng hàm onCancel được truyền từ cha
            footer={[
                <Button key="close" onClick={onCancel}>
                    Close
                </Button>
            ]}
            width={800} // Cho modal rộng
            destroyOnClose // Tự động xóa component con khi đóng
        >
            <Spin spinning={loading}>
                <List
                    itemLayout="vertical"
                    dataSource={historyData}
                    locale={{ emptyText: 'No completed appointments found.' }}
                    renderItem={item => (
                        <List.Item
                            key={item._id}
                            style={{ background: '#f9f9f9', marginBottom: 16, padding: 16, borderRadius: 8 }}
                        >
                            <Descriptions title={`Appointment: ${moment(item.appointmentDate).format('DD/MM/YYYY HH:mm')}`} column={2}>
                                <Descriptions.Item label="Doctor">
                                    {item.doctor?.user?.fullName || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Service(s)">
                                    {item.selectedServices?.map(s => s.name).join(', ') || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Reason for Visit" span={2}>
                                    {item.reasonForVisit || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Final Diagnosis" span={2}>
                                    {item.finalDiagnosis || 'No diagnosis provided.'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Treatment" span={2}>
                                    {item.treatmentNotes || item.treatment || 'No treatment notes.'}
                                </Descriptions.Item>
                            </Descriptions>
                        </List.Item>
                    )}
                />
            </Spin>
        </Modal>
    );
};

export default HistoryModal;