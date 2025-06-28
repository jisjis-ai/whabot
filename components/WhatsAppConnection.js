'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  QrCode, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import io from 'socket.io-client';

export default function WhatsAppConnection() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [socket, setSocket] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Conectar ao servidor Socket.IO
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Listeners para eventos do WhatsApp
    newSocket.on('qr', (qr) => {
      setQrCode(qr);
      setConnectionStatus('qr_ready');
    });

    newSocket.on('ready', (info) => {
      setConnectionStatus('connected');
      setPhoneNumber(info.wid.user);
      setQrCode(null);
    });

    newSocket.on('disconnected', () => {
      setConnectionStatus('disconnected');
      setQrCode(null);
      setPhoneNumber('');
    });

    newSocket.on('auth_failure', () => {
      setConnectionStatus('auth_failed');
      setQrCode(null);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleConnect = () => {
    if (socket) {
      socket.emit('initialize');
      setConnectionStatus('connecting');
    }
  };

  const handleDisconnect = () => {
    if (socket) {
      socket.emit('disconnect_whatsapp');
    }
  };

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          title: 'WhatsApp Conectado',
          description: `Conectado como: +${phoneNumber}`,
          action: 'Desconectar'
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          title: 'Conectando...',
          description: 'Aguarde enquanto conectamos ao WhatsApp',
          action: null
        };
      case 'qr_ready':
        return {
          icon: QrCode,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          title: 'QR Code Pronto',
          description: 'Escaneie o QR Code com seu WhatsApp',
          action: null
        };
      case 'auth_failed':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          title: 'Falha na Autenticação',
          description: 'Erro ao conectar. Tente novamente.',
          action: 'Tentar Novamente'
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          title: 'WhatsApp Desconectado',
          description: 'Conecte seu WhatsApp para começar',
          action: 'Conectar'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Conexão WhatsApp</h2>
        <p className="text-gray-600">Gerencie sua conexão com o WhatsApp</p>
      </div>

      {/* Status Card */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-16 h-16 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
            <StatusIcon className={`w-8 h-8 ${statusInfo.color} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{statusInfo.title}</h3>
            <p className="text-gray-600">{statusInfo.description}</p>
          </div>
        </div>

        {statusInfo.action && (
          <button
            onClick={connectionStatus === 'connected' ? handleDisconnect : handleConnect}
            className={`btn-${connectionStatus === 'connected' ? 'secondary' : 'whatsapp'} flex items-center`}
            disabled={connectionStatus === 'connecting'}
          >
            <Smartphone className="w-5 h-5 mr-2" />
            {statusInfo.action}
          </button>
        )}
      </div>

      {/* QR Code */}
      {qrCode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Escaneie o QR Code
          </h3>
          <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
            <img 
              src={qrCode} 
              alt="QR Code WhatsApp" 
              className="w-64 h-64 mx-auto"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>1. Abra o WhatsApp no seu celular</p>
            <p>2. Vá em Configurações → Dispositivos conectados</p>
            <p>3. Toque em "Conectar dispositivo"</p>
            <p>4. Escaneie este QR Code</p>
          </div>
        </motion.div>
      )}

      {/* Connection Info */}
      {connectionStatus === 'connected' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações da Conexão
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Número</p>
              <p className="font-medium">+{phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conectado em</p>
              <p className="font-medium">{new Date().toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plataforma</p>
              <p className="font-medium">WhatsApp Web</p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 Dicas Importantes
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Mantenha seu celular conectado à internet</li>
          <li>• Não feche o WhatsApp no celular</li>
          <li>• A conexão pode cair se o celular ficar offline</li>
          <li>• Use delays entre mensagens para evitar banimento</li>
        </ul>
      </div>
    </div>
  );
}