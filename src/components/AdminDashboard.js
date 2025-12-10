

import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 


const formatCurrency = (amount) => {
    const num = Number(amount) || 0; 
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0, 
    }).format(num);
};


async function createCabinInDB(newCabin) {
    const { data, error } = await supabase
        .from('cabana')
        .insert([newCabin])
        .select();
    
    if (error) throw error;
    return data;
}

async function updateCabinInDB(id, updatedData) {
    const { data, error } = await supabase
        .from('cabana')
        .update(updatedData)
        .eq('id_cabana', id)
        .select();
    
    if (error) throw error;
    return data;
}

async function deleteCabinInDB(id) {
    const { error } = await supabase
        .from('cabana')
        .delete()
        .eq('id_cabana', id);
    
    if (error) throw error;
}

async function syncCabinServices(cabinId, selectedServiceIds) {

    const { error: deleteError } = await supabase
        .from('cabana_servicio')
        .delete()
        .eq('id_cabana', cabinId);

    if (deleteError) throw deleteError;


    if (selectedServiceIds && selectedServiceIds.length > 0) {
        const newRelations = selectedServiceIds.map(serviceId => ({
            id_cabana: cabinId,
            id_servicio: parseInt(serviceId)
        }));

        const { error: insertError } = await supabase
            .from('cabana_servicio')
            .insert(newRelations);

        if (insertError) throw insertError;
    }
}


