# 🎮 QuizMaster — Quiz Multiplayer em Tempo Real

Quiz multiplayer inspirado no Kahoot, com mecânica de **classificação por categorias**.

---

## 🚀 Como Rodar

### Pré-requisitos
- **Node.js** v16+ instalado ([download](https://nodejs.org))

### Passo a passo

```bash
# 1. Entre na pasta do projeto
cd quizmaster

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start

# 4. Abra no navegador
# → http://localhost:3000
```

Para **desenvolvimento** (auto-restart ao editar):
```bash
npm run dev
```

---

## 🎯 Como Jogar

### Criar uma sala (Host)
1. Acesse `http://localhost:3000`
2. Clique em **"Criar Sala"**
3. Digite seu nome e clique em **"Criar Sala"**
4. Compartilhe o **código de 6 letras** com os jogadores
5. Aguarde todos entrarem e clique **"Iniciar Jogo"**

### Entrar na sala (Jogadores)
1. No celular ou computador, acesse `http://SEU-IP:3000`
   - Para achar o IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
   - Exemplo: `http://192.168.1.100:3000`
2. Clique em **"Entrar"**
3. Digite o **código** e seu **apelido**

### Mecânica das perguntas
- Cada pergunta tem uma lista de 15 itens
- Você precisa arrastar/classificar cada item para a categoria correta
- **Clique num item** → ele fica selecionado
- **Clique na categoria** → o item é classificado lá
- Clique no item do pool novamente para remover da categoria
- Clique **"Enviar Resposta"** quando estiver pronto
- Você pode enviar com respostas parciais!

### Pontuação
- **100 pontos** por item classificado corretamente
- **+200 bônus** se classificar tudo certo na pergunta (perfeito!)
- Placar exibido após cada pergunta

---

## 📁 Estrutura do Projeto

```
quizmaster/
├── src/
│   ├── server.js       ← Servidor Express + Socket.IO
│   ├── gameLogic.js    ← Gerenciamento de salas e pontuação
│   └── gameData.js     ← Perguntas e configurações
├── public/
│   ├── index.html      ← Interface única (SPA)
│   ├── css/style.css   ← Design visual
│   └── js/app.js       ← Lógica do cliente
├── package.json
└── README.md
```

---

## ✏️ Customizar Perguntas

Edite o arquivo `src/gameData.js`. Cada pergunta segue esse formato:

```js
{
  id: 6,                              // ID único
  title: "Classifique os planetas",   // Enunciado
  timeLimit: 45,                      // Segundos para responder
  items: [                            // Lista de 10-20 itens embaralhados
    "Marte", "Saturno", "Terra", ...
  ],
  categories: [
    {
      id: "rochosos",
      label: "🪨 Rochosos",
      color: "#f59e0b",               // Cor hexadecimal
      slots: 4,                       // Quantos itens cabem aqui
      correct: ["Marte", "Terra", "Vênus", "Mercúrio"]  // Respostas corretas
    },
    {
      id: "gasosos",
      label: "💨 Gasosos",
      color: "#0ea5e9",
      slots: 4,
      correct: ["Júpiter", "Saturno", "Urano", "Netuno"]
    }
  ]
}
```

**Dica**: Um item pode ser resposta correta em múltiplas categorias (casos ambíguos), mas cada jogador pode colocá-lo em apenas uma categoria.

---

## ⚙️ Configurações

Em `src/gameData.js`, no objeto `GAME_CONFIG`:

```js
const GAME_CONFIG = {
  pointsPerCorrectSlot: 100,   // pontos por acerto
  bonusForPerfect: 200,        // bônus por pergunta perfeita
  scoreBoardDuration: 8000,    // ms do placar (não usado, host controla manualmente)
  minPlayers: 1,               // mínimo para iniciar (1 = bom para testes)
};
```

---

## 🌐 Hospedar Online (Opcional)

Para jogar com pessoas em redes diferentes:

### Opção 1 — Railway (grátis, fácil)
1. Crie conta em [railway.app](https://railway.app)
2. Conecte o repositório GitHub
3. Deploy automático!

### Opção 2 — ngrok (teste rápido)
```bash
npm install -g ngrok
npm start &
ngrok http 3000
# Compartilhe a URL pública gerada
```

---

## 🛠️ Arquitetura

```
Navegador (HTML/CSS/JS)
    ↕ WebSocket (Socket.IO)
Node.js + Express
    ├── Salas em memória (Map)
    ├── Lógica de jogo (gameLogic.js)
    └── Perguntas (gameData.js)
```

**Decisões de design:**
- **Sem banco de dados**: tudo em memória, zero configuração
- **Socket.IO**: handles reconnect, fallback, rooms nativamente
- **Frontend vanilla**: carrega instantâneo no celular, sem build step
- **Pontuação server-side**: clientes não podem trapacear

---

## 🎮 Perguntas de Exemplo Incluídas

1. 🐾 Animais por habitat (Oceano, Savana, Céu, Floresta)
2. 🌍 Países por continente (Américas, Ásia, África, Europa/Oceania)
3. 🍎 Alimentos por grupo nutricional
4. ⚗️ Elementos por estado físico (Sólido, Líquido, Gasoso)
5. ⚽ Esportes por modalidade (Aquático, Campo, Raquete, Sala)
