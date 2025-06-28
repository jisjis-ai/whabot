'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  Star,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Bot,
  Crown
} from 'lucide-react';
import AuthModal from './AuthModal';
import { plans } from '../lib/plans';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const features = [
    {
      icon: MessageCircle,
      title: 'Envio em Massa',
      description: 'Envie milhares de mensagens personalizadas com delays inteligentes'
    },
    {
      icon: Bot,
      title: 'IA Integrada',
      description: 'Chatbot com GPT-4 que responde como humano da sua empresa'
    },
    {
      icon: Users,
      title: 'Gestão de Grupos',
      description: 'Gerencie grupos, mencione todos e envie mensagens imutáveis'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Avançados',
      description: 'Acompanhe entregas, visualizações e engajamento em tempo real'
    },
    {
      icon: Zap,
      title: 'Automação Completa',
      description: 'Fluxos automatizados com palavras-chave e respostas inteligentes'
    },
    {
      icon: Shield,
      title: 'Anti-Ban Avançado',
      description: 'Sistema inteligente que protege sua conta contra banimentos'
    }
  ];

  const testimonials = [
    {
      name: 'João Silva',
      role: 'Empresário',
      content: 'Aumentei minhas vendas em 300% usando o WhatsApp Pro. A IA é incrível!',
      rating: 5
    },
    {
      name: 'Maria Santos',
      role: 'Marketing Digital',
      content: 'Melhor plataforma de WhatsApp marketing que já usei. Recomendo!',
      rating: 5
    },
    {
      name: 'Pedro Costa',
      role: 'E-commerce',
      content: 'O sistema anti-ban funcionou perfeitamente. Nunca fui bloqueado.',
      rating: 5
    }
  ];

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-whatsapp-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">WhatsApp Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => openAuth('login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Entrar
              </button>
              <button 
                onClick={() => openAuth('register')}
                className="btn-whatsapp"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-whatsapp-50 to-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Marketing no
                <span className="text-whatsapp-500"> WhatsApp</span>
                <br />
                <span className="text-primary-600">Profissional</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Plataforma completa com IA, automação avançada e sistema anti-ban. 
                Aumente suas vendas e engajamento com o poder do WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => openAuth('register')}
                  className="btn-whatsapp text-lg px-8 py-4 flex items-center justify-center"
                >
                  Começar Grátis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="btn-secondary text-lg px-8 py-4">
                  Ver Demonstração
                </button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-whatsapp-500 mr-2" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-whatsapp-500 mr-2" />
                  Setup em 2 minutos
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-whatsapp-500 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">WhatsApp Conectado</h3>
                    <p className="text-sm text-gray-500">Status: Online</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-whatsapp-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">📊 Mensagens enviadas hoje: <strong>2,847</strong></p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">🤖 IA respondeu: <strong>156 conversas</strong></p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">💰 Conversões: <strong>R$ 12.450</strong></p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-whatsapp-200 rounded-full opacity-20 float-animation"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-200 rounded-full opacity-20 float-animation" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Recursos Profissionais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para dominar o marketing no WhatsApp
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-whatsapp-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-whatsapp-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos para Todos os Tamanhos
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para seu negócio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Object.entries(plans).map(([key, plan]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`card relative ${plan.name === 'Profissional' ? 'ring-2 ring-whatsapp-500' : ''}`}
              >
                {plan.name === 'Profissional' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-whatsapp-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Grátis' : `${plan.price} MZN`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500">/{plan.duration}</span>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-6 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-whatsapp-500 mr-2" />
                      {typeof plan.features.messages === 'number' 
                        ? `${plan.features.messages} mensagens` 
                        : plan.features.messages}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-whatsapp-500 mr-2" />
                      {typeof plan.features.numbers === 'number' 
                        ? `${plan.features.numbers} número${plan.features.numbers > 1 ? 's' : ''}` 
                        : plan.features.numbers}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-whatsapp-500 mr-2" />
                      IA {plan.features.ai}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-whatsapp-500 mr-2" />
                      Campanhas {plan.features.campaigns}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-whatsapp-500 mr-2" />
                      Suporte {plan.features.support}
                    </li>
                  </ul>
                  
                  <button 
                    onClick={() => openAuth('register')}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      plan.name === 'Profissional' 
                        ? 'btn-whatsapp' 
                        : 'btn-secondary'
                    }`}
                  >
                    {plan.price === 0 ? 'Começar Grátis' : 'Escolher Plano'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 whatsapp-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Pronto para Revolucionar seu Marketing?
            </h2>
            <p className="text-xl text-whatsapp-100 mb-8">
              Junte-se a milhares de empresas que já aumentaram suas vendas com o WhatsApp Pro
            </p>
            <button 
              onClick={() => openAuth('register')}
              className="bg-white text-whatsapp-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-lg transition-colors duration-200 inline-flex items-center"
            >
              Começar Agora - É Grátis
              <Crown className="ml-2 w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-whatsapp-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">WhatsApp Pro</span>
              </div>
              <p className="text-gray-400">
                A plataforma mais avançada de marketing no WhatsApp.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Recursos</li>
                <li>Preços</li>
                <li>API</li>
                <li>Integrações</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Contato</li>
                <li>Status</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Privacidade</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WhatsApp Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}