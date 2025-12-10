// src/components/ReservationManagement.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Nota: La ruta a supabaseClient.js es '../supabaseClient'

function ReservationManagement({ cabins }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  // Función para obtener todas las reservas (Gestionar Reservas RF3/RF4)
  const fetchReservations = async () => {
    setLoading(true);
    // Necesitamos unir (JOIN) la tabla RESERVA con CABANA
    const { data, error } = await supabase
      .from('RESERVA')
      .select(`
        *,
        CABANA (ID_Cabana, Tipo, Precio_Base, Capacidad)
      `)
      .order('Fecha_Reserva', { ascending: false }); // Ordenar por fecha de creación

    if (error) {
      console.error('Error al cargar las reservas:', error);
      alert('Error al cargar el historial de reservas.');
    } else {
      setReservations(data);
    }
    setLoading(false);
  };
  
  // Función para cancelar una reserva (RF4 - Administrador)
  const handleCancelReservation = async (reservationId, cabinId) => {
    if (!window.confirm('¿Está seguro de que desea CANCELAR esta reserva? Esta acción es irreversible.')) {
      return;
    }

    try {
      // 1. Marcar la reserva como Cancelada
      const { error: reserveError } = await supabase
        .from('RESERVA')
        .update({ Estado_Reserva: 'Cancelada' })
        .eq('ID_Reserva', reservationId);

      if (reserveError) throw reserveError;
      
      // 2. Liberar la cabaña (Actualizar el estado de la cabaña a 'Disponible')
      const { error: cabinError } = await supabase
        .from('CABANA')
        .update({ Estado: 'Disponible' })
        .eq('ID_Cabana', cabinId);

      if (cabinError) throw cabinError;

      alert(`Reserva #${reservationId} cancelada y Cabaña liberada.`);
      fetchReservations(); // Refrescar la lista de reservas
      
    } catch (error) {
      console.error('Error durante la cancelación:', error);
      alert('Ocurrió un error al intentar cancelar la reserva y liberar la cabaña.');
    }
  };


  if (loading) {
    return <div className="loading-state">Cargando historial de reservas...</div>;
  }
  
  if (reservations.length === 0) {
    return <p>No hay reservas registradas en el sistema.</p>;
  }

  return (
    <div className="reservation-management-list">
      <h3>Historial y Gestión de Reservas</h3>
      <table>
        <thead>
          <tr>
            <th>ID Reserva</th>
            <th>Cabaña</th>
            <th>Fechas</th>
            <th>Cliente (Email)</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(res => (
            <tr key={res.ID_Reserva}>
              <td>{res.ID_Reserva}</td>
              <td>{res.CABANA ? `${res.CABANA.Tipo} (#${res.CABANA.ID_Cabana})` : 'N/A'}</td>
              <td>{res.Fecha_Inicio} al {res.Fecha_Fin}</td>
              <td>{res.Nombre} ({res.Email})</td> 
              <td>${res.Precio_Total.toFixed(2)}</td>
              <td>
                <span className={`status ${res.Estado_Reserva.toLowerCase().replace(' ', '-')}`}>
                  {res.Estado_Reserva}
                </span>
              </td>
              <td>
                {/* Evita cancelar reservas finalizadas/canceladas */}
                {res.Estado_Reserva === 'Confirmada' || res.Estado_Reserva === 'Pendiente' ? (
                  <button 
                    className="action-button cancel-button"
                    onClick={() => handleCancelReservation(res.ID_Reserva, res.ID_Cabana)}
                  >
                    Cancelar
                  </button>
                ) : (
                  <span>No editable</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationManagement;