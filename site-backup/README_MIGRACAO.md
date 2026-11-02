# Backup independente — Marcador de Treino (Hatchable v36, 2026-11-02)

Este diretório foi copiado do projeto Hatchable Marcador de Treino, versão 36. Os arquivos Android originais ficam nas pastas app/ e .github/ deste repositório, nesta mesma ramificação.

## O que foi salvo
- Site (public/): interface, estilos, scripts, notificações e painel administrativo.
- API (api/): funções de login de usuário, histórico de corrida, avisos, suporte, moderação, etc.
- migrations/: SQL com estruturas de tabelas criadas para o aplicativo.
- hatchable.toml: configuração original da plataforma.
- Imagens JPG dos exercícios e da interface: copiadas para public/ nesta ramificação.
- APK: releases do próprio repositório GitHub, não duplicados nesta pasta.

## Como migrar para outra hospedagem
1. Baixe o ZIP desta ramificação do GitHub e preserve uma cópia em armazenamento pessoal.
2. Hospede public/ em um servidor HTTPS com suporte a aplicações web e JS.
3. Recrie os serviços de autenticação, envio de e-mails, armazenamento de imagens e APIs, pois as funções em api/ importam o SDK específico `hatchable`, que não roda automaticamente em outros serviços.
4. Crie um banco de dados PostgreSQL na nova plataforma e adapte/aplique migrations/*.sql com atenção aos tipos e tabelas de autenticação reservadas (`users` etc.), que são controladas pelo Hatchable original.
5. Faça uma exportação privada e protegida do banco de dados de usuários, mensagens, exercícios e corridas ANTES de perder acesso à hospedagem. ESTE BACKUP DE CÓDIGO NÃO CONTÉM DADOS PARTICULARES DO BANCO.
6. Atualize os endereços da API e o domínio no código Android (`MainActivity.SITE`), faça uma nova compilação e configure uma assinatura Android estável para futuras atualizações.
7. Faça testes de login, moderação, backup, envio de imagens e instalação do APK antes de trocar a hospedagem ou o domínio.

## Sobre versões Android antigas
O aplicativo Android carrega a interface de `https://marcador-de-treino-ckcg.hatchable.site` e depende dela. Caso o domínio original não esteja disponível, usuários precisarão receber um APK configurado para a nova hospedagem. Uma atualização obrigatória remota não recupera um app que não consegue abrir o domínio antigo.

## Atualização sem Play Store
`public/android-update.json` é a configuração da atualização. `minimumVersionCode` está intencionalmente em 0, sem bloquear usuários antigos. A ativação segura exige que o APK envie o código da versão instalada e que as futuras compilações usem assinatura compatível.

## Segurança e limitação
- Não publique dados pessoais, senhas, tokens, backups de banco ou chaves de assinatura no repositório público.
- Um backup somente de código não garante cópia de contas e conversas.
- Este é um ponto de recuperação do código; não é um deploy portátil de um clique.
