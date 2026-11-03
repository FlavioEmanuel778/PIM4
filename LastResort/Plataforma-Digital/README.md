# EduDigital

Plataforma de cursos de inclusão digital (Next.js + TypeScript + MySQL + Better Auth), construída a partir do **Design PIM**.

## Como rodar
1. Instale e inicie o **MySQL 8+** e tenha o **Node 20+**.
2. Copie `.env.example` para `.env` e ajuste `DB_PASSWORD` e `BETTER_AUTH_SECRET` (se o `.env` já existe, só confira).
3. `npm install`
4. `npm run dev` (o `predev` cria o banco e as tabelas a partir de `database/schema.sql`).
5. Em outro terminal: `npm run db:seed` para criar os dados de demonstração.
6. Abra **http://localhost:3000** (use `localhost`, não `127.0.0.1`: o Better Auth confere a origem configurada em `.env`).

**Atualizando de uma versão anterior:** `npm run db:init` adiciona as colunas novas sem apagar dados. Para os dados de demonstração ficarem iguais ao design novo, prefira recomeçar do zero:

Para recomeçar do zero em desenvolvimento: `npm run db:reset && npm run db:init && npm run db:seed`.

## Contas de demonstração (senha `EduDigital2026`, ou `SEED_PASSWORD`)
| Perfil | E-mail |
|---|---|
| Administradora | admin@edudigital.com.br |
| Professora | ana.ribeiro@edudigital.com.br |
| Aluna | beatriz.oliveira@email.com |

Use a aba **Aluno/Professor** no login; o acesso de admin fica no link **Administrador**.

## O que cada perfil faz
- **Visitante**: landing, cadastro de aluno (`/cadastro`) e de professor (`/cadastro/professor`), login.
- **Admin** (`/admin`): painel; **CRUDL** de alunos e professores (listar com busca e paginação, criar, ver, editar, excluir com confirmação); consulta de cursos. Todo aluno criado recebe um número de matrícula (`ED2026001`...).
- **Aluno** (`/aluno`): meus cursos com progresso e "próximo passo"; conteúdos (arquivo ou link do professor); **exercícios de prática** (sem nota, com explicação, "tentar novamente" e revisão); **questionário avaliativo** de 10 questões (nota 0-10, uma tentativa) com resultado e revisão dos erros; histórico de notas; perfil com troca de senha. Também pode se matricular em outros cursos.
- **Professor** (`/professor`): *Disciplinas* (responsável ou colaborador de cada uma), *Turma* (alunos, matrícula, busca), *Conteúdos* (adicionar/editar/excluir, com anexo PDF/DOCX/MP4 de até 20 MB ou link, e publicado/rascunho), *Notas* (lançar a nota do questionário de toda a turma) e *Perfil*.

### Regras que vale conhecer
- **Nota**: a nota lançada pelo professor vale mais que a correção automática. Campo em branco remove a nota lançada e volta a valer a correção automática (ou "sem nota").
- **Rascunho**: conteúdo não publicado não aparece para o aluno nem entra no progresso.
- **Anexos** ficam em `storage/uploads` (mude com `UPLOAD_DIR`); só saem por `/api/conteudos/:id/arquivo`, para quem tem direito. Inclua essa pasta nos backups. O tipo é conferido pela extensão **e** pelo conteúdo do arquivo.
- **Colaborador**: tabela `course_collaborators`; o responsável fica em `courses.teacher_id`. Ambos podem ver a turma, editar conteúdos e lançar notas.

## Segurança
- A autorização é feita **no servidor** (páginas e APIs). Esconder botões não protege nada.
- O papel (`admin`/`professor`/`aluno`) é definido pelo servidor; o cadastro público nunca aceita `admin`.
- O gabarito dos exercícios e do questionário **não é enviado ao navegador**: a correção acontece na API.
- Senhas usam o hash do Better Auth. A senha nunca é exibida. Trocar a senha encerra as outras sessões.
- Antes de produção: HTTPS, segredo exclusivo, rate limiting no cadastro (`/api/register`), backups e usuário MySQL sem privilégios globais. Crie a primeira conta admin só por seed ou manualmente (`UPDATE user SET role='admin' WHERE email='...'`).

## Mapa de rotas
| Página | Rota |
|---|---|
| Landing | `/` |
| Login / Cadastros | `/login`, `/cadastro`, `/cadastro/professor` |
| Admin | `/admin`, `/admin/alunos[/novo\|/:id\|/:id/editar]`, `/admin/professores[...]`, `/admin/cursos` |
| Aluno | `/aluno`, `/aluno/cursos/:id`, `.../conteudos/:id`, `.../exercicios/:id`, `.../questionario`, `.../resultado`, `/aluno/notas`, `/aluno/perfil` |
| Professor | `/professor`, `/professor/turma`, `/professor/conteudos[/novo\|/:id/editar]`, `/professor/notas`, `/professor/perfil` (use `?curso=ID` para escolher a disciplina) |

## API
`POST /api/register` · `GET|POST /api/admin/usuarios` · `GET|PUT|DELETE /api/admin/usuarios/:id` · `POST /api/professor/conteudos` · `PUT|DELETE /api/professor/conteudos/:id` · `POST /api/professor/notas` · `GET /api/conteudos/:id/arquivo` · `PUT /api/perfil` · `POST /api/perfil/senha` · `POST /api/aluno/matriculas` · `POST /api/aluno/conteudos/:id/concluir` · `POST /api/aluno/exercicios/:id/responder` · `POST /api/aluno/cursos/:id/questionario` · Better Auth em `/api/auth/*` · `GET /api/admin/users` e `POST /api/admin/users/:id/ban|unban` (bloqueio de contas, mantidos do projeto-base).

## Limites conhecidos
- Professores não são vinculados a cursos pela interface (o design não prevê); o vínculo (responsável e colaborador) vem do seed.
- "Esqueci minha senha" e "Falar com o suporte" abrem um e-mail (`suporte@edudigital.com.br`); não há envio de e-mail pela plataforma.
- Termos de uso e Política de privacidade são textos-modelo.
