// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // <<-- IMPORTACIÓN DE BOOTSTRAP
import './styles.css'; // Tus estilos personalizados

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);