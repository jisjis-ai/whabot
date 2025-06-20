// Configurações do Bot
const config = {
    // Dados do Admin
    admin: {
        owner: '258876219853', // Número do dono - acesso direto
        numbers: ['258876219853'], // Números autorizados como admin
        humanSupport: '258876219853' // Número para atendimento humano
    },
    
    // Mensagens do Bot (Curtas e diretas)
    messages: {
        welcome: `🎰 *Ganhe dinheiro apostando!* 💰

🔥 *CADASTRE-SE AGORA:*
👉 https://receber.netlify.app/register

📋 *COMO FUNCIONAR:*
1️⃣ Clique no link
2️⃣ Cadastre-se
3️⃣ Deposite mínimo 1000 MZN
4️⃣ Envie print do depósito

⚡ *Após depósito:*
• Grupo VIP 🔐
• Sinais certeiros 📊
• Suporte 24h 🕐

*Vamos lucrar!* 🚀`,

        depositRequest: `💸 *PERFEITO!* 

Envie o *PRINT* do seu depósito para liberar acesso ao grupo VIP! 📸

⚠️ *IMPORTANTE:* Apenas a FOTO do comprovante!

Aguardando... ⏰`,

        needPhoto: `❌ *Envie a FOTO do comprovante!*

Preciso ver o print do depósito! 📸

Não texto, apenas imagem! 🖼️`,

        groupAccess: `✅ *DEPÓSITO CONFIRMADO!* 

🎉 Acesso liberado!

🔗 *GRUPO VIP:*
👉 https://chat.whatsapp.com/BD677joED8ABFOVQXv5kPK

🏆 *Agora você é VIP!*`,

        additionalHouses: `🔥 *MULTIPLIQUE SEUS GANHOS!*

Cadastre-se em mais casas! 💰

🎯 *CASA 2:* https://olagiro.netlify.app/
🎯 *CASA 3:* https://megagiro.netlify.app/
🎯 *CASA 4:* https://sshortly.net/e8c338e

💡 *Mais casas = Mais lucro!*`,

        humanSupport: `👨‍💼 *ATENDIMENTO HUMANO*

Você será direcionado para nosso especialista!

Aguarde o contato... 📞`,

        waitingActivation: `⏳ *CONTA EM ATIVAÇÃO*

Seu pagamento foi recebido!
Aguarde a ativação da conta.

Precisa de ajuda? 👇
*Falar com Humano* 👨‍💼`
    },

    // Links das casas
    houses: {
        casa1: 'https://receber.netlify.app/register',
        casa2: 'https://olagiro.netlify.app/',
        casa3: 'https://megagiro.netlify.app/',
        casa4: 'https://sshortly.net/e8c338e'
    },

    // Link do grupo VIP
    groupLink: 'https://chat.whatsapp.com/BD677joED8ABFOVQXv5kPK',

    // Estados dos usuários
    userStates: new Map(),

    // Delay entre mensagens (MUITO AUMENTADOS para evitar ban)
    delays: {
        typing: 5000,        // 5 segundos
        short: 8000,         // 8 segundos
        medium: 15000,       // 15 segundos
        long: 25000,         // 25 segundos
        veryLong: 35000,     // 35 segundos
        broadcast: {
            min: 120000,     // 2 minutos mínimo
            max: 600000      // 10 minutos máximo
        }
    },

    // Palavras-chave para detectar pagamento
    paymentKeywords: [
        'comprovativo de pagamento',
        'hackerbets',
        'método',
        'm-pesa',
        'aguardando ativação',
        'pacote',
        'mzn',
        'telefone:',
        'email:',
        'nome:',
        'senha:'
    ]
};

module.exports = config;