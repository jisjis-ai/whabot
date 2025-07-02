const fs = require('fs');
const path = require('path');

class StateManager {
    constructor() {
        this.stateFile = path.join(__dirname, '../data/user_states.json');
        this.states = new Map();
        this.loadStates();
        
        // Salvar estados a cada 30 segundos
        setInterval(() => {
            this.saveStates();
        }, 30000);
    }

    // Carregar estados do arquivo
    loadStates() {
        try {
            if (fs.existsSync(this.stateFile)) {
                const data = fs.readFileSync(this.stateFile, 'utf8');
                const statesArray = JSON.parse(data);
                
                statesArray.forEach(([key, value]) => {
                    this.states.set(key, value);
                });
                
                console.log(`✅ ${this.states.size} estados de usuários carregados`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estados:', error);
            this.states = new Map();
        }
    }

    // Salvar estados no arquivo
    saveStates() {
        try {
            const dir = path.dirname(this.stateFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const statesArray = Array.from(this.states.entries());
            fs.writeFileSync(this.stateFile, JSON.stringify(statesArray, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar estados:', error);
        }
    }

    // Obter estado do usuário
    getUserState(userNumber) {
        return this.states.get(userNumber) || 'initial';
    }

    // Definir estado do usuário
    setUserState(userNumber, state) {
        this.states.set(userNumber, {
            state: state,
            timestamp: new Date().toISOString(),
            lastUpdate: Date.now()
        });
        
        // Salvar imediatamente em mudanças importantes
        if (state === 'completed') {
            this.saveStates();
        }
    }

    // Obter todos os estados
    getAllStates() {
        return this.states;
    }

    // Limpar estados antigos (mais de 30 dias)
    cleanOldStates() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        let cleaned = 0;

        for (const [userNumber, stateData] of this.states.entries()) {
            if (stateData.lastUpdate && stateData.lastUpdate < thirtyDaysAgo) {
                this.states.delete(userNumber);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 ${cleaned} estados antigos removidos`);
            this.saveStates();
        }
    }

    // Estatísticas
    getStats() {
        const stats = {
            total: this.states.size,
            byState: {}
        };

        for (const [userNumber, stateData] of this.states.entries()) {
            const state = stateData.state || stateData; // Compatibilidade
            stats.byState[state] = (stats.byState[state] || 0) + 1;
        }

        return stats;
    }
}

module.exports = StateManager;