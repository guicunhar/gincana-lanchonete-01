// ============================================================
// BANCO DE PERGUNTAS — edite aqui para personalizar o jogo
// ============================================================

const PESSOAS = [
  "Angela",
  "Branco",
  "Bruno",
  "Coach",
  "Goes",
  "Guilherme",
  "Helder",
  "Isabela",
  "Leandro",
  "Marcella",
  "Murilo",
  "Nicolas",
  "Pedro",
  "Rebeca",
  "Vic",
];

const QUESTIONS = [
  {
    id: 1,
    title: "Que time você torce?",
    timeLimit: 120,
    items: PESSOAS,
    categories: [
      {
        id: "corinthians",
        label: "Corinthians / Sport Club Corinthians Paulista / TIMÃO",
        color: "#000000",
        slots: 4,
        correct: ["Coach", "Murilo", "Bruno", "Vic"],
      },
      {
        id: "palmeiras",
        label: "Palmeiras / PALMEIRAS!!!!!! / Parmera",
        color: "#16a34a",
        slots: 3,
        correct: ["Nicolas", "Isabela", "Leandro"],
      },
      {
        id: "santos",
        label: "Santos",
        color: "#3b82f6",
        slots: 1,
        correct: ["Angela"],
      },
      {
        id: "internacional",
        label: "internacional de porto alegre",
        color: "#ef4444",
        slots: 1,
        correct: ["Rebeca"],
      },
      {
        id: "fluminense",
        label: "Fluminense Football Club",
        color: "#22c55e",
        slots: 1,
        correct: ["Guilherme"],
      },
      {
        id: "nenhum",
        label: "Nenhum",
        color: "#6b7280",
        slots: 1,
        correct: ["Goes"],
      },
      {
        id: "nenhum_espiritual",
        label: "Nenhum mas espiritualmente São Bernardo",
        color: "#78716c",
        slots: 1,
        correct: ["Helder"],
      },
      {
        id: "molhado",
        label: "pro que ta molhado 😂😂",
        color: "#0ea5e9",
        slots: 1,
        correct: ["Pedro"],
      },
      {
        id: "que_pergunta",
        label: "que pergunta",
        color: "#a855f7",
        slots: 1,
        correct: ["Marcella"],
      },
    ],
  },
  {
    id: 2,
    title: "Qual sua música favorita?",
    timeLimit: 120,
    items: PESSOAS,
    categories: [
      {
        id: "juice_wrld",
        label: "Juice WRLD",
        color: "#ff0000",
        slots: 1,
        correct: ["Coach"],
      },
      {
        id: "nenhum",
        label: "N tenho",
        color: "#6b7280",
        slots: 1,
        correct: ["Goes"],
      },
      {
        id: "david_bowie",
        label: "David Bowie",
        color: "#1f2937",
        slots: 1,
        correct: ["Helder"],
      },
      {
        id: "angela_destro",
        label: "Angela Destro",
        color: "#3b82f6",
        slots: 1,
        correct: ["Angela"],
      },
      {
        id: "paramore",
        label: "Paramore",
        color: "#ef4444",
        slots: 1,
        correct: ["Branco"],
      },
      {
        id: "rogerio_skylab",
        label: "Rogério Skylab",
        color: "#f59e0b",
        slots: 1,
        correct: ["Pedro"],
      },
      {
        id: "filho_do_piseiro",
        label: "filho do piseiro",
        color: "#22c55e",
        slots: 1,
        correct: ["Rebeca"],
      },
      {
        id: "baco_exu_do_blues",
        label: "Baco exu do blues",
        color: "#15803d",
        slots: 1,
        correct: ["Nicolas"],
      },
      {
        id: "imagine_dragons",
        label: "imagine dragões",
        color: "#a855f7",
        slots: 1,
        correct: ["Marcella"],
      },
      {
        id: "ajr",
        label: "AJR",
        color: "#0ea5e9",
        slots: 1,
        correct: ["Vic"],
      },
      {
        id: "matue",
        label: "Matue",
        color: "#6d28d9",
        slots: 1,
        correct: ["Murilo"],
      },
      {
        id: "billie_eilish",
        label: "Billie Eilish",
        color: "#10b981",
        slots: 1,
        correct: ["Guilherme"],
      },
      {
        id: "j_cole",
        label: "J Cole",
        color: "#f97316",
        slots: 1,
        correct: ["Bruno"],
      },
      {
        id: "brent_faiyaz",
        label: "Hoje? Brent Faiyaz",
        color: "#facc15",
        slots: 1,
        correct: ["Leandro"],
      },
      {
        id: "slipknot",
        label: "slipknot",
        color: "#374151",
        slots: 1,
        correct: ["Isabela"],
      },
    ],
  },
];

// ============================================================
// CONFIGURAÇÕES DO JOGO
// ============================================================
const GAME_CONFIG = {
  pointsPerCorrectSlot: 10, // pontos por slot correto
  bonusForPerfect: 1500, // bônus por pergunta 100% correta
  scoreBoardDuration: 8000, // ms mostrando placar entre rodadas
  minPlayers: 1, // mínimo para iniciar (1 para testes)
};

module.exports = { QUESTIONS, GAME_CONFIG };
