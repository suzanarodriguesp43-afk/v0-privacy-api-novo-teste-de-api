# Instruções de Deploy

## Configurar Variável de Ambiente no Vercel

Para que a integração com a Furion Pay funcione em produção, você precisa adicionar a chave da API como variável de ambiente no Vercel:

1. Acesse seu projeto no Vercel: https://vercel.com/dashboard
2. Vá em **Settings** (Configurações)
3. Clique em **Environment Variables** (Variáveis de Ambiente)
4. Adicione a seguinte variável:
   - **Name (Nome):** `FURIONPAY_API_KEY`
   - **Value (Valor):** `fp_live_F7q3OYYarbVjs1M0PQjURHIiqidJSXwy`
   - **Environments:** Marque todas as opções (Production, Preview, Development)
5. Clique em **Save** (Salvar)
6. Faça um novo deploy ou **Redeploy** do projeto para aplicar as mudanças

## Verificar se funcionou

Após adicionar a variável e fazer o deploy:
1. Acesse seu site em produção
2. Tente gerar um pagamento
3. O QR Code PIX deve aparecer corretamente

## Nota de Segurança

- NUNCA compartilhe sua chave API publicamente
- A chave API deve estar apenas nas variáveis de ambiente do Vercel
- Não commite o arquivo `.env.local` no Git
