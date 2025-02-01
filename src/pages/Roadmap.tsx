// src/pages/Roadmap.tsx
import React from 'react';

const Roadmap: React.FC = () => {
  return (
    <div className="roadmap-container">
      <iframe
        src="https://roadmap-pearl.vercel.app/embed"
        width="100%"
        height="800"
        frameBorder="0"
        style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
        title="Roadmap"
      ></iframe>
    </div>
  );
};

export default Roadmap;
