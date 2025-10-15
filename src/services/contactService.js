const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

class ContactService {
  static async submitForm(contactData) {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred. Please try again.');
      }
      
      return data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }
}

export default ContactService;