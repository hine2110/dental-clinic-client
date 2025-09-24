// src/pages/Unauthorized.jsx
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you do not have permission to access this page."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        }
      />
    </div>
  );
}
