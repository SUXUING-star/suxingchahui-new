import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import anime from 'animejs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPwdForm from './ForgotPwdForm';
import ResetPwdForm from './ResetPwdForm';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [tempEmail, setTempEmail] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      anime({
        targets: '.auth-modal-overlay',
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
      anime({
        targets: '.auth-modal-content',
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutBack'
      });
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="auth-modal-content relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {mode === 'login' && (
            <LoginForm 
              onSwitchRegister={() => setMode('register')} 
              onSwitchForgot={() => setMode('forgot')}
              onSuccess={onClose}
            />
          )}
          {mode === 'register' && (
            <RegisterForm 
              onSwitchLogin={() => setMode('login')} 
              onSuccess={() => setMode('login')}
            />
          )}
          {mode === 'forgot' && (
            <ForgotPwdForm 
              onSwitchLogin={() => setMode('login')} 
              onCodeSent={(email: string) => { 
                setTempEmail(email); 
                setMode('reset'); 
              }}
            />
          )}
          {mode === 'reset' && (
            <ResetPwdForm 
              email={tempEmail}
              onSwitchLogin={() => setMode('login')}
              onSuccess={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;