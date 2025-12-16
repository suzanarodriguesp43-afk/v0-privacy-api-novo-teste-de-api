# Como Configurar a Variável de Ambiente no Vercel

## O Problema
Você está recebendo o erro "API não configurada" porque a chave da API FurionPay não está configurada no ambiente de produção do Vercel.

## Solução Passo a Passo

### 1. Acesse o Dashboard do Vercel
- Vá para: https://vercel.com/dashboard
- Encontre o projeto: **privacy-api-novo-teste-de-api**
- Clique no projeto para abrir

### 2. Vá para Configurações
- Clique na aba **Settings** (Configurações)
- No menu lateral esquerdo, clique em **Environment Variables** (Variáveis de Ambiente)

### 3. Adicione a Variável
Clique em **Add** e preencha:

- **Key (Nome):** `FURIONPAY_API_KEY`
- **Value (Valor):** `fp_live_F7q3OYYarbVjs1M0PQjURHIiqidJSXwy`
- **Environments:** Selecione **Production**, **Preview** e **Development**

### 4. Salve e Faça Redeploy
- Clique em **Save**
- Volte para a aba **Deployments**
- Encontre o último deployment
- Clique nos 3 pontinhos (...) e selecione **Redeploy**
- Marque a opção **Use existing Build Cache** se quiser mais rápido
- Clique em **Redeploy**

### 5. Teste
- Aguarde o deploy terminar (geralmente 1-2 minutos)
- Acesse seu site: https://v0-privacy-api-novo-teste-de-api.vercel.app/
- Tente gerar um pagamento novamente

## Verificação
Depois do redeploy, nos logs você deverá ver:
```
[v0] Create payment - Endpoint chamado
[v0] Create payment - API Key exists: true
[v0] Create payment - API Key length: 44
[v0] Create payment - PIX criado com sucesso!
```

## Importante
- A variável só estará disponível após o redeploy
- Certifique-se de selecionar todos os ambientes (Production, Preview, Development)
- A chave API nunca deve ser commitada no código, apenas nas variáveis de ambiente

## Suporte
Se continuar com problemas, verifique os logs em tempo real:
- Vá para o projeto no Vercel
- Clique na aba **Logs**
- Selecione **Runtime Logs**
- Tente gerar um pagamento e veja os logs aparecerem
