// Configurações do Bot
const config = {
    // Dados do Admin
    admin: {
        email: 'freefiremaxdojis@gmail.com',
        password: '006007',
        numbers: [] // Números autorizados como admin serão adicionados aqui
    },
    
    // Mensagens do Bot
    messages: {
        welcome: `🎰 *Olá! Seja muito bem-vindo!* 🎰

Você chegou no lugar certo para *GANHAR DINHEIRO* com apostas! 💰

🔥 *PRIMEIRA CASA - CADASTRE-SE AGORA:*
👉 https://receber.netlify.app/register

📋 *INSTRUÇÕES:*
1️⃣ Clique no link acima
2️⃣ Faça seu cadastro completo
3️⃣ Deposite qualquer valor (mínimo R$ 20)
4️⃣ Envie o print do depósito aqui

⚡ *Após o depósito, você receberá:*
• Acesso ao grupo VIP 🔐
• Sinais certeiros diários 📊
• Suporte 24h 🕐

*Vamos começar a lucrar juntos!* 🚀`,

        depositRequest: `💸 *PERFEITO!* 

Agora preciso que você me envie o *PRINT/SCREENSHOT* do seu depósito para que eu possa verificar e liberar seu acesso ao grupo VIP! 📸

⚠️ *IMPORTANTE:* Envie apenas a FOTO do comprovante, não texto!

Estou aguardando... ⏰`,

        needPhoto: `❌ *Por favor, envie a FOTO do comprovante!*

Preciso ver o print/screenshot do seu depósito para liberar seu acesso ao grupo VIP! 📸

Não envie texto, apenas a imagem! 🖼️`,

        groupAccess: `✅ *DEPÓSITO CONFIRMADO!* 

🎉 Parabéns! Seu acesso foi liberado!

🔗 *CLIQUE NO LINK ABAIXO PARA ENTRAR NO GRUPO VIP:*
👉 https://chat.whatsapp.com/BD677joED8ABFOVQXv5kPK

⚠️ *ATENÇÃO:* Este grupo é EXCLUSIVO para quem depositou! Se não depositou, não será aprovado!

🏆 *Agora você faz parte da elite dos apostadores!*`,

        additionalHouses: `🔥 *QUER MULTIPLICAR SEUS GANHOS?*

Cadastre-se também nessas outras casas TOP e aumente suas chances de lucro! 💰

🎯 *CASA 2 - OLAGIRO:*
👉 https://olagiro.netlify.app/

🎯 *CASA 3 - MEGAGIRO:*
👉 https://megagiro.netlify.app/

🎯 *CASA 4 - PREMIUM:*
👉 https://sshortly.net/e8c338e

💡 *DICA DE OURO:* Quanto mais casas você tiver, mais oportunidades de ganhar! 

Faça seus depósitos e me envie os prints! 📸`
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

    // Delay entre mensagens (em ms)
    delays: {
        typing: 2000,
        short: 1000,
        medium: 3000,
        long: 5000
    }
};

module.exports = config;