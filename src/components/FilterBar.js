// src/components/FilterBar.js (ACTUALIZADO con Botón Filtrar y Tipos Correctos)

import React, { useState, useEffect } from 'react';

function FilterBar({ initialServices, onFilterChange }) {
    // Estado de trabajo (lo que el usuario selecciona)
    const [workingFilters, setWorkingFilters] = useState({ 
        capacity: '', 
        selectedServices: [], 
        cabinType: '', 
        startDate: '',
        endDate: ''
    });

    // 🛑 Estado de filtros aplicados (lo que realmente se envía a App.js)
    const [appliedFilters, setAppliedFilters] = useState(workingFilters);

    // Tipos de cabaña confirmados
    const CABIN_TYPES = ['pequeña', 'mediana', 'grande']; // <<-- TIPOS CORRECTOS

    // 🛑 Enviar los filtros aplicados a App.js cuando cambien (solo después de clickear Filtrar)
    useEffect(() => {
        onFilterChange(appliedFilters);
    }, [appliedFilters, onFilterChange]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            const serviceId = value;
            setWorkingFilters(prev => {
                const newServices = checked
                    ? [...prev.selectedServices, serviceId]
                    : prev.selectedServices.filter(id => id !== serviceId);
                return { ...prev, selectedServices: newServices };
            });
        } else {
            setWorkingFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    // 🛑 Manejador para el nuevo botón "Filtrar"
    const handleApplyFilters = () => {
        setAppliedFilters(workingFilters);
    };

    const handleClearFilters = () => {
        const cleared = { capacity: '', selectedServices: [], cabinType: '', startDate: '', endDate: '' };
        setWorkingFilters(cleared);
        setAppliedFilters(cleared); // Aplicar la limpieza inmediatamente
    };

    return (
        <div className="filter-bar bg-light p-3 rounded shadow-sm">
            <h4 className="mb-3">Filtros de Búsqueda </h4>
            <div className="row g-3">
                
                {/* FILTROS DE FECHA */}
                <div className="col-md-3">
                    <label className="form-label small fw-bold">Fecha de Inicio:</label>
                    <input type="date" className="form-control form-control-sm" name="startDate" 
                           value={workingFilters.startDate} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                    <label className="form-label small fw-bold">Fecha de Fin:</label>
                    <input type="date" className="form-control form-control-sm" name="endDate" 
                           value={workingFilters.endDate} onChange={handleChange} />
                </div>
                
                {/* FILTRO POR CAPACIDAD */}
                <div className="col-md-2">
                    <label className="form-label small fw-bold">Capacidad Mínima:</label>
                    <input type="number" className="form-control form-control-sm" name="capacity" 
                           value={workingFilters.capacity} onChange={handleChange} min="1" />
                </div>
                
                {/* 🛑 FILTRO POR TIPO/TAMAÑO */}
                <div className="col-md-2">
                    <label className="form-label small fw-bold">Tipo de Cabaña:</label>
                    <select className="form-select form-select-sm" name="cabinType" 
                            value={workingFilters.cabinType} onChange={handleChange}>
                        <option value="">Cualquier Tipo</option>
                        {CABIN_TYPES.map(type => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* 🛑 BOTONES DE ACCIÓN */}
                <div className="col-md-2 d-flex align-items-end btn-group">
                    <button className="btn btn-sm btn-primary" onClick={handleApplyFilters}>
                        Filtrar
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleClearFilters}>
                        Limpiar
                    </button>
                </div>

                {/* FILTRO DE SERVICIOS */}
                <div className="col-12 border-top pt-2">
                    <label className="form-label small fw-bold">Servicios Incluidos:</label>
                    <div className="d-flex flex-wrap">
                        {initialServices.map(service => (
                            <div key={service.id_servicio} className="form-check me-3">
                                <input className="form-check-input" type="checkbox"
                                       name="selectedServices" value={service.id_servicio}
                                       id={`service-${service.id_servicio}`} onChange={handleChange}
                                       checked={workingFilters.selectedServices.includes(String(service.id_servicio))} />
                                <label className="form-check-label small" htmlFor={`service-${service.id_servicio}`}>
                                    {service.nombre_servicio}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                
            </div>
        </div>
    );
}

export default FilterBar;