function AdminDashboard({ cabins, services, refreshCabins }) {
    const CABIN_TYPES = ['pequeña', 'mediana', 'grande'];
    
    const [newCabin, setNewCabin] = useState({
        tipo: 'pequeña',
        precio_base: 0,
        capacidad: 1,
        descripcion: '',
        estado: 'Disponible',
        url_imagen: ''
    });

    const [editingCabin, setEditingCabin] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);


    const handleNewCabinChange = (e) => {
        const { name, value } = e.target;
        setNewCabin(prev => ({ 
            ...prev, 
            [name]: name === 'precio_base' || name === 'capacidad' ? Number(value) : value 
        }));
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ 
            ...prev, 
            [name]: name === 'precio_base' || name === 'capacidad' ? Number(value) : value 
        }));
    };

    const handleCreateCabin = async (e) => {
        e.preventDefault();
        try {
            await createCabinInDB(newCabin);
            alert("Cabaña creada exitosamente. (Servicios deben asignarse en modo Edición)");
            setNewCabin({ tipo: 'pequeña', precio_base: 0, capacidad: 1, descripcion: '', estado: 'Disponible', url_imagen: '' });
            refreshCabins();
        } catch (error) {
            console.error('Error al crear cabaña:', error);
            alert("Error al crear la cabaña: " + error.message);
        }
    };

    const handleEditCabin = (cabin) => {
        setEditingCabin(cabin.id_cabana);
        setEditForm({ 
            ...cabin, 
            precio_base: cabin.precio_base || 0,
            capacidad: cabin.capacidad || 1,
        });

        setSelectedServiceIds(cabin.Servicios.map(String));
    };

    const handleUpdateCabin = async (e) => {
        e.preventDefault();
        try {
            const id = editingCabin;
            

            const { 
                id_cabana, 
                Servicios, 
                nextAvailableDate, 
                cabana_servicio, 
                ...updatedData 
            } = editForm; 
            

            await updateCabinInDB(id, updatedData);

    
            await syncCabinServices(id, selectedServiceIds);

            alert(`Cabaña #${id} actualizada y servicios sincronizados exitosamente.`);
            setEditingCabin(null);
            refreshCabins();
        } catch (error) {
            console.error('Error al actualizar cabaña:', error);
            alert("Error al actualizar la cabaña: " + error.message);
        }
    };

    const handleDeleteCabin = async (id) => {
        if (window.confirm(`¿Seguro que quieres eliminar la Cabaña #${id}? Esta acción es irreversible.`)) {
            try {
                await deleteCabinInDB(id);
                alert(`Cabaña #${id} eliminada exitosamente.`);
                refreshCabins();
            } catch (error) {
                console.error('Error al eliminar cabaña:', error);
                alert("Error al eliminar la cabaña: " + error.message);
            }
        }
    };

    return (
        <div className="admin-dashboard">

            <h2 className="mb-4">Panel de Administración</h2> 

       
            <div className="card mb-4 p-4 shadow-sm">
                <h4 className="card-title">Crear Nueva Cabaña</h4>
                <form onSubmit={handleCreateCabin} className="row g-3">
                    
                    <div className="col-md-2">
                        <label className="form-label small">Tipo</label>
                        <select className="form-select form-select-sm" name="tipo" value={newCabin.tipo} onChange={handleNewCabinChange}>
                            {CABIN_TYPES.map(type => (
                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="col-md-3">
                        <label className="form-label small">Precio Base / Noche</label>
                        <input type="number" className="form-control form-control-sm" name="precio_base" 
                               value={newCabin.precio_base} onChange={handleNewCabinChange} min="0" required />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label small">Capacidad</label>
                        <input type="number" className="form-control form-control-sm" name="capacidad" 
                               value={newCabin.capacidad} onChange={handleNewCabinChange} min="1" required />
                    </div>
                    
                    <div className="col-md-5">
                        <label className="form-label small">Descripción</label>
                        <input type="text" className="form-control form-control-sm" name="descripcion" 
                               value={newCabin.descripcion} onChange={handleNewCabinChange} required />
                    </div>

                    <div className="col-md-12">
                        <label className="form-label small">URL Imagen</label>
                        <input type="url" className="form-control form-control-sm" name="url_imagen" 
                               value={newCabin.url_imagen} onChange={handleNewCabinChange} />
                    </div>
                    
                    <div className="col-12 mt-3">
                        <button type="submit" className="btn btn-primary">Guardar Cabaña</button>
                    </div>
                </form>
            </div>

            <div className="card p-4 shadow-sm">
                <h4 className="card-title">Gestión de Cabañas Existentes</h4>
                <div className="table-responsive">
                    <table className="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tipo</th>
                                <th>Precio Base</th>
                                <th>Capacidad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cabins.map(cabin => (
                                <React.Fragment key={cabin.id_cabana}>
                                    <tr >
                                        {editingCabin === cabin.id_cabana ? (
                                            <AdminEditRow 
                                                editForm={editForm}
                                                handleEditFormChange={handleEditFormChange}
                                                handleUpdateCabin={handleUpdateCabin}
                                                setEditingCabin={setEditingCabin}
                                                CABIN_TYPES={CABIN_TYPES}
                                            />
                                        ) : (
                                            <>
                                                <td>{cabin.id_cabana}</td>
                                                <td>{cabin.tipo}</td>
                                                
                                                <td>{formatCurrency(cabin.precio_base)}</td>
                                                
                                                <td>{cabin.capacidad || 'N/A'}</td>
                                                <td><span className={`badge ${cabin.estado === 'Disponible' ? 'bg-success' : 'bg-warning text-dark'}`}>{cabin.estado}</span></td>
                                                <td>
                                                    <button className="btn btn-sm btn-info me-2" onClick={() => handleEditCabin(cabin)}>Editar</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCabin(cabin.id_cabana)}>Eliminar</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                    {editingCabin === cabin.id_cabana && (
                                        <tr>
                                            <td colSpan="6" className="bg-light p-3">
                                                <AdminServiceEditor
                                                    allServices={services}
                                                    selectedServiceIds={selectedServiceIds}
                                                    setSelectedServiceIds={setSelectedServiceIds}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}


const AdminServiceEditor = ({ allServices, selectedServiceIds, setSelectedServiceIds }) => {
    
    const handleServiceToggle = (serviceId) => {
        const idStr = String(serviceId);
        setSelectedServiceIds(prevIds => {
            if (prevIds.includes(idStr)) {
                return prevIds.filter(id => id !== idStr);
            } else {
                return [...prevIds, idStr];
            }
        });
    };

    return (
        <div className="mt-2">
            <h6 className="small fw-bold">Gestión de Servicios Incluidos:</h6>
            <div className="d-flex flex-wrap gap-3">
                {allServices.map(service => (
                    <div key={service.id_servicio} className="form-check">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`service-admin-${service.id_servicio}`} 
                            checked={selectedServiceIds.includes(String(service.id_servicio))}
                            onChange={() => handleServiceToggle(service.id_servicio)}
                        />
                        <label className="form-check-label small" htmlFor={`service-admin-${service.id_servicio}`}>
                            {service.nombre_servicio}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminEditRow = ({ editForm, handleEditFormChange, handleUpdateCabin, setEditingCabin, CABIN_TYPES }) => (
    <>
        <td>{editForm.id_cabana}</td>
        <td>
            <select className="form-select form-select-sm" name="tipo" value={editForm.tipo} onChange={handleEditFormChange}>
                {CABIN_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </td>
        <td>
            <input type="number" className="form-control form-control-sm" name="precio_base" value={editForm.precio_base} onChange={handleEditFormChange} min="0" />
        </td>
        <td>
            <input type="number" className="form-control form-control-sm" name="capacidad" value={editForm.capacidad} onChange={handleEditFormChange} min="1" />
        </td>
        <td>
            <select className="form-select form-select-sm" name="estado" value={editForm.estado} onChange={handleEditFormChange}>
                <option value="Disponible">Disponible</option>
                <option value="Reservada">Reservada</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
            </select>
        </td>
        <td>
            <button className="btn btn-sm btn-success me-2" onClick={handleUpdateCabin}>Guardar</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setEditingCabin(null)}>Cancelar</button>
        </td>
    </>
);

export default AdminDashboard;