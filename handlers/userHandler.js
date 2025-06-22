const config = require('../config/settings');
const Helpers = require('../utils/helpers');

class UserHandler {
    constructor(client) {
        this.client = client;
    }

    async handleUserMessage(msg) {
        const userNumber = msg.from;
        const messageBody = msg.body.toLowerCase().trim();
        const chat = await msg.getChat();

        // Salvar contato
        const contact = await msg.getContact();
        Helpers.saveContact({
            number: userNumber,
            name: contact.pushname || contact.name
        });

        // Verificar estado atual do usuário
        const userState = config.userStates.get(userNumber) || 'initial';

        Helpers.log(`Mensagem recebida de ${userNumber}: ${msg.body}`, 'USER');

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

    async sendWelcomeMessage(msg, chat) {
        await Helpers.simulateTyping(chat, config.delays.medium);
        await msg.reply(config.messages.welcome);
        
        await Helpers.delay(config.delays.short);
        await Helpers.simulateTyping(chat, config.delays.short);
        await this.client.sendMessage(msg.from, config.messages.depositRequest);
        
        // Atualizar estado do usuário
        config.userStates.set(msg.from, 'waiting_screenshot');
        
        Helpers.log(`Mensagem de boas-vindas enviada para ${msg.from}`, 'BOT');
    }

    async handleDepositResponse(msg, chat) {
        await Helpers.simulateTyping(chat, config.delays.short);
        await msg.reply(config.messages.depositRequest);
        
        config.userStates.set(msg.from, 'waiting_screenshot');
    }

    async handleScreenshotResponse(msg, chat) {
        // Verificar se é uma imagem
        if (msg.hasMedia && msg.type === 'image') {
            await Helpers.simulateTyping(chat, config.delays.medium);
            await msg.reply(config.messages.groupAccess);
            
            await Helpers.delay(config.delays.short);
            await Helpers.simulateTyping(chat, config.delays.short);
            await this.client.sendMessage(msg.from, config.messages.additionalHouses);
            
            // Atualizar estado
            config.userStates.set(msg.from, 'completed');
            
            Helpers.log(`Screenshot recebido de ${msg.from} - Acesso liberado`, 'BOT');
        } else {
            // Não é imagem, pedir novamente
            await Helpers.simulateTyping(chat, config.delays.short);
            await msg.reply(config.messages.needPhoto);
            
            Helpers.log(`Usuário ${msg.from} enviou texto ao invés de foto`, 'BOT');
        }
    }

    async handleAdditionalHouses(msg, chat) {
        // Continuar incentivando cadastros em outras casas
        const encourageMessages = [
            '🔥 Já se cadastrou nas outras casas? Mais casas = Mais lucro! 💰',
            '⚡ Não perca tempo! Cadastre-se nas outras casas e multiplique seus ganhos! 🚀',
            '💎 Lembre-se: Os maiores apostadores usam várias casas! Seja um deles! 🏆',
            '🎯 Quer dicas exclusivas? Cadastre-se em todas as casas que indiquei! 💡'
        ];
        
        const randomMessage = encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
        
        await Helpers.simulateTyping(chat, config.delays.short);
        await msg.reply(Helpers.generateMessageVariation(randomMessage));
        
        // Ocasionalmente enviar as casas novamente
        if (Math.random() < 0.3) {
            await Helpers.delay(config.delays.medium);
            await this.client.sendMessage(msg.from, config.messages.additionalHouses);
        }
    }
}

module.exports = UserHandler;