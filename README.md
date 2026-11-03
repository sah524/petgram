# PetGram

**Plataforma de rede social para animais de estimação**

O PetGram é uma aplicação mobile desenvolvida para conectar tutores de animais de estimação por meio de uma plataforma de interação social. A solução permite o compartilhamento de publicações, o gerenciamento de perfis de pets, a interação entre usuários e a participação em comunidades.

O projeto integra uma aplicação mobile desenvolvida com React Native e Expo a uma API REST construída com Node.js, Express e TypeScript, utilizando MySQL para persistência de dados.

Seu desenvolvimento tem caráter acadêmico e busca aplicar boas práticas de engenharia de software, organização arquitetural, integração entre sistemas e desenvolvimento de aplicações multiplataforma.

## 1. Visão geral

O PetGram foi concebido para oferecer um ambiente digital dedicado à comunidade de tutores de animais de estimação.

A plataforma centraliza funcionalidades de publicação de conteúdo, gerenciamento de perfis, acompanhamento de outros usuários e organização de comunidades temáticas.

O sistema é composto por dois módulos principais:

- **Aplicação mobile:** responsável pela interface, navegação, gerenciamento de estados e interação com os usuários.
- **API backend:** responsável pelas regras de negócio, autenticação, autorização, persistência e disponibilização dos dados.

## 2. Funcionalidades

### Autenticação e gerenciamento de usuários

- Cadastro de usuários.
- Autenticação por e-mail e senha.
- Proteção de senhas utilizando hash.
- Autenticação baseada em JSON Web Token (JWT).
- Visualização e edição de perfis.

### Gerenciamento de pets

- Cadastro de animais de estimação.
- Associação de pets aos respectivos tutores.
- Gerenciamento de informações dos animais.

### Publicações e interações

- Criação de publicações com imagens e legendas.
- Seleção de múltiplas imagens para uma publicação.
- Exibição de imagens em formato de carrossel.
- Interação com imagens por gestos de ampliação e redução.
- Visualização de publicações no feed.
- Interação por meio de curtidas.

### Relacionamento entre usuários

- Visualização de perfis.
- Funcionalidade de seguir usuários.
- Exploração de conteúdos e perfis.

### Comunidades

- Criação de comunidades temáticas.
- Visualização de comunidades.
- Acesso aos detalhes e conteúdos relacionados às comunidades.

### Administração

- Controle de acesso administrativo.
- Painel de gerenciamento.
- Moderação de publicações.
- Gerenciamento de contas de usuários.

**Nota:** as funcionalidades estão sujeitas ao estágio de implementação e validação do projeto.

## 3. Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Aplicação mobile | React Native, Expo, TypeScript |
| Comunicação HTTP | Axios |
| Backend | Node.js, Express, TypeScript |
| Banco de dados | MySQL |
| ORM | Drizzle ORM |
| Autenticação | JWT |
| Segurança de senhas | Bcrypt |
| Versionamento | Git e GitHub |

## 4. Arquitetura do sistema

A organização do projeto utiliza conceitos dos padrões arquiteturais MVC (Model-View-Controller) e MVVM (Model-View-ViewModel), com o objetivo de promover separação de responsabilidades, modularidade e facilidade de manutenção.

### Backend — MVC

A API organiza suas responsabilidades em camadas:

- **Model:** definição das estruturas de dados e integração com a camada de persistência.
- **Controller:** processamento de requisições, validações e execução das regras de negócio.
- **Routes:** definição dos endpoints HTTP e direcionamento das requisições aos respectivos controladores.

### Aplicação mobile — MVVM

A aplicação utiliza a separação entre:

- **Model:** representação das entidades e estruturas de dados.
- **View:** componentes responsáveis pela apresentação visual e interação.
- **ViewModel:** gerenciamento dos estados e da lógica de apresentação.

A comunicação entre frontend e backend ocorre por meio de requisições HTTP à API REST.

## 5. Estrutura do projeto

```text
PetGram_APP/
│
├── Api/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── app.ts
│   ├── package.json
│   └── tsconfig.json
│
├── App/
│   ├── assets/
│   ├── components/
│   ├── design-system/
│   ├── models/
│   ├── screens/
│   ├── services/
│   ├── viewmodels/
│   ├── views/
│   ├── App.tsx
│   ├── app.json
│   └── package.json
│
└── .gitignore
```

