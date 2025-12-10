// src/components/ReservationForm.js (Corregido para consistencia RF5)

import React, { useState } from 'react';

function ReservationForm({ cabinId, onSubmit, onClose }) {
  // Solo necesitamos el email del usuario para RF5, el nombre ya no es crítico.
  const [formData, setFormData] = useState({
    Email: '', // Mantener para notificación RF5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Solo valida el Email (si es que se requiere)
    if (!formData.Email) {
      alert("Por favor, ingrese un Email para la confirmación de la reserva.");
      return;
    }

    // Llama a handleFinalReservation en CabinCard.js
    onSubmit(formData); 
  };

  return (
    <div className="reservation-form-overlay">
      <form onSubmit={handleSubmit} className="reservation-form">
        <h4 className="mb-4">Confirmación de Datos (RF3/RF5)</h4>
        
        {/* 🛑 SOLO PEDIMOS EMAIL para la confirmación RF5 */}
        <div className="mb-3">
            <label className="form-label">Email (Confirmación):</label>
            <input type="email" className="form-control" name="Email" value={formData.Email} onChange={handleChange} required />
        </div>
        
        <p className="small text-muted">Usted está reservando para {cabinId} del {cabinId} al {cabinId}</p> {/* Se pueden quitar estas referencias a cabinId si no se necesitan */}
        <p className="small text-danger">⚠️ Asegúrese de haber iniciado sesión como cliente antes de pagar.</p>
        
        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-success" type="submit">Confirmar y Pagar (Simulado)</button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;