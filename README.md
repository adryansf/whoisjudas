# Who Is Judas? / Quem é Judas?

A real-time multiplayer biblical social deduction game built with Next.js and Socket.IO.

**Live:** https://whoisjudas.adryanfreitas.dev/

---

## Features / Funcionalidades

- **Real-time Multiplayer** - Socket.IO powered instant communication
- **Real-time Multiplayer** - Comunicação instantânea via Socket.IO
- **Role-based Gameplay** - Unique abilities for each player role (Judas vs Disciples)
- **Gameplay por Papéis** - Habilidades únicas para cada papel (Judas vs Discípulos)
- **Multi-tab Support** - Play from multiple browser tabs without conflicts
- **Suporte Multi-tab** - Jogue de múltiplas abas do navegador sem conflitos
- **Session Persistence** - Reconnect seamlessly after connection drops
- **Persistência de Sessão** - Reconecte-se facilmente após queda de conexão
- **i18n** - English and Portuguese (pt-BR) support
- **i18n** - Suporte a Inglês e Português (pt-BR)
- **PWA** - Installable as a mobile app
- **PWA** - Instalável como aplicativo móvel

## Tech Stack / Pilha Tecnológica

- **Framework**: Next.js 16 (App Router)
- **Real-time**: Socket.IO 4.x
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: TanStack Query
- **Internationalization**: next-intl
- **Analytics**: @vercel/analytics

## Getting Started / Como Começar

### Prerequisites / Pré-requisitos

- Node.js 20+
- pnpm 9+

### Installation / Instalação

```bash
# Install dependencies / Instalar dependências
pnpm install

# Start development / Iniciar desenvolvimento
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Project Structure / Estrutura do Projeto

```
whoisjudas/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── server/              # Socket.IO server
├── packages/
│   ├── ui/                  # Shared shadcn/ui components
│   ├── game/                # Game logic and state / Lógica do jogo
│   ├── data/                # Story/character JSON data
│   ├── env/                 # Environment configuration
│   └── config/              # Shared configs
└── specs/                   # Feature specifications
```

## Game Rules / Regras do Jogo

Players are divided into two teams:

Os jogadores são divididos em duas equipes:

- **Disciples / Discípulos** - Must identify and vote out the Judas
  Devem identificar e votar para fora o Judas
- **Judas** - Must blend in and avoid being voted out
  Deve se esconder e não ser votada para fora

### Win Conditions / Condições de Vitória

- **Disciples Win**: Identify and vote out the Judas
- **Discípulos vencem**: Identificar e votar fora o Judas
- **Judas Wins**: Survive the voting
- **Judas vence**: Sobreviver à votação

## Available Scripts / Scripts Disponíveis

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start all applications in development mode |
| `pnpm run build` | Build all applications |
| `pnpm run check` | Run Biome formatting and linting |

## License / Licença

Private project - all rights reserved
Projeto privado - todos os direitos reservados