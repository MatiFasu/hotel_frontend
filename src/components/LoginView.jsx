import React, { useState } from 'react';
import { Compass, Lock, User, LogIn, AlertTriangle, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Debes ingresar tu nombre de usuario y contraseña para acceder al sistema.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Usuario o contraseña incorrectos.');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.25rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)'
      }}>
        {/* Encabezado de Marca */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.35)'
          }}>
            <Compass size={30} color="#fff" />
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginTop: '0.2rem'
          }}>
            HackaCode Turismo
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Acceso exclusivo para personal autorizado.<br />Ingresa tu usuario y contraseña para continuar.
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--accent-danger)',
            color: '#f87171',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.88rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Nombre de Usuario *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none' }} />
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                className="input-control"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Contraseña *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none' }} />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="input-control"
                style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              marginTop: '0.35rem',
              padding: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <LogIn size={18} />
            {loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Credenciales de Referencia para Evaluación */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <KeyRound size={14} color="var(--accent-primary)" />
            Credenciales de Evaluación (HackaCode):
          </div>
          <div>• Rol <strong>ADMIN</strong>: usuario <code>admin</code> / clave <code>Admin1234!</code></div>
          <div>• Rol <strong>VENDEDOR</strong>: usuario <code>vendedor</code> / clave <code>Vendedor1234!</code></div>
        </div>
      </div>
    </div>
  );
}
