// src/App.js (VERSION FINAL Y COMPLETA)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient'; 
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import CabinList from './components/CabinList';
import FilterBar from './components/FilterBar';
import AdminDashboard from './components/AdminDashboard'; 
import LoginModal from './components/LoginModal'; // Login Admin
import RegisterModal from './components/RegisterModal'; // Registro Cliente
import ClientLoginModal from './components/ClientLoginModal'; // Login Cliente
import './styles.css'; 

// =============================================================
// UTILIDADES
// =============================================================
const simulateEmailConfirmation = async ({ recipient, reservationId, cabinId, dates }) => {
    // Simulación de envío de correo (RF5)
    await new Promise(resolve => setTimeout(resolve, 500)); 
    console.log(`[RF5 Éxito] Correo de confirmación simulado enviado a ${recipient} para Reserva #${reservationId}.`);
    return { success: true, message: 'Correo enviado' };
};

const checkCabinAvailabilityDB = async (cabinId, startDate, endDate) => {
    // Verifica solapamiento de fechas en DB
    const { count, error } = await supabase
        .from('reserva')
        .select('id_reserva', { count: 'exact' })
        .eq('id_cabana', cabinId)
        .neq('estado_reserva', 'Cancelada') 
        .or(`and(fecha_inicio.lte.${endDate},fecha_fin.gte.${startDate})`); 

    if (error) {
        console.error('Error al verificar disponibilidad:', error);
        return false;
    }
    
    return count === 0;
}

const fetchNextAvailableDate = async (cabinId) => {
    // Busca la fecha de fin más reciente para la disponibilidad futura
    const { data, error } = await supabase
        .from('reserva')
        .select('fecha_fin')
        .eq('id_cabana', cabinId)
        .neq('estado_reserva', 'Cancelada')
        .order('fecha_fin', { ascending: false })
        .limit(1);

    if (error || data.length === 0) {
        return null;
    }

    const lastEndDate = new Date(data[0].fecha_fin);
    lastEndDate.setDate(lastEndDate.getDate() + 1);

    return lastEndDate.toISOString().split('T')[0];
};


