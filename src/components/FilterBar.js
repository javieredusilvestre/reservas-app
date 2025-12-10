
import React, { useState, useEffect, useMemo, useCallback } from 'react';

const initialFilters = { 
    capacity: '', 
    selectedServices: [], 
    cabinType: '', 
    startDate: '', 
    endDate: '' 
};

function FilterBar({ initialServices, onFilterChange }) {
    const [filters, setFilters] = useState(initialFilters);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleDateChange = (name, value) => {
        setFilters(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleServiceToggle = (serviceId) => {
        const idStr = String(serviceId);
        setFilters(prev => {
            const currentServices = prev.selectedServices;
            if (currentServices.includes(idStr)) {
                return { 
                    ...prev, 
                    selectedServices: currentServices.filter(id => id !== idStr) 
                };
            } else {
                return { 
                    ...prev, 
                    selectedServices: [...currentServices, idStr] 
                };
            }
        });
    };
    
    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const cabinTypeOptions = useMemo(() => [
        { value: '', label: 'Cualquiera' },
        { value: 'pequeña', label: 'Cabaña Pequeña' },
        { value: 'mediana', label: 'Cabaña Mediana' },
        { value: 'grande', label: 'Cabaña Grande' },
    ], []);


    return (
        <div className="card p-3 mb-4 filter-bar">
            <h5 className="mb-3">Filtros de Búsqueda</h5>
            <form>
                <div className="row g-3">
                    
                    <div className="col-12 col-md-3"> 
                        <label className="form-label small">Tipo de Cabaña</label>
                        <select className="form-select form-select-sm" name="cabinType" value={filters.cabinType} onChange={handleInputChange}>
                            {cabinTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-3"> 
                        <label className="form-label small">Capacidad Mínima</label>
                        <input type="number" className="form-control form-control-sm" name="capacity" 
                               value={filters.capacity} onChange={handleInputChange} min="1" placeholder="Ej: 4" />
                    </div>


                    <div className="col-12 col-md-3"> 
                        <label className="form-label small">Llegada</label>
                        <input type="date" className="form-control form-control-sm" name="startDate" 
                               value={filters.startDate} onChange={e => handleDateChange('startDate', e.target.value)} />
                    </div>


                    <div className="col-12 col-md-3"> 
                        <label className="form-label small">Salida</label>
                        <input type="date" className="form-control form-control-sm" name="endDate" 
                               value={filters.endDate} onChange={e => handleDateChange('endDate', e.target.value)} />
                    </div>
                </div>

                <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleClearFilters}>Limpiar Filtros</button>
                </div>

                <div className="mt-3 border-top pt-3">
                    <label className="form-label small d-block">Servicios ({filters.selectedServices.length} seleccionados)</label>
                    <div className="d-flex flex-wrap gap-2">
                        {initialServices.map(service => (
                            <div key={service.id_servicio} className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`service-${service.id_servicio}`}
                                    checked={filters.selectedServices.includes(String(service.id_servicio))}
                                    onChange={() => handleServiceToggle(service.id_servicio)}
                                />
                                <label className="form-check-label small" htmlFor={`service-${service.id_servicio}`}>
                                    {service.nombre_servicio}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default FilterBar;