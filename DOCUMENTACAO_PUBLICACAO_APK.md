# Publicação do APK oficial

Esta pasta do projeto é pública. Não coloque aqui senhas, chaves de assinatura, arquivos .jks, nem os valores das GitHub Actions secrets.

## Versão atual preparada

O código Android está na versão 1.9.2, que comunica ao site sua versão instalada para receber avisos de atualização.

Para produzir um APK **oficial** em GitHub Actions, é necessário que as quatro Actions secrets do repositório estejam configuradas:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD`.

O workflow primeiro gera um APK debug para testes. Só executa `assembleRelease` e publica uma nova release no GitHub quando as quatro secrets estiverem disponíveis e a assinatura for validada. Não publique manualmente o APK debug como atualização.

## Importante para instalações antigas

Os APKs publicados até 1.9.1 eram builds **debug**, que podem ter assinaturas diferentes da versão oficial 1.9.2. Antes de remover um APK antigo, faça backup dos seus dados do aplicativo. O Android pode recusar instalar uma versão com outra assinatura por cima do aplicativo existente. Não ativar atualizações obrigatórias antes de confirmar a migração segura. A instalação de APK externo sempre requer confirmação do usuário.

A chave privada de assinatura deve ser mantida com segurança, fora deste repositório.
