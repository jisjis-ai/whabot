export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    currency: 'MZN',
    duration: 'Permanente',
    messages: 20,
    numbers: 1,
    features: [
      'Até 20 mensagens',
      'Conectar 1 número',
      'Campanhas básicas',
      'Suporte por email'
    ],
    color: 'gray',
    popular: false
  },
  starter: {
    id: 'starter',
    name: 'Iniciante',
    price: 250,
    currency: 'MZN',
    duration: '7 dias',
    messages: 500,
    numbers: 1,
    features: [
      'Até 500 mensagens',
      'Conectar 1 número',
      'IA básica',
      'Campanhas avançadas',
      'Relatórios básicos'
    ],
    color: 'blue',
    popular: false
  },
  professional: {
    id: 'professional',
    name: 'Profissional',
    price: 600,
    currency: 'MZN',
    duration: '30 dias',
    messages: 5000,
    numbers: 3,
    features: [
      'Até 5.000 mensagens',
      'Conectar 3 números',
      'IA completa GPT-4',
      'Agendamento de campanhas',
      'Relatórios avançados',
      'Suporte prioritário'
    ],
    color: 'green',
    popular: true
  },
  business: {
    id: 'business',
    name: 'Empresarial',
    price: 1200,
    currency: 'MZN',
    duration: '30 dias',
    messages: 15000,
    numbers: 5,
    features: [
      'Até 15.000 mensagens',
      'Conectar 5 números',
      'IA + Webhooks',
      'Automação avançada',
      'API personalizada',
      'Suporte 24/7'
    ],
    color: 'purple',
    popular: false
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 2500,
    currency: 'MZN',
    duration: '30 dias',
    messages: 999999,
    numbers: 999,
    features: [
      'Mensagens ilimitadas',
      'Números ilimitados',
      'Todas as funcionalidades',
      'Suporte dedicado',
      'Treinamento personalizado',
      'Integração customizada'
    ],
    color: 'yellow',
    popular: false
  }
};

export const getPlanById = (planId) => {
  return PLANS[planId] || PLANS.free;
};

export const getPlanColor = (planId) => {
  const colors = {
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  };
  
  const plan = getPlanById(planId);
  return colors[plan.color] || colors.gray;
};