const config = require('../config/settings');
const Helpers = require('../utils/helpers');
const StateManager = require('../utils/stateManager');

class UserHandler {
    constructor(client) {
        this.client = client;
        this.stateManager = new StateManager();
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

        // Verificar estado atual do usuário (agora persistente)
        const userStateData = this.stateManager.getUserState(userNumber);
        const userState = userStateData.state || userStateData || 'initial';

        Helpers.log(`Mensagem recebida de ${userNumber}: ${msg.body} (Estado: ${userState})`, 'USER');

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
        
        // Atualizar estado do usuário para aguardar screenshot (agora persistente)
        this.stateManager.setUserState(msg.from, 'waiting_screenshot');
        
        Helpers.log(`Mensagem de boas-vindas enviada para ${msg.from}`, 'BOT');
    }

    async handleDepositResponse(msg, chat) {
        // Redirecionar para aguardar screenshot
        await this.handleScreenshotResponse(msg, chat);
    }

    async handleScreenshotResponse(msg, chat) {
        // Verificar se é uma imagem
        if (msg.hasMedia && msg.type === 'image') {
            await Helpers.simulateTyping(chat, config.delays.medium);
            await msg.reply(config.messages.groupAccess);
            
            await Helpers.delay(config.delays.short);
            await Helpers.simulateTyping(chat, config.delays.short);
            await this.client.sendMessage(msg.from, config.messages.additionalHouses);
            
            // Atualizar estado (agora persistente)
            this.stateManager.setUserState(msg.from, 'completed');
            
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

    // Método para obter estatísticas
    getStats() {
        return this.stateManager.getStats();
    }

    // Limpar estados antigos
    cleanOldStates() {
        this.stateManager.cleanOldStates();
    }
}

module.exports = UserHandler;