function AppContent() {
  const navigate = useNavigate();
    
  const [cabins, setCabins] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Gestión de Autenticación
  const [is_admin, setIsAdmin] = useState(false); 
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false); 
  const [clientUser, setClientUser] = useState(null); 
  const [showRegisterModal, setShowRegisterModal] = useState(false); 
  const [showClientLoginModal, setShowClientLoginModal] = useState(false); 

  // Estado de filtros
  const [filters, setFilters] = useState({ capacity: '', selectedServices: [], cabinType: '', startDate: '', endDate: '' });
  
  // Estado para el filtro de fecha asíncrono
  const [availableCabinIdsByDate, setAvailableCabinIdsByDate] = useState(null);
  const [isDateFiltering, setIsDateFiltering] = useState(false);

  // 1. Función para cargar datos iniciales (RF1 y RF4)
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    
    // Cargar Cabañas y sus Servicios relacionados
    const { data: cabinData, error: cabinError } = await supabase
      .from('cabana') 
      .select(`*, cabana_servicio(id_servicio)`); 

    if (cabinError) {
      console.error('Error cargando cabañas:', cabinError);
      setLoading(false);
      return;
    }

    const formattedCabins = await Promise.all(cabinData.map(async (cabin) => {
        let nextAvailableDate = null;
        
        if (cabin.estado !== 'Disponible') {
             nextAvailableDate = await fetchNextAvailableDate(cabin.id_cabana);
        }

        return {
            ...cabin,
            Servicios: cabin.cabana_servicio.map(cs => cs.id_servicio),
            nextAvailableDate: nextAvailableDate, 
            id_cabana: cabin.id_cabana, 
            precio_base: cabin.precio_base,
            capacidad: cabin.capacidad,
            estado: cabin.estado,
            tipo: cabin.tipo,
            descripcion: cabin.descripcion,
            url_imagen: cabin.url_imagen 
        };
    }));
    setCabins(formattedCabins);

    // Cargar la lista maestra de Servicios
    const { data: serviceData, error: serviceError } = await supabase
      .from('servicio')
      .select('id_servicio, nombre_servicio'); 

    if (serviceError) {
      console.error('Error cargando servicios:', serviceError);
    } else {
      setServices(serviceData);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  
  // Lógica Asíncrona de Filtrado por Fecha Global (RF2)
  useEffect(() => {
    const { startDate, endDate } = filters;
    
    if (!startDate || !endDate || new Date(endDate) <= new Date(startDate)) {
        setAvailableCabinIdsByDate(null);
        return;
    }

    const applyDateFilter = async () => {
        setIsDateFiltering(true);
        const availableIds = [];

        const currentlyAvailableCabins = cabins.filter(c => c.estado === 'Disponible');
        
        const availabilityChecks = currentlyAvailableCabins.map(cabin => 
            checkCabinAvailabilityDB(cabin.id_cabana, startDate, endDate)
                .then(isAvailable => ({ id: cabin.id_cabana, isAvailable }))
        );
        
        const results = await Promise.all(availabilityChecks);
        
        results.forEach(result => {
            if (result.isAvailable) {
                availableIds.push(result.id);
            }
        });
        
        setAvailableCabinIdsByDate(new Set(availableIds));
        setIsDateFiltering(false);
    };

    applyDateFilter();
  }, [filters.startDate, filters.endDate, cabins]);


  // 2. Lógica de Filtrado Combinado (RF2)
  const filteredCabins = useMemo(() => {
    let resultCabins = cabins.filter(cabin => {
      
      const isDateFilterActive = filters.startDate && filters.endDate;

      // 1. FILTRO DE FECHA (Si está activo, solo muestra las disponibles)
      if (isDateFilterActive) {
          if (availableCabinIdsByDate === null || !availableCabinIdsByDate.has(cabin.id_cabana)) {
              return false;
          }
      } 
      
      // 2. EXCLUIR ESTADO "En Mantenimiento"
      if (!isDateFilterActive && cabin.estado === 'En Mantenimiento') {
          return false;
      }
      
      // 3. FILTROS ESTÁNDAR 
      
      // Por tipo/tamaño
      if (filters.cabinType) {
        const normalizedCabinType = cabin.tipo ? cabin.tipo.toLowerCase() : '';
        if (normalizedCabinType !== filters.cabinType.toLowerCase()) return false;
      }

      // Por capacidad
      if (filters.capacity && cabin.capacidad < parseInt(filters.capacity)) return false;
      
      // Por servicios
      if (filters.selectedServices.length > 0) {
        const cabinServiceIds = new Set(cabin.Servicios);
        if (!filters.selectedServices.every(serviceId => cabinServiceIds.has(parseInt(serviceId)))) return false;
      }
      
      return true;
    });
    
    return resultCabins;
  }, [cabins, filters, availableCabinIdsByDate]); 


  // 3. Función para manejar la reserva (RF3 y RF5)
  const handleNewReservation = async (data) => {
    
    if (data.action === 'check_availability') {
        const { cabinId, startDate, endDate } = data;
        const isAvailable = await checkCabinAvailabilityDB(cabinId, startDate, endDate);
        return { available: isAvailable };
    }

    if (data.action === 'create_reservation') {
        if (!clientUser || !clientUser.id_usuario) {
            alert("ERROR: Debe iniciar sesión para confirmar la reserva.");
            setShowRegisterModal(true); 
            return; 
        }
        
        const ID_USUARIO_RESERVA = clientUser.id_usuario; 
        const { Email, startDate, endDate, cabinId, totalPrice } = data; 

        if (isNaN(totalPrice)) {
             alert("Error de cálculo: El precio total de la reserva no es válido.");
             return;
        }

        try {
            const isAvailable = await checkCabinAvailabilityDB(cabinId, startDate, endDate);

            if (!isAvailable) {
                throw new Error("La cabaña se reservó en este instante. Intente con otras fechas.");
            }

            // a) Insertar en la tabla RESERVA (RF3)
            const { data: newReservation, error: reserveError } = await supabase
                .from('reserva')
                .insert([
                    { 
                        id_cabana: cabinId, 
                        id_usuario: ID_USUARIO_RESERVA, 
                        fecha_inicio: startDate, 
                        fecha_fin: endDate,
                        precio_total: totalPrice,
                        estado_reserva: "Confirmada", 
                    }
                ])
                .select();

            if (reserveError) throw reserveError;
            
            const reservationId = newReservation[0].id_reserva;
            
            // b) Actualizar el estado de la cabaña (RF3)
            const { error: updateError } = await supabase
                .from('cabana')
                .update({ estado: 'Reservada' })
                .eq('id_cabana', cabinId);
                
            if (updateError) throw updateError;
            
            // c) Notificación (RF5)
            await simulateEmailConfirmation({ 
                recipient: Email, 
                reservationId: reservationId, 
                cabinId: cabinId,
                dates: `${startDate} al ${endDate}`
            });
            
            // d) Actualizar estado local
            setCabins(prevCabins => 
                prevCabins.map(cabin => 
                    cabin.id_cabana === cabinId ? { ...cabin, estado: "Reservada" } : cabin
                )
            );

            alert(`Reserva ${reservationId} confirmada exitosamente.`);
            fetchInitialData(); 

        } catch (error) {
            console.error('Error en la transacción de reserva:', error);
            alert('Error en la reserva: ' + error.message);
        }
    }
  };
  
  // ----------------------------------------------------
  // GESTIÓN DE CLIENTES/ADMIN
  // ----------------------------------------------------
  const handleSuccessfulRegistration = (newUser) => {
      setClientUser({ id_usuario: newUser.id_usuario, nombre: newUser.nombre, email: newUser.email });
      setShowRegisterModal(false);
  };

  const handleClientLogin = async (email, password) => {
    try {
        const { data: users, error } = await supabase
            .from('usuario')
            .select('id_usuario, nombre, email, contrasena') 
            .eq('email', email)
            .limit(1);

        if (error || users.length === 0) {
            alert("Usuario no encontrado. Verifique el correo o regístrese.");
            return;
        }
        const user = users[0];
        if (user.contrasena !== password) {
            alert("Contraseña incorrecta.");
            return;
        }

        setClientUser({ id_usuario: user.id_usuario, nombre: user.nombre, email: user.email });
        setShowClientLoginModal(false);
        alert(`¡Bienvenido de nuevo, ${user.nombre}!`);

    } catch (e) {
        console.error('Error al iniciar sesión de cliente:', e);
        alert('Ocurrió un error al intentar iniciar sesión.');
    }
  };
  
  const handleClientLogout = () => {
    setClientUser(null);
    alert('Sesión de cliente cerrada.');
  }

  // LÓGICA DE LOGOUT DE ADMIN CON REDIRECCIÓN
  const handleAdminLoginToggle = () => {
      if (is_admin) {
          setIsAdmin(false);
          alert("Sesión de administrador cerrada.");
          navigate("/"); // Redirigir a la página principal
      } else {
          setShowAdminLoginModal(true);
      }
  }

  const handleAdminLogin = (email, password) => { 
    const ADMIN_EMAIL = "admin@futangue.cl"; 
    const ADMIN_PASSWORD = "admin123"; 

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) { 
        setIsAdmin(true);
        setShowAdminLoginModal(false);
        alert("¡Acceso de administrador concedido!");
    } else {
        alert("Credenciales incorrectas."); 
    }
  }
  
  if (loading) {
    return <div className="container mt-5"><div className="alert alert-info" role="alert">Cargando datos de cabañas...</div></div>;
  }
  
  const totalCabinsDisplayed = filteredCabins.length;

  return (
    <div className="container mt-4 mb-5 app-container">
      
      {/* HEADER con diseño hotelero */}
      <header className="navbar navbar-expand-lg navbar-light bg-light rounded shadow-sm px-4 mb-4">
        <h1 className="navbar-brand h3 mb-0">Reserva de Cabañas - Parque Futangue</h1>
        
        
        <nav className="main-nav d-flex flex-grow-1 justify-content-end align-items-center">
          
          {/* 1. GRUPO DE ACCESO DE CLIENTE - 🛑 SOLO VISIBLE SI NO ES ADMIN 🛑 */}
          {!is_admin && ( 
            <>
              {clientUser ? (
                 <>
                    <span className="me-3 text-success fw-bold">Hola, {clientUser.nombre}!</span>
                    <button 
                        className="btn btn-sm btn-outline-danger me-3" 
                        onClick={handleClientLogout} 
                    >
                        Cerrar Sesión
                    </button>
                 </>
              ) : (
                 <div className="btn-group btn-auth-group me-3" role="group">
                     <button 
                        className="btn btn-sm btn-outline-success" 
                        onClick={() => setShowRegisterModal(true)} 
                     >
                        Registrarse
                     </button>
                     <button 
                        className="btn btn-sm btn-success" 
                        onClick={() => setShowClientLoginModal(true)} 
                     >
                        Iniciar Sesión
                     </button>
                 </div>
              )}
            </>
          )} 
          {/* Fin del bloque de cliente */}
          
          {/* 3. ACCESO DE ADMINISTRADOR */}
          {is_admin ? (
              <>
                <Link to="/admin" className="btn btn-sm btn-outline-secondary me-2">Panel Admin</Link>
                <button 
                    className="btn btn-sm btn-primary" 
                    onClick={handleAdminLoginToggle} 
                >
                    Cerrar Sesión Admin
                </button>
              </>
          ) : (
             <button 
                className="btn btn-sm btn-admin-access" 
                onClick={handleAdminLoginToggle} 
             >
                 Acceso Admin
             </button>
          )}
        </nav>
      </header>
      
      <Routes>
        <Route path="/" element={
          <>
            <FilterBar 
              initialServices={services} 
              onFilterChange={setFilters} 
            />
            <hr className="my-4"/>
            <h2 className="h4">
                Cabañas Disponibles ({totalCabinsDisplayed}) 
                {isDateFiltering && (
                    <span className="ms-3 badge bg-warning text-dark">
                        Verificando disponibilidad por fecha...
                    </span>
                )}
            </h2>
            <CabinList 
              cabins={filteredCabins} 
              services={services} 
              onReserve={handleNewReservation} 
            />
          </>
        } />
        
        <Route path="/admin" element={
          is_admin ? (
            <AdminDashboard 
              cabins={cabins} 
              services={services} 
              refreshCabins={fetchInitialData}
            />
          ) : (
            <div className="alert alert-danger" role="alert">Acceso denegado. Por favor, inicie sesión como administrador.</div>
          )
        } />
      </Routes>

      {/* RENDERIZADO DE MODALES */}
      {showRegisterModal && (
          <RegisterModal 
              onClose={() => setShowRegisterModal(false)}
              onSuccessfulRegistration={handleSuccessfulRegistration}
          />
      )}
      {showClientLoginModal && (
          <ClientLoginModal
              onLogin={handleClientLogin} 
              onClose={() => setShowClientLoginModal(false)} 
          />
      )}
      {showAdminLoginModal && (
          <LoginModal 
              onLogin={handleAdminLogin} 
              onClose={() => setShowAdminLoginModal(false)} 
          />
      )}
    </div>
  );
}

// Wrapper para usar Router y Context (necesario para useNavigate)
function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    )
}

export default App;