O diretório `Api` concentra os serviços do backend, enquanto o diretório `App` contém a aplicação mobile.

## 6. Instalação e execução

### 6.1. Pré-requisitos

Para executar o projeto em ambiente de desenvolvimento, são necessários:

- Node.js e npm.
- MySQL.
- Git.
- Expo Go ou emulador compatível com React Native.
- Editor de código, preferencialmente Visual Studio Code.

### 6.2. Clonar o repositório

```bash
git clone -b petgram-atualizado https://github.com/sah524/petgram.git
cd petgram
```

### 6.3. Configurar o backend

Acesse o diretório da API e instale as dependências:

```bash
cd Api
npm install
```

Configure o arquivo `.env` com as variáveis de ambiente exigidas pela aplicação, incluindo os parâmetros de conexão com o banco de dados e a chave utilizada na autenticação JWT.

Inicialize o servidor:

```bash
npm run dev
```

Na configuração de desenvolvimento utilizada no projeto, a API é disponibilizada na porta `3000`.

### 6.4. Configurar o frontend

Em outro terminal, acesse o diretório da aplicação:

```bash
cd App
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npx expo start -c
```

A aplicação poderá ser executada por meio de um emulador ou do Expo Go.

Para testes em dispositivos físicos, é necessário garantir a conectividade entre o dispositivo e o servidor da API, além de configurar corretamente o endereço de acesso ao backend.

## 7. Banco de dados

O PetGram utiliza MySQL como sistema gerenciador de banco de dados relacional.

A camada de persistência é responsável pelo armazenamento e gerenciamento das informações relacionadas a usuários, animais de estimação, publicações, comunidades e relacionamentos sociais.

O Drizzle ORM é utilizado para auxiliar na integração entre a aplicação backend e o banco de dados.

## 8. Segurança

O projeto contempla mecanismos de segurança relacionados à autenticação, ao armazenamento de credenciais e ao controle de acesso.

Entre as práticas adotadas ou previstas estão:

- Armazenamento de senhas utilizando hash criptográfico.
- Autenticação baseada em JWT.
- Validação de dados recebidos pela API.
- Controle de acesso às operações administrativas.
- Utilização de variáveis de ambiente para configurações sensíveis.
- Exclusão de arquivos de configuração privada do versionamento.

Arquivos como `.env` e diretórios de dependências, como `node_modules`, não devem ser incluídos em novos commits.

O uso em ambiente de produção exige revisão das configurações de segurança, das permissões administrativas e do gerenciamento de credenciais.

## 9. Objetivos técnicos

O desenvolvimento do PetGram contempla os seguintes objetivos:

- Aplicar conceitos de desenvolvimento mobile multiplataforma.
- Desenvolver e consumir serviços por meio de uma API REST.
- Implementar autenticação e autorização de usuários.
- Utilizar um banco de dados relacional para persistência.
- Organizar responsabilidades por meio dos padrões MVC e MVVM.
- Implementar recursos de armazenamento e apresentação de imagens.
- Desenvolver funcionalidades de interação social.
- Aplicar práticas de versionamento e organização de código.

## 10. Evolução do projeto

O PetGram permanece em desenvolvimento, com possibilidades de evolução nas seguintes áreas:

- Otimização de desempenho e carregamento de imagens.
- Aperfeiçoamento da experiência de navegação.
- Ampliação das funcionalidades de comunidades.
- Implementação de notificações em tempo real.
- Desenvolvimento de mensagens entre usuários.
- Evolução das ferramentas administrativas.
- Ampliação da cobertura de testes.
- Preparação para distribuição em plataformas mobile.

## 11. Contexto acadêmico

O PetGram é desenvolvido no contexto de atividades acadêmicas da área de Análise e Desenvolvimento de Sistemas.

O projeto proporciona a aplicação prática de conhecimentos relacionados à programação, arquitetura de software, modelagem de dados, desenvolvimento mobile, APIs REST e integração entre diferentes tecnologias.

## 12. Repositório

**Projeto:** PetGram

**Repositório:** https://github.com/sah524/petgram

**Branch de desenvolvimento atualizada:** `petgram-atualizado`

**Status:** Em desenvolvimento

---

**PetGram — Plataforma de interação social dedicada aos animais de estimação.**
