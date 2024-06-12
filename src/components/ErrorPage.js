import React from 'react';
import './ErrorPage.css';


const ErrorPage = ({ error }) => {
  return (
    <div
      className="error-container"
      style={{
        backgroundImage: `url(error-background.png)`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="error-message">
        {error.split('<br>').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export default ErrorPage;
