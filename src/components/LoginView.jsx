import React, { useState } from 'react';
import {
  Compass,
  Lock,
  User,
  LogIn,
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Badge } from './ui';

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

  const prellenarCredencial = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-dark-bg relative overflow-hidden">
      {/* Luces de fondo decorativas y sutiles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl border-dark-borderSubtle relative z-10 animate-fade-in">
        {/* Encabezado y Marca */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
            <Compass size={32} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-100 tracking-tight">
                HackaCode Turismo
              </h1>
              <Badge variant="brand" size="sm">Enterprise</Badge>
            </div>
            <p className="text-xs sm:text-sm text-dark-muted">
              Plataforma de gestión operativa y comercial de viajes
            </p>
          </div>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-slide-up">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Nombre de Usuario *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                className="input-control pl-9 text-xs sm:text-sm"
                placeholder="Ej. admin o vendedor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Contraseña de Acceso *
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="input-control pl-9 pr-10 text-xs sm:text-sm"
                placeholder="Ingresa tu clave"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-gray-200 p-1"
                title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full py-2.5 text-sm font-bold shadow-md shadow-brand-600/20"
            leftIcon={<LogIn size={16} />}
          >
            Iniciar Sesión
          </Button>
        </form>

        {/* Accesos Rápidos de Demostración para Evaluadores */}
        <div className="p-3.5 rounded-xl bg-dark-bg/80 border border-dark-borderSubtle text-left space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
            <KeyRound size={14} className="text-brand-400" />
            <span>Acceso Rápido para Demostración / Portfolio:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => prellenarCredencial('admin', 'Admin1234!')}
              className="p-2 rounded-lg bg-dark-surface hover:bg-dark-elevated border border-dark-borderSubtle hover:border-brand-500/50 text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-gray-200 group-hover:text-brand-300 flex items-center gap-1">
                <ShieldCheck size={12} className="text-amber-400" /> Rol ADMIN
              </div>
              <div className="text-[10px] text-dark-muted mt-0.5">admin / Admin1234!</div>
            </button>

            <button
              type="button"
              onClick={() => prellenarCredencial('vendedor', 'Vendedor1234!')}
              className="p-2 rounded-lg bg-dark-surface hover:bg-dark-elevated border border-dark-borderSubtle hover:border-brand-500/50 text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-gray-200 group-hover:text-brand-300 flex items-center gap-1">
                <UserCheck size={12} className="text-brand-400" /> Rol VENDEDOR
              </div>
              <div className="text-[10px] text-dark-muted mt-0.5">vendedor / Vendedor1234!</div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
