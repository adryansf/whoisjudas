# Feature Specification: Extrair WebSocket Server do Next.js

**Feature Branch**: `004-extract-websocket-server`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Gostaria de deixar a parte de websocket (server) agnóstico do next.js em um projeto a parte."

## User Scenarios & Testing

### User Story 1 - Extrair lógica WebSocket para projeto standalone (Priority: P1)

Como desenvolvedor, quero que o servidor WebSocket do jogo seja um projeto independente do Next.js, para que possa ser executado, testado e versionado separadamente.

**Why this priority**: Esta é a tarefa principal - separar uma preocupação técnica que está actualmente acoplada ao Next.js.

**Independent Test**: O servidor WebSocket standalone deve conseguir iniciar sem dependência do Next.js e processar eventos de sala e jogo.

**Acceptance Scenarios**:

1. **Given** um novo projeto server standalone, **When** executado, **Then** deve iniciar um servidor HTTP com Socket.IO sem importar código do Next.js
2. **Given** o servidor standalone em execução, **When** um cliente se conecta, **Then** deve processar eventos de room:create, room:join, room:leave
3. **Given** o servidor standalone em execução, **When** um jogo é iniciado, **Then** deve gerir timers e transições de fase

---

### User Story 2 - Manter compatibilidade com cliente existente (Priority: P2)

Como desenvolvedor, quero que o cliente WebSocket existente continue a funcionar sem alterações, para que a refatoração seja transparente.

**Why this priority**: Garante que a separação não quebra a experiência do utilizador final nem requer alterações no frontend.

**Independent Test**: O frontend existente deve conectar-se ao novo servidor e conseguir criar salas, juntar-se e jogar.

**Acceptance Scenarios**:

1. **Given** o cliente Socket.IO conectado ao novo servidor standalone, **When** emite room:create, **Then** recebe resposta com roomCode e playerId
2. **Given** o cliente Socket.IO conectado ao novo servidor standalone, **When** emite vote:cast, **Then** recebe confirmação e broadcasts de voto

---

### User Story 3 - Suportar múltiplos rooms por sessão de browser (Priority: P3)

Como jogador, quero poder participar em múltiplos rooms simultaneamente no mesmo browser, para que possa jogar com diferentes grupos de amigos ao mesmo tempo.

**Why this priority**: Funcionalidade existente que deve ser mantida após a separação.

**Independent Test**: Um browser session com múltiplos sockets em rooms diferentes deve conseguir interagir em cada room independentemente.

**Acceptance Scenarios**:

1. **Given** um browser session com 2 sockets em rooms diferentes, **When** cada socket emite eventos, **Then** apenas os jogadores do room correspondente recebem as respostas
2. **Given** um browser session com socket ativo num room, **When** cria segundo socket para room diferente, **Then** primeiro socket não é desconectado

---

### Edge Cases

- O que acontece quando o servidor standalone não está disponível? O cliente deve tentar reconnectar?
- Como é gerida a memória quando muitas rooms são criadas e fechadas?
- O que acontece se o servidor standalone crash? Como se recupera o estado do jogo?

## Requirements

### Functional Requirements

- **FR-001**: O servidor WebSocket DEVE funcionar como processo standalone, sem dependência do Next.js ou React
- **FR-002**: O servidor DEVE expor a mesma API de eventos Socket.IO que existe atualmente (room:create, room:join, game:start, vote:cast, judas:guess, etc.)
- **FR-003**: O servidor DEVE utilizar o package @whoisjudas/game para toda a lógica de jogo
- **FR-004**: O servidor DEVE suportar rate limiting para prevenir abuse
- **FR-005**: O servidor DEVE fazer broadcast de eventos de timer (game:timer, game:phase-change)
- **FR-006**: O servidor DEVE gerir transições de fase automaticamente (question -> vote -> reveal)
- **FR-007**: O cliente DEVE conseguir conectar-se ao servidor standalone sem alterações
- **FR-008**: O servidor DEVE suportar múltiplos rooms simultâneos
- **FR-009**: O servidor DEVE suportar múltiplos sockets por browser session em rooms diferentes
- **FR-010**: O servidor DEVE fazer graceful shutdown, limpando timers e recursos

### Key Entities

- **WebSocket Server**: Servidor standalone que gere conexões Socket.IO e eventos de jogo
- **Room**: Instância de jogo isolada, gerida pelo @whoisjudas/game
- **Player**: Jogador conectado a uma room via socket
- **Browser Session**: Tracking de múltiplos sockets do mesmo browser para multi-room support

## Success Criteria

### Measurable Outcomes

- **SC-001**: Servidor standalone inicia em menos de 5 segundos
- **SC-002**: Servidor consegue processar 100 eventos simultâneos sem degradação
- **SC-003**: 100% dos eventos Socket.IO existentes continuam a funcionar após separação
- **SC-004**: Servidor mantém < 100MB de memória com 50 rooms ativas
- **SC-005**: Reconnecting de cliente após perda de conexão funciona em < 3 segundos

## Clarifications

### Session 2026-04-11

- Q: Which Socket.IO server package to use with Node.js? → A: @socket.io/server only (drop bun-engine)

## Assumptions

- O package @whoisjudas/game continuará a existir como dependência do novo servidor
- A estrutura de eventos Socket.IO e payloads será mantida para retrocompatibilidade
- O servidor standalone será um processo Node.js separado com a sua própria porta
- O cliente frontend continuará a conectar-se via Socket.IO client, apenas alterando o URL de conexão
