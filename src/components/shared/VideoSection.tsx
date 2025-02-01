import React, { useEffect } from 'react';

export function WistiaVideoSection({ title, mediaId }) {
  useEffect(() => {
    // Dynamically load the Wistia player script
    const script1 = document.createElement('script');
    script1.src = 'https://fast.wistia.com/player.js';
    script1.async = true;

    const script2 = document.createElement('script');
    script2.src = `https://fast.wistia.com/embed/${mediaId}.js`;
    script2.async = true;
    script2.type = 'module';

    document.body.appendChild(script1);
    document.body.appendChild(script2);

    return () => {
      // Cleanup scripts when component unmounts
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, [mediaId]);

  return (
    <div className="content-section" style={{ marginTop: '40px' }}>
      <h2 className="content-title">
        {title}
      </h2>
      <style>{`
        wistia-player[media-id='${mediaId}']:not(:defined) {
          background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch');
          display: block;
          filter: blur(5px);
          padding-top: 69.58%;
        }
      `}</style>
      <wistia-player media-id={mediaId} wistia-popover="true"></wistia-player>
    </div>
  );
}
