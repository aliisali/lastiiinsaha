import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ARCameraModule from './components/ARModule/ARCameraModule';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ARCameraModule />
    </React.StrictMode>
  );
}
