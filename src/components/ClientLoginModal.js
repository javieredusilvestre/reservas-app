// src/components/ClientLoginModal.js

import React, { useState } from 'react';

function ClientLoginModal({ onLogin, onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Llama a la función de login en App.js con email y password
        onLogin(email, password); 
    };

    return (
        <div className="reservation-form-overlay"> 
            <div className="login-modal card p-4 shadow-lg" style={{ width: '90%', maxWidth: '400px' }}>
                <h5 className="card-title mb-4">🚪 Iniciar Sesión de Cliente</h5>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email-input-client" className="form-label">Correo Electrónico:</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email-input-client"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        {/* Nota: En tu esquema, la contraseña es "Solo para administrador". 
                           Aquí la incluimos, pero App.js la ignorará por ahora o usará una contraseña mock. */}
                        <label htmlFor="password-input-client" className="form-label">Contraseña:</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password-input-client"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="d-flex justify-content-between mt-4">
                        <button type="submit" className="btn btn-primary">Entrar</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClientLoginModal;