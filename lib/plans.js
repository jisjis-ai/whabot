// Planos disponíveis
export const plans = {
  free: {
    name: 'Gratuito',
    price: 0,
    duration: 'Permanente',
    features: {
      messages: 20,
      numbers: 1,
      ai: 'Básica',
      campaigns: 'Simples',
      support: 'Comunidade'
    },
    color: 'gray'
  },
  starter: {
    name: 'Iniciante',
    price: 250,
    duration: '7 dias',
    features: {
      messages: 500,
      numbers: 1,
      ai: 'Básica',
      campaigns: 'Avançadas',
      support: 'Email'
    },
    color: 'blue'
  },
  professional: {
    name: 'Profissional',
    price: 600,
    duration: '30 dias',
    features: {
      messages: 5000,
      numbers: 3,
      ai: 'Completa',
      campaigns: 'Ilimitadas',
      support: 'WhatsApp'
    },
    color: 'green'
  },
  business: {
    name: 'Empresarial',
    price: 1200,
    duration: '30 dias',
    features: {
      messages: 15000,
      numbers: 5,
      ai: 'IA + Webhooks',
      campaigns: 'Ilimitadas',
      support: 'Prioritário'
    },
    color: 'purple'
  },
  premium: {
    name: 'Premium',
    price: 2500,
    duration: '30 dias',
    features: {
      messages: 'Ilimitado',
      numbers: 'Ilimitado',
      ai: 'IA Avançada',
      campaigns: 'Ilimitadas',
      support: 'VIP 24/7'
    },
    color: 'yellow'
  }
};

// Verificar se usuário pode enviar mensagem
export const canSendMessage = (userData) => {
  if (!userData) return false;
  
  // Verificar se plano expirou
  if (userData.planExpiry && new Date(userData.planExpiry) < new Date()) {
    return false;
  }
  
  // Verificar limite de mensagens
  if (userData.plan === 'premium') return true;
  
  const plan = plans[userData.plan];
  if (!plan) return false;
  
  return userData.messagesUsed < plan.features.messages;
};

// Verificar se pode conectar mais números
export const canConnectNumber = (userData) => {
  if (!userData) return false;
  
  const plan = plans[userData.plan];
  if (!plan) return false;
  
  if (userData.plan === 'premium') return true;
  
  return userData.numbersConnected < plan.features.numbers;
};

// Atualizar uso de mensagens
export const updateMessageUsage = async (uid, count = 1) => {
  try {
    const userData = await getUserData(uid);
    if (!userData) return false;
    
    const newCount = (userData.messagesUsed || 0) + count;
    await updateUserData(uid, { ...userData, messagesUsed: newCount });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar uso de mensagens:', error);
    return false;
  }
};

export { plans }

export { canSendMessage, canConnectNumber }