// src/components/CabinCard.js (FINAL Y FUNCIONAL)
import React, { useState, useMemo } from 'react';
import ReservationForm from './ReservationForm';

// Función para formatear el precio usando la localización Chilena (es-CL)
const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null) return 'N/A';
    
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0, 
    }).format(amount);
};


function CabinCard({ cabin, services, onReserve }) {
    // Estados para la reserva por fechas
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    // Cálculo de precios
    const includedServices = useMemo(() => 
        services.filter(service => cabin.Servicios.includes(service.id_servicio))
    , [cabin.Servicios, services]);
    
    const calculatePrice = () => {
        // Lógica simplificada: Solo se usa el precio base.
        return cabin.precio_base; 
    };
    const pricePerNight = calculatePrice();


    const handleDateSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('Verificando disponibilidad...');

        const start = startDate;
        const end = endDate;

        if (new Date(end) <= new Date(start) || !start || !end) {
            setStatusMessage('Error: Seleccione un rango de fechas válido.');
            return;
        }

        const isAvailable = await onReserve({ 
            action: 'check_availability', 
            cabinId: cabin.id_cabana, 
            startDate: start, 
            endDate: end 
        });

        if (isAvailable.available) {
            setStatusMessage('¡Disponible! Complete sus datos y confirme la reserva.');
            setIsFormVisible(true); 
        } else {
            setStatusMessage(`Cabaña no disponible del ${start} al ${end}.`);
            setIsFormVisible(false);
        }
    };


    const handleFinalReservation = (formData) => {
        // Cálculo de días y precio total
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const totalPrice = pricePerNight * diffDays; 

        if (isNaN(totalPrice)) {
            alert("Error de cálculo: El precio total no es válido.");
            return;
        }

        onReserve({
            action: 'create_reservation',
            cabinId: cabin.id_cabana, 
            startDate, 
            endDate,
            totalPrice,
            Email: formData.Email,
        });
        
        setIsFormVisible(false); 
    };

    const statusClass = cabin.estado === 'Disponible' ? 'bg-success' : cabin.estado === 'Reservada' ? 'bg-warning text-dark' : 'bg-danger';

    return (
        <div className={`card h-100 shadow-sm border-start border-5 ${cabin.estado === 'Disponible' ? 'border-primary' : 'border-secondary'}`}> 
            
            {/* HEADER DE IMAGEN */}
            {cabin.url_imagen && (
                <div 
                    className="cabin-image-header"
                    style={{
                        backgroundImage: `url(${cabin.url_imagen})`,
                        height: '180px',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '10px 10px 0 0',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)' 
                    }}></div>
                </div>
            )}

            <div className="card-body d-flex flex-column">
                
                {/* ENCABEZADO: TIPO, ID y PRECIO */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">{cabin.tipo} - Cabaña #{cabin.id_cabana}</h5>
                    <span className="cabin-price text-success fw-bold fs-5">
                        {formatCurrency(pricePerNight)} / Noche
                    </span>
                </div>

                {/* DESCRIPCIÓN */}
                <p className="card-text text-muted mb-3">{cabin.descripcion}</p>
                
                {/* DETALLES (CAPACIDAD, ESTADO) */}
                <div className="row mb-3">
                    <div className="col">
                        <small className="d-block fw-bold">Capacidad:</small>
                        <span>{cabin.capacidad} personas</span>
                    </div>
                    <div className="col">
                        <small className="d-block fw-bold">Estado:</small>
                        <span className={`badge ${statusClass}`}>{cabin.estado}</span>
                        
                        {/* MOSTRAR PRÓXIMA DISPONIBILIDAD */}
                        {cabin.estado === 'Reservada' && cabin.nextAvailableDate && (
                             <small className="text-warning d-block mt-1">
                                 Libre desde: **{new Date(cabin.nextAvailableDate).toLocaleDateString('es-CL')}**
                             </small>
                        )}
                        {cabin.estado === 'Reservada' && !cabin.nextAvailableDate && (
                             <small className="text-success d-block mt-1">
                                 Disponible en cualquier momento.
                             </small>
                        )}
                    </div>
                </div>

                {/* SERVICIOS INCLUIDOS (SIMPLIFICADO) */}
                <div className="mb-3">
                    <small className="d-block fw-bold">Servicios Incluidos:</small>
                    <ul className="list-unstyled small">
                        {includedServices.length > 0 ? (
                            includedServices.map(s => <li key={s.id_servicio}>&bull; {s.nombre_servicio}</li>) 
                        ) : (
                            <li>Ninguno</li>
                        )}
                    </ul>
                </div>
                
                {/* ZONA DE RESERVA (CONDICIONAL) */}
                {cabin.estado !== "En Mantenimiento" ? (
                    <div className="mt-auto pt-3 border-top">
                        <small className="d-block fw-bold mb-2">Verificar Fechas:</small>
                        
                        <form onSubmit={handleDateSubmit} className="row g-2 mb-2">
                            <div className="col-6">
                                <input type="date" className="form-control form-control-sm" 
                                    value={startDate} onChange={e => setStartDate(e.target.value)} required />
                            </div>
                            <div className="col-6">
                                <input type="date" className="form-control form-control-sm" 
                                    value={endDate} onChange={e => setEndDate(e.target.value)} required />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-sm btn-info w-100">Verificar Disponibilidad</button>
                            </div>
                        </form>
                        
                        {statusMessage && <small className="text-muted d-block">{statusMessage}</small>}
                        
                        {isFormVisible && (
                            <ReservationForm 
                                cabinId={cabin.id_cabana}
                                onSubmit={handleFinalReservation} 
                                onClose={() => setIsFormVisible(false)}
                            />
                        )}
                    </div>
                ) : (
                    <div className="alert alert-danger mt-3">Cabaña no disponible por mantenimiento.</div>
                )}
            </div>
        </div>
    );
}

export default CabinCard;