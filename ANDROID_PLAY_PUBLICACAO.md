# Publicação Android do Coado — checklist

## Orçamento

- **Reserva para a conta Google Play:** **R$ 160**, pagamento único.
- A taxa oficial é de **US$ 25**; o valor em reais varia um pouco com câmbio e IOF.
- Não existe outra taxa da Play para publicar o aplicativo de celular nem para adicionar o companion do relógio à mesma conta.
- Domínio, Railway e Vercel são custos da plataforma web e não entram neste orçamento Android.

## O que é necessário

- [ ] Criar e pagar a conta de desenvolvedor no Google Play Console com dados brasileiros.
- [ ] Concluir a verificação de identidade e do aparelho solicitada pelo Google.
- [ ] Criar uma chave de assinatura de produção e guardá-la fora do repositório.
- [ ] Alterar o projeto para assinar a versão `release` com essa chave, nunca com a chave de depuração atual.
- [ ] Gerar o pacote Android de produção (`.aab`).
- [ ] Ativar o Play App Signing.
- [ ] Cadastrar no Google OAuth o certificado de assinatura fornecido pela Play, para o login nativo funcionar na versão instalada pela loja.
- [ ] Preparar a ficha da loja: nome, descrição, ícone, capturas de tela, categoria e e-mail de suporte.
- [ ] Publicar uma política de privacidade e disponibilizar exclusão de conta e dados.
- [ ] Testar em um Android físico: login Google, sessão no WebView, notificações, pomodoro e retorno do app em segundo plano.

## Sequência de publicação

1. **Conta e identidade** — criar a conta Play e concluir a verificação.
2. **Release técnico** — criar assinatura de produção, gerar o `.aab` e testar em aparelho físico.
3. **OAuth de produção** — adicionar o certificado da Play no cliente Android do Google OAuth e validar o login instalado.
4. **Ficha da loja** — preencher textos, imagens, privacidade e formulário de segurança de dados.
5. **Teste fechado** — para uma conta pessoal nova, manter pelo menos 12 testadores inscritos durante 14 dias.
6. **Produção** — pedir acesso à produção, enviar a versão e acompanhar a revisão da Google.

## Celular e relógio

Publicar primeiro o aplicativo de celular. O módulo do relógio existe no projeto, mas hoje ele é separado do aplicativo de celular; antes de levá-lo à Play, precisamos concluir o empacotamento como companion Wear OS e testá-lo em relógio físico com o celular pareado.

## Estado atual do projeto

- O endereço de produção configurado no Android é `https://coado.app.br`.
- Celular e relógio estão com `targetSdk 36`.
- As variantes `release` ainda usam assinatura de depuração; esta é a primeira correção técnica antes de gerar o pacote da Play.

## Referências oficiais

- Google Play Console cobra uma taxa única de US$ 25 para a conta de desenvolvedor.
- Contas pessoais novas precisam cumprir o teste fechado antes de solicitar produção.
- A ficha inclui a política de privacidade e o formulário de segurança de dados.
