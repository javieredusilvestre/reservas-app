// src/components/LoginModal.js (CORREGIDO - Pide Email y Contraseña)

import React, { useState } from 'react';

function LoginModal({ onLogin, onClose }) {
    // 🛑 Inicialización de estados para ambos campos
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // 🛑 Pasamos ambos valores a la función de login en App.js
        onLogin(email, password); 
        setEmail('');
        setPassword('');
    };

    return (
        <div className="reservation-form-overlay"> 
            <div className="login-modal card p-4 shadow-lg" style={{ width: '90%', maxWidth: '400px' }}>
                <h5 className="card-title mb-4">🔐 Iniciar Sesión como Administrador</h5>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* CAMPO DE CORREO ELECTRÓNICO */}
                    <div className="mb-3">
                        <label htmlFor="email-input" className="form-label">Correo Electrónico:</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* CAMPO DE CONTRASEÑA */}
                    <div className="mb-3">
                        <label htmlFor="password-input" className="form-label">Contraseña:</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password-input"
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

export default LoginModal;