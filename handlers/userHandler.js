const config = require('../config/settings');
const Helpers = require('../utils/helpers');

class UserHandler {
    constructor(client) {
        this.client = client;
        this.userCooldowns = new Map(); // Controle de cooldown por usuário
        this.processedMessages = new Set(); // Evitar processar mensagem duplicada
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

        // Verificar se mensagem já foi processada (evitar duplicatas)
        const messageId = `${userNumber}_${msg.timestamp}`;
        if (this.processedMessages.has(messageId)) {
            Helpers.log(`Mensagem duplicada ignorada de ${userNumber}`, 'DUPLICATE');
            return;
        }
        this.processedMessages.add(messageId);

        // Limpar cache de mensagens antigas (manter apenas últimas 1000)
        if (this.processedMessages.size > 1000) {
            const oldMessages = Array.from(this.processedMessages).slice(0, 500);
            oldMessages.forEach(id => this.processedMessages.delete(id));
        }

        // Verificar cooldown do usuário (60 segundos entre respostas)
        const now = Date.now();
        const lastResponse = this.userCooldowns.get(userNumber) || 0;
        const cooldownTime = 60000; // 60 segundos

        if (now - lastResponse < cooldownTime) {
            const remainingTime = Math.ceil((cooldownTime - (now - lastResponse)) / 1000);
            Helpers.log(`Usuário ${userNumber} em cooldown por ${remainingTime}s`, 'COOLDOWN');
            return; // Não responder durante cooldown
        }

        // Salvar contato
        try {
            const contact = await msg.getContact();
            Helpers.saveContact({
                number: userNumber,
                name: contact.pushname || contact.name || 'Sem nome'
            });
        } catch (error) {
            Helpers.log(`Erro ao salvar contato ${userNumber}: ${error.message}`, 'ERROR');
        }

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

        Helpers.log(`Mensagem de ${userNumber}: ${msg.body} | Estado: ${userState}`, 'USER');

        // Atualizar cooldown
        this.userCooldowns.set(userNumber, now);

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
        try {
            // Marcar como cliente pago
            config.userStates.set(msg.from, 'paid');
            
            // Responder ao cliente com delay maior
            await Helpers.simulateTyping(chat, config.delays.long);
            await msg.reply(config.messages.waitingActivation);
            
            // Enviar detalhes para suporte humano (dono)
            const contact = await msg.getContact();
            const supportMessage = `🚨 *CLIENTE PAGO PRECISA DE ATENDIMENTO*

📱 *Cliente:* ${msg.from.replace('@c.us', '')}
👤 *Nome:* ${contact.pushname || contact.name || 'Não informado'}
⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}

📄 *Mensagem do cliente:*
${originalBody}

---
*⚠️ ATENDA ESTE CLIENTE COM PRIORIDADE!*`;

            await this.client.sendMessage(config.admin.humanSupport + '@c.us', supportMessage);
            Helpers.log(`Cliente pago ${msg.from} direcionado para suporte humano`, 'SUPPORT');
        } catch (error) {
            Helpers.log(`Erro ao processar cliente pago: ${error.message}`, 'ERROR');
        }
    }

    // Lidar com solicitação de atendimento humano
    async handleHumanSupport(msg, chat) {
        try {
            await Helpers.simulateTyping(chat, config.delays.medium);
            await msg.reply(config.messages.humanSupport);
            
            // Notificar suporte humano (dono)
            const contact = await msg.getContact();
            const supportMessage = `👨‍💼 *SOLICITAÇÃO DE ATENDIMENTO HUMANO*

📱 *Cliente:* ${msg.from.replace('@c.us', '')}
👤 *Nome:* ${contact.pushname || contact.name || 'Não informado'}
⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}
📊 *Estado atual:* ${config.userStates.get(msg.from) || 'Novo cliente'}

💬 *Cliente solicitou atendimento humano.*

---
*Responda diretamente para o cliente.*`;

            await this.client.sendMessage(config.admin.humanSupport + '@c.us', supportMessage);
            Helpers.log(`Atendimento humano solicitado por ${msg.from}`, 'SUPPORT');
        } catch (error) {
            Helpers.log(`Erro ao notificar suporte: ${error.message}`, 'ERROR');
        }
    }

    async sendWelcomeMessage(msg, chat) {
        try {
            // Verificar se já enviou boas-vindas recentemente
            const welcomeKey = `welcome_${msg.from}`;
            const lastWelcome = this.userCooldowns.get(welcomeKey) || 0;
            const welcomeCooldown = 300000; // 5 minutos

            if (Date.now() - lastWelcome < welcomeCooldown) {
                Helpers.log(`Boas-vindas já enviadas recentemente para ${msg.from}`, 'COOLDOWN');
                return;
            }

            // Delay MUITO maior para parecer mais humano
            await Helpers.simulateTyping(chat, config.delays.veryLong);
            await msg.reply(config.messages.welcome);
            
            await Helpers.delay(config.delays.long);
            await Helpers.simulateTyping(chat, config.delays.medium);
            await this.client.sendMessage(msg.from, config.messages.depositRequest);
            
            // Atualizar estado do usuário
            config.userStates.set(msg.from, 'waiting_screenshot');
            
            // Marcar que enviou boas-vindas
            this.userCooldowns.set(welcomeKey, Date.now());
            
            Helpers.log(`Boas-vindas enviadas para ${msg.from}`, 'BOT');
        } catch (error) {
            Helpers.log(`Erro ao enviar boas-vindas: ${error.message}`, 'ERROR');
        }
    }

    async handleDepositResponse(msg, chat) {
        try {
            await Helpers.simulateTyping(chat, config.delays.long);
            await msg.reply(config.messages.depositRequest);
            
            config.userStates.set(msg.from, 'waiting_screenshot');
        } catch (error) {
            Helpers.log(`Erro ao processar resposta de depósito: ${error.message}`, 'ERROR');
        }
    }

    async handleScreenshotResponse(msg, chat) {
        try {
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
        } catch (error) {
            Helpers.log(`Erro ao processar screenshot: ${error.message}`, 'ERROR');
        }
    }

    async handleAdditionalHouses(msg, chat) {
        try {
            // Verificar cooldown para mensagens adicionais
            const additionalKey = `additional_${msg.from}`;
            const lastAdditional = this.userCooldowns.get(additionalKey) || 0;
            const additionalCooldown = 180000; // 3 minutos

            if (Date.now() - lastAdditional < additionalCooldown) {
                Helpers.log(`Mensagem adicional em cooldown para ${msg.from}`, 'COOLDOWN');
                return;
            }

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
            
            // Marcar cooldown
            this.userCooldowns.set(additionalKey, Date.now());
            
            // Ocasionalmente enviar as casas novamente (menos frequente)
            if (Math.random() < 0.1) { // Reduzido para 10%
                await Helpers.delay(config.delays.veryLong);
                await this.client.sendMessage(msg.from, config.messages.additionalHouses);
            }
        } catch (error) {
            Helpers.log(`Erro ao processar casas adicionais: ${error.message}`, 'ERROR');
        }
    }
}

module.exports = UserHandler;