import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateAccountModal from './CreateAccountModal';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(true);

  const handleCancel = () => {
    setModalVisible(false);
    navigate('/admin'); // Redirect back to admin dashboard
  };

  const handleSuccess = () => {
    // Modal will handle its own success state
    // User can create another account or close
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <CreateAccountModal
        visible={modalVisible}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CreateAccount;
