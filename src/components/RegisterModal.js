
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 

function RegisterModal({ onClose, onSuccessfulRegistration }) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState(''); 
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [telefono, setTelefono] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('usuario')
                .insert([
                    { 
                        nombre: nombre, 
                        apellido: apellido, 
                        email: email, 
                        contrasena: contrasena, 
                        telefono: telefono 
                    }
                ])
                .select();
            
            if (error) throw error;

            alert('¡Registro exitoso! Ya puedes iniciar sesión.');
            
            onSuccessfulRegistration(data[0]); 

        } catch (err) {
            console.error('Error durante el registro:', err);
            setError('Error al registrar usuario. Asegúrese de que el correo no esté ya en uso.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reservation-form-overlay">
            <div className="login-modal">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0">Registro de Nuevo Cliente</h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                
                <form onSubmit={handleRegister}>
                    
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="nombre" className="form-label small">Nombre</label>
                            <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                id="nombre" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="apellido" className="form-label small">Apellido</label>
                            <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                id="apellido" 
                                value={apellido} 
                                onChange={(e) => setApellido(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label small">Correo Electrónico</label>
                        <input 
                            type="email" 
                            className="form-control form-control-sm" 
                            id="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="contrasena" className="form-label small">Contraseña</label>
                            <input 
                                type="password"
                                className="form-control form-control-sm" 
                                id="contrasena" 
                                value={contrasena} 
                                onChange={(e) => setContrasena(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="telefono" className="form-label small">Teléfono</label>
                            <input 
                                type="tel" 
                                className="form-control form-control-sm" 
                                id="telefono" 
                                value={telefono} 
                                onChange={(e) => setTelefono(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>


                    {error && <div className="alert alert-danger small mt-2">{error}</div>}

                    <button type="submit" className="btn btn-primary w-100 mt-3" disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Registrar Cuenta'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterModal;