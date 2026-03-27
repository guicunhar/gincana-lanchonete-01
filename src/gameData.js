// ============================================================
// BANCO DE PERGUNTAS — edite aqui para personalizar o jogo
// ============================================================

const QUESTIONS = [
  {
    id: 1,
    title: "Classifique os animais pelo habitat principal",
    timeLimit: 45,
    items: [
      "Tubarão", "Leão", "Pinguim", "Águia", "Polvo",
      "Elefante", "Baleia", "Macaco", "Tartaruga", "Falcão",
      "Cobra", "Golfinho", "Girafa", "Albatroz", "Orca"
    ],
    categories: [
      {
        id: "oceano",
        label: "🌊 Oceano",
        color: "#0ea5e9",
        slots: 4,
        correct: ["Tubarão", "Polvo", "Baleia", "Golfinho", "Orca", "Tartaruga"]
      },
      {
        id: "savana",
        label: "🌾 Savana",
        color: "#f59e0b",
        slots: 4,
        correct: ["Leão", "Elefante", "Girafa", "Cobra"]
      },
      {
        id: "ceu",
        label: "🦅 Céu / Ar",
        color: "#8b5cf6",
        slots: 3,
        correct: ["Águia", "Falcão", "Albatroz", "Pinguim"]
      },
      {
        id: "floresta",
        label: "🌿 Floresta",
        color: "#22c55e",
        slots: 4,
        correct: ["Macaco", "Cobra", "Tartaruga", "Pinguim"]
      }
    ]
  },
  {
    id: 2,
    title: "Classifique os países pelo continente",
    timeLimit: 40,
    items: [
      "Brasil", "Japão", "Egito", "Canadá", "Nigéria",
      "Índia", "Argentina", "França", "Quênia", "China",
      "México", "Austrália", "Etiópia", "Coreia do Sul", "Peru"
    ],
    categories: [
      {
        id: "americas",
        label: "🌎 Américas",
        color: "#ef4444",
        slots: 4,
        correct: ["Brasil", "Canadá", "Argentina", "México", "Peru"]
      },
      {
        id: "asia",
        label: "🌏 Ásia",
        color: "#f97316",
        slots: 4,
        correct: ["Japão", "Índia", "China", "Coreia do Sul"]
      },
      {
        id: "africa",
        label: "🌍 África",
        color: "#eab308",
        slots: 3,
        correct: ["Egito", "Nigéria", "Quênia", "Etiópia"]
      },
      {
        id: "outros",
        label: "🗺️ Europa/Oceania",
        color: "#06b6d4",
        slots: 4,
        correct: ["França", "Austrália"]
      }
    ]
  },
  {
    id: 3,
    title: "Classifique os alimentos pelo grupo nutricional",
    timeLimit: 50,
    items: [
      "Arroz", "Frango", "Banana", "Leite", "Feijão",
      "Pão", "Ovo", "Maçã", "Queijo", "Macarrão",
      "Atum", "Laranja", "Iogurte", "Batata", "Carne bovina"
    ],
    categories: [
      {
        id: "carboidratos",
        label: "🍞 Carboidratos",
        color: "#f59e0b",
        slots: 4,
        correct: ["Arroz", "Pão", "Macarrão", "Batata"]
      },
      {
        id: "proteinas",
        label: "💪 Proteínas",
        color: "#ef4444",
        slots: 4,
        correct: ["Frango", "Feijão", "Ovo", "Atum", "Carne bovina"]
      },
      {
        id: "frutas",
        label: "🍎 Frutas",
        color: "#22c55e",
        slots: 3,
        correct: ["Banana", "Maçã", "Laranja"]
      },
      {
        id: "laticinios",
        label: "🥛 Laticínios",
        color: "#3b82f6",
        slots: 4,
        correct: ["Leite", "Queijo", "Iogurte"]
      }
    ]
  },
  {
    id: 4,
    title: "Classifique os elementos pelo estado físico à temperatura ambiente",
    timeLimit: 35,
    items: [
      "Ferro", "Mercúrio", "Oxigênio", "Ouro", "Água",
      "Nitrogênio", "Cobre", "Bromo", "Hidrogênio", "Prata",
      "Cloro", "Alumínio", "Hélio", "Chumbo", "Flúor"
    ],
    categories: [
      {
        id: "solido",
        label: "🧱 Sólido",
        color: "#78716c",
        slots: 5,
        correct: ["Ferro", "Ouro", "Cobre", "Prata", "Alumínio", "Chumbo"]
      },
      {
        id: "liquido",
        label: "💧 Líquido",
        color: "#0ea5e9",
        slots: 3,
        correct: ["Mercúrio", "Água", "Bromo"]
      },
      {
        id: "gasoso",
        label: "💨 Gasoso",
        color: "#a3e635",
        slots: 7,
        correct: ["Oxigênio", "Nitrogênio", "Hidrogênio", "Cloro", "Hélio", "Flúor"]
      }
    ]
  },
  {
    id: 5,
    title: "Classifique os esportes pela modalidade",
    timeLimit: 45,
    items: [
      "Natação", "Futebol", "Tênis", "Basquete", "Surfe",
      "Vôlei", "Polo Aquático", "Handebol", "Canoagem", "Badminton",
      "Rúgbi", "Mergulho", "Futsal", "Squash", "Triatlo"
    ],
    categories: [
      {
        id: "aquatico",
        label: "🏊 Aquático",
        color: "#0284c7",
        slots: 4,
        correct: ["Natação", "Surfe", "Polo Aquático", "Canoagem", "Mergulho", "Triatlo"]
      },
      {
        id: "campo",
        label: "⚽ Campo / Quadra Grande",
        color: "#16a34a",
        slots: 4,
        correct: ["Futebol", "Basquete", "Vôlei", "Handebol", "Rúgbi"]
      },
      {
        id: "raquete",
        label: "🎾 Raquete",
        color: "#dc2626",
        slots: 3,
        correct: ["Tênis", "Badminton", "Squash"]
      },
      {
        id: "sala",
        label: "🏟️ Sala / Fechado",
        color: "#7c3aed",
        slots: 4,
        correct: ["Futsal", "Basquete", "Badminton", "Squash", "Handebol"]
      }
    ]
  }
];

// ============================================================
// CONFIGURAÇÕES DO JOGO
// ============================================================
const GAME_CONFIG = {
  pointsPerCorrectSlot: 100,     // pontos por slot correto
  bonusForPerfect: 200,          // bônus por pergunta 100% correta
  scoreBoardDuration: 8000,      // ms mostrando placar entre rodadas
  minPlayers: 1,                 // mínimo para iniciar (1 para testes)
};

module.exports = { QUESTIONS, GAME_CONFIG };
