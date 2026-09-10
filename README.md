# CAIO IMPORTS

Loja de chuteiras importadas (society, campo e futsal) com vitrine que fecha a venda pelo
WhatsApp e um painel de gestão para o lojista cadastrar produtos, registrar vendas,
acompanhar o resultado e editar os textos do site.

## Stack

- **React 19 + Vite** — SPA com React Router
- **Tailwind CSS** + CSS custom properties para o tema claro/escuro
- **Supabase** — Postgres, autenticação por e-mail/senha e storage das fotos
- **Lucide** para ícones
- **Motion** (`motion/react`) — sucessor do Framer Motion; animações e gestos
- **UI UX Pro Max** — skill de design no Cursor (paletas, tipografia, guidelines)
- **21st.dev** — catálogo de componentes React/Tailwind via CLI + MCP
- Animações próprias inspiradas em React Bits (Aurora, BlurText, TiltCard, etc.)

### O que o lojista edita vs o que fica fixo

| Editável no painel `/admin` | Fixo no código (só a empresa altera) |
| --- | --- |
| Produtos, fotos, estoque, preços | Layout, tipografia, paleta e atmosfera |
| Textos de hero, guia, garantia, footer | Animações, motion, microinterações |
| Contato (WhatsApp / Instagram) | Componentes 21st.dev e skills de UI |
| Vendas e monitoramento | Tema/comportamento visual e segurança |

Mudança de animação ou “cara” do site = solicitação à empresa que desenvolveu o sistema.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as credenciais do seu projeto Supabase
npm run dev
```

O painel fica em `/admin`. Sem as variáveis de ambiente o site continua abrindo, usando um
catálogo local de reserva, mas o painel exibe aviso de indisponibilidade.

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `VITE_SUPABASE_URL` | URL da API do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publicável (segura no navegador) |
| `API_KEY_21ST` | Chave do MCP/CLI 21st.dev (só no ambiente do desenvolvedor; não vai no Vite) |

A `service_role` key **nunca** deve entrar neste repositório nem no bundle do frontend.
O que protege os dados é o Row Level Security, não o segredo da chave.
A `API_KEY_21ST` também **nunca** sobe no Git — fica no ambiente do Windows / Cursor.

## Estrutura

```
src/
  admin/          painel: dashboard, produtos, vendas, conteúdo
  components/     vitrine, cabeçalho, cards, animações
  hooks/          sessão (useAuth), catálogo (useCatalog), tema (useTheme)
  lib/            client do Supabase, consultas e formatação
  pages/          home e página do produto
```

## Banco de dados

| Tabela | Função |
| --- | --- |
| `products` | catálogo: preço, custo, estoque, especificações, numerações, cores |
| `product_images` | galeria de ângulos por cor (`color_name`), ordenada; a primeira foto da primeira cor é a capa |
| `sales` | vendas lançadas manualmente, com total e lucro calculados pelo Postgres |
| `site_content` | textos editáveis de cada seção da loja |
| `product_events` | cliques no WhatsApp e visitas, para o painel de interesse |
| `admins` | quem tem acesso ao painel |

### Segurança

- RLS ativo em todas as tabelas. O visitante anônimo só lê o catálogo ativo e os textos
  do site, e só pode inserir eventos de interesse — não existe caminho de escrita.
- Vendas, clientes e administradores são legíveis apenas por quem está em `admins`.
- A verificação de permissão vive em um schema `private`, fora da API pública.
- O acesso ao painel é concedido por uma allowlist de e-mails: criar uma conta não dá
  acesso a nada por si só.

## Deploy

Hospedado na Vercel. O build é `npm run build` e a saída é `dist/`. O `vercel.json` cuida
do roteamento da SPA, do cache dos assets e dos cabeçalhos de segurança (HSTS, CSP,
proteção contra clickjacking e sniffing).

### Manter o Supabase ativo (plano Free)

Projetos Free do Supabase podem ser **pausados após ~7 dias sem consultas ao banco**.
Para evitar isso, há um cron diário na Vercel que chama `/api/keepalive` e faz uma
leitura leve em `site_content`.

Configure na Vercel (Settings → Environment Variables):

| Variável | Descrição |
| --- | --- |
| `CRON_SECRET` | Token secreto; a Vercel envia `Authorization: Bearer …` no cron |
| `SUPABASE_URL` | Mesma URL do projeto (pode repetir `VITE_SUPABASE_URL`) |
| `SUPABASE_PUBLISHABLE_KEY` | Mesma chave publicável do frontend |

Teste manual (substitua o token):

```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" https://caio-imports.vercel.app/api/keepalive
```

Resposta esperada: `{"ok":true,"rows":…,"at":"…"}`. O agendamento padrão é **todo dia às 09:00 UTC** (~06:00 em Brasília).
