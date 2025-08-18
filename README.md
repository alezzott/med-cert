# 🏥 MedCert - Sistema de Gestão de Atestados Médicos

## 📚 Sumário

- [Descrição](#descrição)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
  - [Rodando com Docker Compose](#rodando-com-docker-compose)
  - [Rodando localmente (sem Docker)](#rodando-localmente-sem-docker)
- [Configuração das Credenciais da API da OMS](#configuração-das-credenciais-da-api-da-oms)
- [Estrutura do Backend](#estrutura-do-backend)
  - [Módulo de Autenticação](#módulo-de-autenticação)
  - [Módulo de Colaboradores](#módulo-de-colaboradores)
  - [Módulo de Atestados Médicos](#módulo-de-atestados-médicos)
  - [Módulo de Integração CID/OMS](#módulo-de-integração-cidoms)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Testes](#testes)
- [Troubleshooting](#troubleshooting)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Por que adotar o CID-11](#por-que-adotar-o-cid-11-icd-11-da-oms-em-vez-do-cid-10-atualmente-utilizado-no-brasil)
- [Comparativo CID-10 x CID-11](#comparativo-cid-10-icd-10-x-cid-11-icd-11)
- [Swagger](#documentação-da-api-swagger)

---

## 📖 Descrição

O **MedCert** é um sistema web completo para **gestão de atestados médicos**, com:

- Cadastro de colaboradores
- Lançamento de atestados
- Integração à **API oficial da OMS** para busca de códigos da **Classificação Internacional de Doenças (CID)**  
- Listagem e filtros avançados de registros

O backend é construído com **NestJS** e **MongoDB**, com autenticação **JWT**, validação de CPF, paginação, ordenação e suporte a fallback para integração externa.

---

## ⚙️ Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- Node.js 18+ (para execução local sem Docker)
- Conta gratuita na [API da OMS ICD](https://icd.who.int/icdapi/Account/Register)

---

## 🚀 Instalação e Execução

### ▶️ Rodando com Docker Compose

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/seu-usuario/med-cert.git
   cd med-cert
   ```

2. **Configure as variáveis de ambiente:**
   - Copie `.env.example` para `.env` nas pastas `backend` e `frontend`
   - Edite os valores conforme necessário

3. **Configure as credenciais da API da OMS**  
   Consulte [Configuração das Credenciais da API da OMS](#configuração-das-credenciais-da-api-da-oms).

4. **Suba os containers:**
   ```sh
   docker-compose up --build
   ```

5. **Acesse a aplicação:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend:** [http://localhost:4000](http://localhost:4000)
   - **MongoDB:** [localhost:27017](mongodb://localhost:27017)

---

### 💻 Rodando localmente (sem Docker)

1. **Backend**
   ```sh
   cd backend
   npm install
   npm run start:dev
   ```

2. **Frontend**
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

3. **MongoDB**
   - Instale e rode localmente ou use Docker apenas para o banco:
     ```sh
     docker run -d -p 27017:27017 --name medcert-mongo mongo:5.0
     ```

---

## 🔑 Configuração das Credenciais da API da OMS

1. **Crie uma conta gratuita** em [https://icd.who.int/icdapi](https://icd.who.int/icdapi)  
   → Clique em **Register** e siga o processo para obter **Client ID** e **Client Secret**.

2. **Adicione ao backend (`.env`):**
   ```
    OMS_CLIENT_ID=seu_client_id
    OMS_CLIENT_SECRET=seu_client_secret
    OMS_API_BASE=https://id.who.int/icd
    OMS_TOKEN_URL=https://icdaccessmanagement.who.int/connect/token
   ```

3. **Funcionamento da integração:**
   - Autenticação via OAuth2 Client Credentials
   - Token armazenado em cache e renovado automaticamente

> **Atenção:** Nunca compartilhe suas credenciais publicamente.

---

## 🏗️ Estrutura do Backend

## Estrutura do Backend

O backend segue uma arquitetura modular inspirada nos princípios de **Domain-Driven Design (DDD)**.  
Embora o projeto utilize conceitos básicos de DDD no momento (módulos, value objects e separação por domínio), ele está estruturado de forma a permitir evolução para um DDD mais completo no futuro.

### 🔒 Módulo de Autenticação
- Autenticação via **JWT** (expiração padrão: 4h)
- Guards para proteção de rotas e controle por permissões (roles)
- DTOs para login, cadastro e respostas
- Testes unitários para controllers e services

### 👥 Módulo de Colaboradores
- Cadastro com nome, CPF (validação completa), data de nascimento e cargo
- Busca, filtros, paginação e status ativo/inativo
- Uso de **Value Objects** para CPF
- Repository Pattern para desacoplamento

### 🩺 Módulo de Atestados Médicos
- Cadastro relacionando colaborador, CID, datas e observações
- Filtros por colaborador, período e CID
- DTOs para criação e retorno

### 🌐 Módulo de Integração CID/OMS

#### Cache e Fallback

O sistema implementa uma estratégia robusta para garantir disponibilidade e performance na integração com a API da OMS:

##### 📦 Sistema de Cache

- **Cache de Token OAuth2**: Token de autenticação armazenado em memória com renovação automática antes do vencimento
- **Cache de Respostas CID**: Resultados de busca são cacheados temporariamente para reduzir latência e consumo da API
- **TTL (Time To Live)**: Configuração flexível de tempo de vida do cache

##### 🔄 Sistema de Fallback

1. **Fallback de Token**
   - Se o token OAuth2 falhar, tenta renovação automática
   - Em caso de falha crítica, retorna códigos CID básicos pré-configurados

2. **Fallback de API**
   - **Timeout configurável**: Requisições com limite de tempo para evitar travamento
   - **Retry automático**: Até 3 tentativas
   - **Dados locais**: Base de códigos CID essenciais armazenada localmente

3. **Fallback de Conectividade**
   - Detecta falhas de rede e ativa modo offline
   - Retorna sugestões baseadas em cache local

4. **Limite de Requisições por Usuário**
   - **10 requisições por minuto** por usuário autenticado
   - **5 requisições por minuto** para busca de CID especificamente
   - Contador individual por sessão

---

## 🔄 Fluxo de Autenticação

1. Usuário realiza login via frontend
2. Backend valida credenciais e retorna JWT
3. Frontend armazena o token e protege rotas
4. Token tem validade padrão de 4h
5. Backend valida token a cada requisição protegida

---

## 🧪 Testes

**Backend**
```sh
cd backend
npm run test
```
- Testes unitários (controllers, services, integração OMS)
- Testes e2e dos principais fluxos

**Frontend**
```sh
cd frontend
npm run test
```

---

## 🛠 Troubleshooting

- **Falha na autenticação OMS:**  
  Verifique OMS_CLIENT_ID e OMS_CLIENT_SECRET no `.env`
- **MongoDB não conecta:**  
  Certifique-se de que o container está ativo e porta 27017 está livre
- **Frontend não acessa backend:**  
  Confira se `VITE_API_URL` aponta para o backend correto
- **Erro de CORS:**  
  Backend já está configurado para aceitar o frontend local

---

## 📚 Documentação da API - Swagger

A API do MedCert possui documentação interativa gerada automaticamente via **Swagger**.

- **Acesse:** [http://localhost:4000/docs](http://localhost:4000/docs)
- **Autenticação:** Para testar endpoints protegidos, clique em "Authorize" e insira seu token JWT.

### Principais recursos do Swagger

- Visualização de todos os endpoints disponíveis
- Teste de requisições diretamente pelo navegador
- Exemplos de payloads e respostas
- Descrição dos parâmetros, validações e erros
- Suporte a autenticação JWT

> **Dica:** Use o Swagger para explorar, o backend do MedCert.

---

## ✨ Funcionalidades Principais

- **Autenticação:** Login, logout, proteção de rotas, sessão de 4h
- **Gestão de Colaboradores:** Cadastro, filtros, busca, status, validação de CPF
- **Lançamento de Atestados:** Integração CID, observações
- **Listagem de Atestados:** Filtros avançados, paginação e ordenação
- **Integração OMS:** Busca em tempo real, fallback, cache de token
- **Interface:** Responsiva, validação em tempo real, feedback visual

---

## 📌 Por que adotar o CID-11 (ICD-11) da OMS em vez do CID-10 atualmente utilizado no Brasil?

Embora o Brasil utilize oficialmente a **Classificação Internacional de Doenças – 10ª Revisão (CID-10)**, a **OMS** recomenda a adoção do **CID-11 (ICD-11)** por diversos motivos:

- **Atualização e futuro:** É a versão mais recente e padrão internacional em breve
- **Cobertura e precisão:** Mais códigos, descrições completas e melhor estrutura para interoperabilidade
- **Integração internacional:** Facilita pesquisas e alinhamento com sistemas globais
- **Suporte oficial:** API, documentação e autenticação mantidos pela OMS
- **Preparação estratégica:** Evita retrabalho e garante prontidão para a transição

> **Observação:** É possível manter suporte a códigos do CID-10, mas a integração oficial da OMS é voltada ao CID-11.

---

## 📊 Comparativo: CID-10 (ICD-10) x CID-11 (ICD-11)

| **Critério**                 | **CID-10 (ICD-10)** | **CID-11 (ICD-11)** |
|------------------------------|--------------------|--------------------|
| **Ano de publicação**        | 1990 (entrada em vigor em 1994) | 2018 (atualizações contínuas) |
| **Número de códigos**        | ~14.400 | >55.000 |
| **Estrutura**                 | Hierárquica, menos granular | Modular e detalhada |
| **Cobertura clínica**         | Limitada em algumas áreas | Ampla, incluindo saúde mental, medicina tradicional e reabilitação |
| **Interoperabilidade**        | Limitada | Compatível com padrões modernos (ex.: HL7 FHIR) |
| **API oficial da OMS**        | Não disponível | Disponível com suporte e autenticação |
| **Idioma e tradução**         | Fixos e manuais | Multilíngues e atualizados pela OMS |
| **Atualizações**              | Pouco frequentes | Contínuas e adaptáveis |
| **Adoção global**             | Em uso, mas sendo substituído | Padrão internacional recomendado desde 2022 |

---

## 📬 Dúvidas ou problemas?

Abra uma **issue** no repositório.
