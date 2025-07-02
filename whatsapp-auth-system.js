const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');

class WhatsAppAuthSystem {
    constructor(clientId = 'default') {
        this.clientId = clientId;
        this.sessionPath = path.join(__dirname, 'sessions', clientId);
        this.client = null;
        this.isReady = false;
        this.qrCode = null;
        this.authCallbacks = {
            onQR: null,
            onReady: null,
            onDisconnected: null,
            onAuthFailure: null
        };
        
        this.initializeClient();
    }

    // Inicializar cliente com estratégia de autenticação local
    initializeClient() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: this.clientId,
                dataPath: './sessions'
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            }
        });

        this.setupEventListeners();
    }

    // Configurar eventos
    setupEventListeners() {
        // QR Code - só aparece se não tem sessão salva
        this.client.on('qr', (qr) => {
            console.log('🔄 QR Code gerado - Primeira conexão ou sessão expirada');
            this.qrCode = qr;
            this.isReady = false;
            
            if (this.authCallbacks.onQR) {
                this.authCallbacks.onQR(qr);
            }
        });

        // Cliente pronto - com ou sem QR Code
        this.client.on('ready', () => {
            console.log('✅ Cliente conectado e pronto!');
            this.isReady = true;
            this.qrCode = null;
            
            if (this.authCallbacks.onReady) {
                this.authCallbacks.onReady(this.client.info);
            }
        });

        // Desconectado
        this.client.on('disconnected', (reason) => {
            console.log('❌ Cliente desconectado:', reason);
            this.isReady = false;
            this.qrCode = null;
            
            if (this.authCallbacks.onDisconnected) {
                this.authCallbacks.onDisconnected(reason);
            }
        });

        // Falha na autenticação
        this.client.on('auth_failure', (msg) => {
            console.log('🚫 Falha na autenticação:', msg);
            this.isReady = false;
            this.qrCode = null;
            
            // Limpar sessão corrompida
            this.clearSession();
            
            if (this.authCallbacks.onAuthFailure) {
                this.authCallbacks.onAuthFailure(msg);
            }
        });

        // Loading screen (progresso do carregamento)
        this.client.on('loading_screen', (percent, message) => {
            console.log(`📱 Carregando WhatsApp: ${percent}% - ${message}`);
        });

        // Sessão autenticada (importante!)
        this.client.on('authenticated', (session) => {
            console.log('🔐 Sessão autenticada e salva!');
            // A sessão é automaticamente salva pelo LocalAuth
        });
    }

    // Verificar se já tem sessão salva
    hasValidSession() {
        const sessionPath = path.join(__dirname, 'sessions', this.clientId);
        return fs.existsSync(sessionPath) && fs.readdirSync(sessionPath).length > 0;
    }

    // Inicializar conexão
    async initialize() {
        console.log('🚀 Inicializando WhatsApp...');
        
        if (this.hasValidSession()) {
            console.log('📱 Sessão existente encontrada - conectando sem QR Code...');
        } else {
            console.log('🆕 Primeira conexão - QR Code será gerado...');
        }

        try {
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
            
            // Se erro, tentar limpar sessão e reiniciar
            this.clearSession();
            setTimeout(() => {
                this.initialize();
            }, 5000);
        }
    }

    // Limpar sessão (força novo QR Code)
    clearSession() {
        try {
            const sessionPath = path.join(__dirname, 'sessions', this.clientId);
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                console.log('🧹 Sessão limpa - próxima conexão gerará QR Code');
            }
        } catch (error) {
            console.error('❌ Erro ao limpar sessão:', error);
        }
    }

    // Desconectar e limpar
    async logout() {
        if (this.client) {
            await this.client.logout();
            this.clearSession();
        }
    }

    // Definir callbacks
    setCallbacks(callbacks) {
        this.authCallbacks = { ...this.authCallbacks, ...callbacks };
    }

    // Status da conexão
    getStatus() {
        return {
            isReady: this.isReady,
            hasQR: !!this.qrCode,
            qrCode: this.qrCode,
            hasSession: this.hasValidSession(),
            clientInfo: this.isReady ? this.client.info : null
        };
    }
}

module.exports = WhatsAppAuthSystem;