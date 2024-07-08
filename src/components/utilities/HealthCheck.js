// components/HealthCheck.js

import axios from 'axios';
import config from './config';

const checkServerHealth = async (setIsServerHealthy, setIsExternalApiHealthy, setError) => {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/api/health`);
    if (response.status === 200 && response.data.status === 'healthy') {
      setIsServerHealthy(true);
      if (response.data.external_api_status === 'healthy') {
        setIsExternalApiHealthy(true);
      } else {
        setIsExternalApiHealthy(false);
        setError('Ilab server is not responding. Please try again later.');
      }
    } else {
      setIsServerHealthy(false);
      setError('The application server is not responding. Please try again later.');
    }
  } catch (error) {
    setIsServerHealthy(false);
    setError('The application server is not responding. Please try again later.');
  }
};

export { checkServerHealth };
