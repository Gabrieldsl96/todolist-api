# 📝 API To-Do List

API REST completa para gerenciamento de tarefas (To-Do List) com autenticação JWT, OAuth2 (Google e GitHub), e integração com PostgreSQL usando Prisma ORM.

## 🚀 Tecnologias

- **Node.js** + **Express.js** - Framework web
- **TypeScript** - Type safety
- **Prisma ORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **Passport.js** - Autenticação (Local, JWT, OAuth2)
- **JWT** - JSON Web Tokens (Access + Refresh)
- **Zod** - Validação de schemas
- **bcrypt** - Hash de senhas
- **Docker** - Containerização

## 📋 Funcionalidades

### Autenticação
- ✅ Registro de usuário com email/senha
- ✅ Login com email/senha
- ✅ Login com Google OAuth2
- ✅ Login com GitHub OAuth2
- ✅ Access Token (15 minutos)
- ✅ Refresh Token (7 dias)
- ✅ Logout individual
- ✅ Logout de todos os dispositivos

### To-Dos
- ✅ Criar tarefa
- ✅ Listar tarefas (com filtros e paginação)
- ✅ Buscar tarefa por ID
- ✅ Atualizar tarefa
- ✅ Marcar/desmarcar como completo
- ✅ Deletar tarefa
- ✅ Estatísticas (total, completos, pendentes, atrasados)
- ✅ Filtros: por status, prioridade, busca textual
- ✅ Prioridades: LOW, MEDIUM, HIGH, URGENT

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd todolist-api
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o arquivo `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

### 4. Configure o banco de dados

#### Opção A: Docker (Recomendado)
```bash
docker-compose up -d postgres
```

#### Opção B: PostgreSQL local
Certifique-se de ter PostgreSQL instalado e rodando.

### 5. Execute as migrations
```bash
npm run prisma:migrate
```

### 6. Gere o cliente Prisma
```bash
npm run prisma:generate
```

### 7. (Opcional) Seed de dados
```bash
npm run prisma:seed
```

### 8. Inicie o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

A API estará disponível em: `http://localhost:4000`

## 📚 Endpoints da API

### Autenticação

#### POST `/api/auth/register`
Registra um novo usuário.

**Body:**
```json
{
  "email": "usuario@example.com",
  "name": "João Silva",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": "cm4z...",
      "email": "usuario@example.com",
      "name": "João Silva",
      "avatar": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### POST `/api/auth/login`
Login com email e senha.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

#### POST `/api/auth/refresh`
Atualiza o access token usando o refresh token.

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### POST `/api/auth/logout`
Logout (remove refresh token específico).

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### POST `/api/auth/logout-all`
Logout de todos os dispositivos.

**Headers:**
```
Authorization: Bearer <accessToken>
```

#### GET `/api/auth/me`
Retorna dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <accessToken>
```

#### GET `/api/auth/google`
Inicia autenticação com Google OAuth2.

#### GET `/api/auth/github`
Inicia autenticação com GitHub OAuth2.

---

### To-Dos

**Todas as rotas requerem autenticação:**
```
Authorization: Bearer <accessToken>
```

#### POST `/api/todos`
Cria um novo To-Do.

**Body:**
```json
{
  "title": "Estudar TypeScript",
  "description": "Revisar conceitos de tipos genéricos",
  "priority": "HIGH",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### GET `/api/todos`
Lista todos os To-Dos com filtros e paginação.

**Query Params:**
- `completed` (opcional): `true` | `false`
- `priority` (opcional): `LOW` | `MEDIUM` | `HIGH` | `URGENT`
- `search` (opcional): busca por título ou descrição
- `page` (opcional): número da página (default: 1)
- `limit` (opcional): itens por página (default: 10)

**Exemplo:**
```
GET /api/todos?completed=false&priority=HIGH&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "todos": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET `/api/todos/:id`
Busca um To-Do específico por ID.

#### PUT `/api/todos/:id`
Atualiza um To-Do.

**Body:**
```json
{
  "title": "Novo título",
  "description": "Nova descrição",
  "completed": true,
  "priority": "MEDIUM",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

#### PATCH `/api/todos/:id/toggle`
Marca/desmarca To-Do como completo.

#### DELETE `/api/todos/:id`
Deleta um To-Do.

#### GET `/api/todos/stats`
Retorna estatísticas dos To-Dos do usuário.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 50,
      "completed": 30,
      "pending": 20,
      "overdue": 5,
      "completionRate": 60
    }
  }
}
```

---

## 🗄️ Schema do Banco de Dados

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  password      String?
  googleId      String?        @unique
  githubId      String?        @unique
  avatar        String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
  todos         Todo[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  expiresAt DateTime
}

model Todo {
  id          String    @id @default(cuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

---

## 🔐 Segurança

### Boas Práticas Implementadas

1. **Senhas hasheadas** com bcrypt (salt rounds: 12)
2. **JWT Secrets** longos e aleatórios
3. **Access tokens** curtos (15 minutos)
4. **Refresh tokens** longos (7 dias) armazenados no banco
5. **Helmet.js** para segurança de headers HTTP
6. **CORS** configurado
7. **Validação de inputs** com Zod
8. **Rate limiting** (recomendado adicionar)

### Variáveis de Ambiente Sensíveis

⚠️ **NUNCA commite `.env.local`** no Git!

Mantenha seus secrets seguros:
- `JWT_ACCESS_SECRET` - mínimo 32 caracteres aleatórios
- `JWT_REFRESH_SECRET` - diferente do access secret
- `DATABASE_URL` - string de conexão do banco
- OAuth credentials (Google, GitHub)

---

## 🐳 Docker

### Desenvolvimento
```bash
# Inicia apenas o PostgreSQL
docker-compose up -d postgres

# Para todos os containers
docker-compose down
```

### Produção
```bash
# Inicia API + PostgreSQL
docker-compose up -d

# Visualiza logs
docker-compose logs -f api

# Para todos os containers
docker-compose down
```

---

## 🧪 Testes

```bash
# Executa testes
npm test

# Executa testes em modo watch
npm run test:watch

# Gera relatório de cobertura
npm run test:coverage
```

---

## 📦 Scripts Disponíveis

```bash
npm run dev              # Inicia servidor em modo desenvolvimento
npm run build            # Compila TypeScript
npm start                # Inicia servidor em produção
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Cria migration
npm run prisma:studio    # Abre Prisma Studio (GUI)
npm run prisma:seed      # Seed de dados
npm run prisma:reset     # Reseta banco de dados
npm test                 # Executa testes
```

---

## 📝 Comandos Úteis do Prisma

```bash
# Criar uma migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Resetar banco de dados (desenvolvimento)
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 🎯 Roadmap

- [ ] Rate limiting
- [ ] Testes unitários e de integração
- [ ] WebSocket para notificações em tempo real
- [ ] Upload de anexos nos To-Dos
- [ ] Tags e categorias
- [ ] Compartilhamento de To-Dos
- [ ] Lembretes por email
- [ ] Dashboard com gráficos

---

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

**Desenvolvido por Gabriel Lemos**