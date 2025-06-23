# 🤖 Bot WhatsApp Avançado - Casa de Apostas (Railway)

Bot completo para WhatsApp hospedado na Railway com sistema administrativo avançado, auto-resposta em grupos, captura de contatos e entrada automática em grupos.

## 🚀 Deploy na Railway

### Passo a Passo:

1. **Criar conta na Railway**: https://railway.app
2. **Conectar GitHub**: Faça fork deste repositório
3. **Deploy automático**: Railway detectará automaticamente o projeto Node.js
4. **Acessar URL**: Railway gerará uma URL como `https://seu-projeto.railway.app`
5. **Escanear QR Code**: Acesse a URL e escaneie o QR Code

### 📱 Como Conectar:

1. Após o deploy, acesse a **URL do seu projeto** (aparece no painel Railway)
2. Aguarde a página carregar com o QR Code
3. Abra o WhatsApp no celular
4. Vá em "Dispositivos conectados" > "Conectar dispositivo"
5. Escaneie o QR Code que aparece na página web
6. ✅ Bot conectado e funcionando!

## 🌐 Interface Web

- **QR Code limpo**: Página bonita com QR Code escaneável
- **Timer visual**: Mostra tempo restante (20 segundos)
- **Status em tempo real**: Conectando/Conectado/Erro
- **Auto-refresh**: Página atualiza automaticamente
- **Responsivo**: Funciona em celular e desktop
- **Instruções claras**: Como conectar o WhatsApp

## 🔧 Configurações Railway

- **Node.js**: Versão 18+
- **Servidor Web**: Express.js na porta 3000
- **Memória**: 512MB (suficiente)
- **Restart Policy**: Automático em caso de falha
- **URL pública**: Gerada automaticamente pela Railway

## 🎯 Links Configurados

- **Casa Principal**: https://receber.netlify.app/register
- **Casa 2**: https://olagiro.netlify.app/
- **Casa 3**: https://megagiro.netlify.app/
- **Casa 4**: https://sshortly.net/e8c338e
- **Grupo VIP**: https://chat.whatsapp.com/BD677joED8ABFOVQXv5kPK

## 👨‍💼 Acesso Administrativo

### Login:
1. Envie `/admin` para o bot
2. Digite as credenciais:
```
Email: freefiremaxdojis@gmail.com
Senha: 006007
```

### Comandos Disponíveis:

#### 📊 Informações
- `/stats` - Estatísticas do bot
- `/contacts` - Baixar lista de contatos
- `/config` - Ver configurações atuais
- `/statsgrupos` - Estatísticas de grupos

#### 📝 Configurações
- `/setmessage [tipo] [mensagem]` - Alterar mensagens
- `/setlink [casa] [link]` - Alterar links das casas

#### 📢 Envios em Massa
- `/broadcast [mensagem]` - Enviar mensagem para todos
- `/sendaudio` - Enviar áudio (responda um áudio)
- `/sendmedia` - Enviar mídia (responda uma mídia)

#### 👥 **NOVOS COMANDOS DE GRUPOS:**

##### 🤖 Auto-Resposta em Grupos
- `/autoresponder on` - Ativar auto-resposta em grupos
- `/autoresponder off` - Desativar auto-resposta em grupos

**Como funciona:**
- Bot responde automaticamente em grupos com links de cadastro
- Delay de 30 segundos a 2 minutos entre respostas
- Cooldown de 5 minutos por grupo (evita spam)
- Mensagens variadas com emojis diferentes
- Sistema anti-ban com delays inteligentes

##### 📋 Captura de Contatos
- `/capturarcontatos` - Capturar contatos de TODOS os grupos

**Melhorias:**
- Captura de todos os grupos (mesmo removido)
- Delay de 5 segundos entre grupos
- Arquivo TXT apenas com números (sem +)
- Sistema robusto contra erros
- Progresso em tempo real

##### 📢 Mensagem para Grupos
- `/mensagemgrupos [mensagem]` - Enviar mensagem para todos os grupos

