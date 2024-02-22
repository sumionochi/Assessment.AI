'use client';

import Webcam from 'react-webcam';

export default function WebCamera() {
  return (
    <Webcam
      mirrored
      style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
      audio={false}
    />
  );
}
