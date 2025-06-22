const config = require('../config/settings');
const Helpers = require('../utils/helpers');

class UserHandler {
    constructor(client) {
        this.client = client;
    }

    async handleUserMessage(msg) {
        const userNumber = msg.from;
        const messageBody = msg.body.toLowerCase().trim();
        const originalBody = msg.body.trim();
        const chat = await msg.getChat();

        // IGNORAR MENSAGENS DO DONO - não responder como usuário comum
        if (userNumber === config.admin.owner + '@c.us') {
            return; // Dono não é tratado como usuário comum
        }

        // Salvar contato
        const contact = await msg.getContact();
        Helpers.saveContact({
            number: userNumber,
            name: contact.pushname || contact.name
        });

        // Verificar se é cliente que já pagou
        if (this.isPaidClient(originalBody)) {
            await this.handlePaidClient(msg, chat, originalBody);
            return;
        }

        // Verificar se quer falar com humano
        if (messageBody.includes('falar com humano') || messageBody.includes('atendimento') || messageBody.includes('humano')) {
            await this.handleHumanSupport(msg, chat);
            return;
        }

        // Verificar estado atual do usuário
        const userState = config.userStates.get(userNumber) || 'initial';

        Helpers.log(`Mensagem de ${userNumber}: ${msg.body}`, 'USER');

        switch (userState) {
            case 'initial':
                await this.sendWelcomeMessage(msg, chat);
                break;
            
            case 'waiting_deposit':
                await this.handleDepositResponse(msg, chat);
                break;
            
            case 'waiting_screenshot':
                await this.handleScreenshotResponse(msg, chat);
                break;
            
            case 'completed':
                await this.handleAdditionalHouses(msg, chat);
                break;
            
            default:
                await this.sendWelcomeMessage(msg, chat);
        }
    }

    // Verificar se é cliente que já pagou
    isPaidClient(messageBody) {
        const lowerBody = messageBody.toLowerCase();
        return config.paymentKeywords.some(keyword => 
            lowerBody.includes(keyword.toLowerCase())
        );
    }

    // Lidar com cliente que já pagou
    async handlePaidClient(msg, chat, originalBody) {
        // Marcar como cliente pago
        config.userStates.set(msg.from, 'paid');
        
        // Responder ao cliente com delay maior
        await Helpers.simulateTyping(chat, config.delays.long);
        await msg.reply(config.messages.waitingActivation);
        
        // Enviar detalhes para suporte humano (dono)
        const supportMessage = `🚨 *CLIENTE PAGO PRECISA DE ATENDIMENTO*

📱 *Cliente:* ${msg.from}
👤 *Nome:* ${(await msg.getContact()).pushname || 'Não informado'}
⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}

📄 *Mensagem do cliente:*
${originalBody}

---
*⚠️ ATENDA ESTE CLIENTE COM PRIORIDADE!*`;

        try {
            await this.client.sendMessage(config.admin.humanSupport + '@c.us', supportMessage);
            Helpers.log(`Cliente pago ${msg.from} direcionado para suporte humano`, 'SUPPORT');
        } catch (error) {
            Helpers.log(`Erro ao enviar para suporte: ${error.message}`, 'ERROR');
        }
    }

    // Lidar com solicitação de atendimento humano
    async handleHumanSupport(msg, chat) {
        await Helpers.simulateTyping(chat, config.delays.medium);
        await msg.reply(config.messages.humanSupport);
        
        // Notificar suporte humano (dono)
        const supportMessage = `👨‍💼 *SOLICITAÇÃO DE ATENDIMENTO HUMANO*

📱 *Cliente:* ${msg.from}
👤 *Nome:* ${(await msg.getContact()).pushname || 'Não informado'}
⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}
📊 *Estado atual:* ${config.userStates.get(msg.from) || 'Novo cliente'}

💬 *Cliente solicitou atendimento humano.*

---
*Responda diretamente para o cliente.*`;

        try {
            await this.client.sendMessage(config.admin.humanSupport + '@c.us', supportMessage);
            Helpers.log(`Atendimento humano solicitado por ${msg.from}`, 'SUPPORT');
        } catch (error) {
            Helpers.log(`Erro ao notificar suporte: ${error.message}`, 'ERROR');
        }
    }

    async sendWelcomeMessage(msg, chat) {
        // Delay MUITO maior para parecer mais humano
        await Helpers.simulateTyping(chat, config.delays.veryLong);
        await msg.reply(config.messages.welcome);
        
        await Helpers.delay(config.delays.long);
        await Helpers.simulateTyping(chat, config.delays.medium);
        await this.client.sendMessage(msg.from, config.messages.depositRequest);
        
        // Atualizar estado do usuário
        config.userStates.set(msg.from, 'waiting_screenshot');
        
        Helpers.log(`Boas-vindas enviadas para ${msg.from}`, 'BOT');
    }

    async handleDepositResponse(msg, chat) {
        await Helpers.simulateTyping(chat, config.delays.long);
        await msg.reply(config.messages.depositRequest);
        
        config.userStates.set(msg.from, 'waiting_screenshot');
    }

    async handleScreenshotResponse(msg, chat) {
        // Verificar se é uma imagem
        if (msg.hasMedia && msg.type === 'image') {
            // Delay MUITO maior para processar "screenshot"
            await Helpers.simulateTyping(chat, config.delays.veryLong);
            await msg.reply(config.messages.groupAccess);
            
            await Helpers.delay(config.delays.veryLong);
            await Helpers.simulateTyping(chat, config.delays.long);
            await this.client.sendMessage(msg.from, config.messages.additionalHouses);
            
            // Atualizar estado
            config.userStates.set(msg.from, 'completed');
            
            Helpers.log(`Screenshot recebido de ${msg.from} - Acesso liberado`, 'BOT');
        } else {
            // Não é imagem, pedir novamente
            await Helpers.simulateTyping(chat, config.delays.medium);
            await msg.reply(config.messages.needPhoto);
            
            Helpers.log(`${msg.from} enviou texto ao invés de foto`, 'BOT');
        }
    }

    async handleAdditionalHouses(msg, chat) {
        // Mensagens mais curtas e diretas
        const encourageMessages = [
            '🔥 Cadastrou nas outras casas? Mais lucro! 💰',
            '⚡ Não perca! Mais casas = Mais ganhos! 🚀',
            '💎 Grandes apostadores usam várias casas! 🏆',
            '🎯 Quer mais dicas? Cadastre em todas! 💡',
            '💸 Multiplique os ganhos! Cadastre-se em todas! 🎰',
            '🚀 VIP usa 4 casas! Você também pode! 💪'
        ];
        
        const randomMessage = encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
        
        // Delay MUITO maior entre respostas
        await Helpers.simulateTyping(chat, config.delays.veryLong);
        await msg.reply(Helpers.generateMessageVariation(randomMessage));
        
        // Ocasionalmente enviar as casas novamente (menos frequente)
        if (Math.random() < 0.15) { // Reduzido de 0.2 para 0.15
            await Helpers.delay(config.delays.veryLong);
            await this.client.sendMessage(msg.from, config.messages.additionalHouses);
        }
    }
}

module.exports = UserHandler;