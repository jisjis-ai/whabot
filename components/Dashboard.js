'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Users, 
  BarChart3, 
  Settings, 
  Bot,
  Zap,
  Crown,
  LogOut,
  Plus,
  Send,
  Upload,
  Download
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { logoutUser } from '../lib/auth';
import { plans, canSendMessage, canConnectNumber } from '../lib/plans';
import WhatsAppConnection from './WhatsAppConnection';
import CampaignManager from './CampaignManager';
import GroupManager from './GroupManager';
import AIChat from './AIChat';
import UpgradeModal from './UpgradeModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, userData, setUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [stats, setStats] = useState({
    messagesSent: 0,
    messagesReceived: 0,
    activeChats: 0,
    conversionRate: 0
  });

  const currentPlan = plans[userData?.plan || 'free'];

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      toast.success('Logout realizado com sucesso!');
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
    { id: 'campaigns', name: 'Campanhas', icon: Send },
    { id: 'groups', name: 'Grupos', icon: Users },
    { id: 'ai', name: 'IA Chat', icon: Bot },
    { id: 'settings', name: 'Configurações', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent stats={stats} userData={userData} currentPlan={currentPlan} />;
      case 'whatsapp':
        return <WhatsAppConnection />;
      case 'campaigns':
        return <CampaignManager userData={userData} />;
      case 'groups':
        return <GroupManager userData={userData} />;
      case 'ai':
        return <AIChat userData={userData} />;
      case 'settings':
        return <SettingsContent userData={userData} setUserData={setUserData} />;
      default:
        return <DashboardContent stats={stats} userData={userData} currentPlan={currentPlan} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-whatsapp-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WhatsApp Pro</h1>
                <p className="text-sm text-gray-500">Olá, {userData?.name || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Plan Badge */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentPlan.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                currentPlan.color === 'green' ? 'bg-green-100 text-green-800' :
                currentPlan.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                currentPlan.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentPlan.name}
              </div>
              
              {userData?.plan !== 'premium' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-whatsapp-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          currentPlan={userData?.plan}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}

// Dashboard Content Component
function DashboardContent({ stats, userData, currentPlan }) {
  const usagePercentage = userData?.plan === 'premium' ? 0 : 
    (userData?.messagesUsed || 0) / currentPlan.features.messages * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral da sua conta</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mensagens Enviadas</p>
              <p className="text-2xl font-bold text-gray-900">{userData?.messagesUsed || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Números Conectados</p>
              <p className="text-2xl font-bold text-gray-900">{userData?.numbersConnected || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chats Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeChats}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso do Plano</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Mensagens</span>
              <span>
                {userData?.messagesUsed || 0} / {
                  currentPlan.features.messages === 'Ilimitado' 
                    ? '∞' 
                    : currentPlan.features.messages
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-whatsapp-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button className="btn-whatsapp flex items-center justify-center">
            <Plus className="w-5 h-5 mr-2" />
            Nova Campanha
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <Upload className="w-5 h-5 mr-2" />
            Importar Contatos
          </button>
        </div>
      </div>
    </div>
  );
}

// Settings Content Component
function SettingsContent({ userData, setUserData }) {
  const [settings, setSettings] = useState({
    apiKey: '',
    webhook: '',
    language: 'pt-BR'
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações</h2>
        <p className="text-gray-600">Gerencie suas preferências</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API do ChatGPT</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              className="input-field"
              placeholder="sk-..."
            />
          </div>
          <button className="btn-primary">Salvar API Key</button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Webhook
            </label>
            <input
              type="url"
              value={settings.webhook}
              onChange={(e) => setSettings({...settings, webhook: e.target.value})}
              className="input-field"
              placeholder="https://..."
            />
          </div>
          <button className="btn-primary">Salvar Webhook</button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup</h3>
        <div className="flex space-x-4">
          <button className="btn-secondary flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Baixar Contatos
          </button>
          <button className="btn-secondary flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Restaurar Backup
          </button>
        </div>
      </div>
    </div>
  );
}