**Funcionalidades:**
- Marca TODOS os participantes (sem mostrar números)
- Delay de 10-30 segundos entre grupos
- Relatório completo de envios
- Sistema anti-ban

##### 🎯 Entrada Automática em Grupos
- `/entrargrupos [número]` - Entrar em grupos aleatórios

**Como funciona:**
- Gera links aleatórios de grupos WhatsApp
- Tenta entrar até conseguir o número desejado
- Delay de 30-60 segundos entre entradas
- Máximo 10 tentativas por grupo desejado
- Para automaticamente ao atingir a meta

**Exemplo:** `/entrargrupos 50` - Tenta entrar em 50 grupos

## 🛡️ Recursos Anti-Ban Avançados

### ✅ **Para Mensagens Privadas:**
- Delays aleatórios entre envios (3-8 segundos)
- Variações automáticas de mensagens
- Simulação de comportamento humano
- Limitação de envios por minuto

### ✅ **Para Grupos:**
- Cooldown de 5 minutos por grupo
- Delay aleatório de 30s-2min para auto-resposta
- Delay de 10-30s para broadcast
- Delay de 30-60s para entrada em grupos
- Mensagens variadas com emojis diferentes
- Sistema inteligente de detecção de spam

### ✅ **Geral:**
- QR Code único (evita spam de códigos)
- Interface web profissional
- Reconexão automática
- Logs detalhados

## 🔄 Fluxo do Cliente (Melhorado)

1. **Cliente chega** → Recebe boas-vindas + link da casa principal
2. **Qualquer resposta** → Bot vai direto para aguardar screenshot
3. **Texto enviado** → Bot pede a foto do comprovante
4. **Foto enviada** → Libera acesso ao grupo VIP + incentiva outras casas
5. **Mensagens seguintes** → Continua incentivando cadastros (30% de chance)

## 📊 Monitoramento Avançado

- **Interface web**: Status em tempo real na URL
- **Logs Railway**: Logs completos no painel
- **Estatísticas**: Via comando `/stats` e `/statsgrupos`
- **Relatórios**: De envios em massa e grupos
- **Backup automático**: De contatos por data

## 🌐 Como Encontrar sua URL

### Método 1 - Painel Railway:
1. Acesse https://railway.app
2. Entre no seu projeto
3. Aba "Settings" → "Domains"
4. URL aparece: `https://seu-projeto.railway.app`

### Método 2 - Deploy Tab:
1. Aba "Deployments" → Último deploy
2. URL aparece no topo do deployment

### Método 3 - Logs:
Procure nos logs por:
```
🔗 URL: https://seu-projeto.railway.app
```

## 🚨 Importante para Railway

- ✅ **Servidor web**: Express.js para interface
- ✅ **QR Code web**: Página bonita e funcional
- ✅ **Auto-refresh**: Atualização automática
- ✅ **Reconexão automática**: Em caso de desconexão
- ✅ **Logs limpos**: Fácil visualização
- ✅ **Error handling**: Tratamento completo de erros
- ✅ **Status API**: Endpoint `/api/status` para monitoramento
- ✅ **Sistema de grupos**: Completo e robusto

## 🔧 Troubleshooting

### QR Code não aparece:
1. Acesse a URL do projeto na Railway
2. Aguarde até 30 segundos para carregar
3. Se necessário, atualize a página (F5)

### Bot desconecta:
1. Railway reconecta automaticamente
2. Novo QR Code será gerado na URL
3. Monitore os logs para acompanhar

### Auto-resposta não funciona:
1. Verifique se está ativada: `/autoresponder on`
2. Aguarde o delay (30s-2min)
3. Verifique se não está em cooldown (5min)

### Captura de contatos falha:
1. Sistema robusto com retry automático
2. Captura 1 grupo a cada 5 segundos
3. Continua mesmo com erros individuais

---

**🚀 Agora com sistema completo de grupos e auto-resposta!**
**🌐 Acesse sua URL da Railway e conecte facilmente!**
**👥 Sistema anti-ban avançado para grupos!**