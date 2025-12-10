
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function CabinManagement({ cabins, services, refreshCabins }) {
  const [editingCabinId, setEditingCabinId] = useState(null);
  const [formData, setFormData] = useState({});

  const startEdit = (cabin) => {
    setEditingCabinId(cabin.ID_Cabana);
    setFormData({
      Tipo: cabin.Tipo,
      Precio_Base: cabin.Precio_Base,
      Capacidad: cabin.Capacidad,
      Descripcion: cabin.Descripcion,
      Estado: cabin.Estado,
      Servicios: new Set(cabin.Servicios) 
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleServiceChange = (e) => {
    const serviceId = parseInt(e.target.value);
    setFormData(prev => {
      const newServices = new Set(prev.Servicios);
      if (e.target.checked) {
        newServices.add(serviceId);
      } else {
        newServices.delete(serviceId);
      }
      return { ...prev, Servicios: newServices };
    });
  };

  const saveChanges = async (id) => {
    const { Tipo, Precio_Base, Capacidad, Descripcion, Estado, Servicios } = formData;
    
    const { error: cabinError } = await supabase
      .from('CABANA')
      .update({
        Tipo,
        Precio_Base,
        Capacidad,
        Descripcion,
        Estado,
      })
      .eq('ID_Cabana', id);

    if (cabinError) {
      console.error("Error al actualizar cabaña:", cabinError);
      alert("Error al guardar cambios en la cabaña.");
      return;
    }


    const { error: deleteError } = await supabase
      .from('CABANA_SERVICIO')
      .delete()
      .eq('ID_Cabana', id);

    if (deleteError) {
      console.error("Error al limpiar servicios:", deleteError);
    }

    const servicesToInsert = Array.from(Servicios).map(serviceId => ({
      ID_Cabana: id,
      ID_Servicio: serviceId,
    }));
    
    if (servicesToInsert.length > 0) {
        const { error: insertError } = await supabase
        .from('CABANA_SERVICIO')
        .insert(servicesToInsert);

        if (insertError) {
            console.error("Error al insertar nuevos servicios:", insertError);
            alert("Cambios guardados, pero hubo error al actualizar los servicios.");
            return;
        }
    }

    alert(`Cabaña #${id} actualizada exitosamente.`);
    setEditingCabinId(null);
    refreshCabins(); 
  };

  const renderEditForm = (cabin) => (
    <div className="edit-form admin-form p-3 mb-3 border rounded bg-light">
      <h4 className="h5">✍️ Editando Cabaña #{cabin.ID_Cabana} (RF4)</h4>
      
      <div className="row g-3"> 
        <div className="col-md-6"> 
          <label className="form-label">Precio Base:</label>
          <input type="number" className="form-control" name="Precio_Base" value={formData.Precio_Base} onChange={handleFormChange} step="0.01" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Capacidad:</label>
          <input type="number" className="form-control" name="Capacidad" value={formData.Capacidad} onChange={handleFormChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Estado:</label>
          <select className="form-select" name="Estado" value={formData.Estado} onChange={handleFormChange}>
            <option value="Disponible">Disponible</option>
            <option value="Reservada">Reservada</option>
          </select>
        </div>
        
        <div className="col-12">
          <label className="form-label">Descripción:</label>
          <textarea className="form-control" name="Descripcion" value={formData.Descripcion} onChange={handleFormChange} rows="3"></textarea>
        </div>
      </div>

      <div className="services-update-container mt-3">
        <h5 className="h6">Servicios (Actualizar):</h5>
        <div className="d-flex flex-wrap gap-3">
            {services.map(service => (
              <div className="form-check" key={service.ID_Servicio}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`edit-service-${service.ID_Servicio}`}
                  value={service.ID_Servicio}
                  checked={formData.Servicios && formData.Servicios.has(service.ID_Servicio)}
                  onChange={handleServiceChange}
                />
                <label className="form-check-label" htmlFor={`edit-service-${service.ID_Servicio}`}>
                  {service.Nombre_Servicio}
                </label>
              </div>
            ))}
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-success" onClick={() => saveChanges(cabin.ID_Cabana)}>Guardar Cambios</button>
        <button className="btn btn-secondary" onClick={() => setEditingCabinId(null)}>Cancelar</button>
      </div>
    </div>
  );

  return (
    <div className="cabin-management-list table-responsive">
      <h3 className="h5 mb-3">Inventario de Cabañas</h3>
      <table className="table table-striped table-hover small">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Capacidad</th>
            <th>Precio Base</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cabins.map(cabin => (
            <React.Fragment key={cabin.ID_Cabana}>
              <tr>
                <td>{cabin.ID_Cabana}</td>
                <td>{cabin.Tipo}</td>
                <td>{cabin.Capacidad}</td>
                <td>${cabin.Precio_Base.toFixed(2)}</td>
                <td><span className={`badge ${cabin.Estado === 'Disponible' ? 'bg-success' : 'bg-warning'}`}>{cabin.Estado}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(cabin)}>Modificar</button>
                </td>
              </tr>
              {editingCabinId === cabin.ID_Cabana && (
                <tr>
                  <td colSpan="6">{renderEditForm(cabin)}</td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CabinManagement;