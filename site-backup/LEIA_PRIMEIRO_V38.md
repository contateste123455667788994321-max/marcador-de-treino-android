Backup independente da versão 38 do Hatchable (Marcador de Treino) e código Android v1.9.2.

Arquivos sob site-backup/ incluem frontend, API, imagens e migrações PostgreSQL. Para migrar a outra plataforma, adapte a API dependente do SDK hatchable, configure um banco PostgreSQL, login, e-mails e armazenamento, e altere o domínio em MainActivity.java. O backup do código não contém dados privados dos alunos ou contas do banco.

Atualizações Android:
- O site consulta /api/android/latest para descobrir a última release oficial no GitHub. O APK >= v1.9.2 informa sua versão em ?native=1&build=N&version=X.Y.Z; apps antigos sem identificação recebem aviso não obrigatório de segurança.
- O app mostra Atualizar agora e Verificar atualizações no Perfil. Uma nova release só é publicada pelo workflow se houver quatro secrets de assinatura definidos: ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD.
- A chave privada foi entregue ao proprietário separadamente, em um pacote privado. NÃO a coloque no GitHub público.
- APKs de teste anteriores podem ter assinaturas incompatíveis: antes de reinstalar, exporte backup do app em Perfil > Fazer backup dos meus dados. A instalação por cima pode ser recusada pelo Android e a reinstalação apaga dados locais.
- android-update.json mantém minimumVersionCode=0 até existir uma base estável de APKs assinados que permita atualização por cima.
- Somente a interface é servida pelo site. O APK nativo não funciona automaticamente em outro domínio sem recompilação.

Backup do banco de dados e mídias privadas dos alunos deve ser feito em separado e guardado de modo protegido. Nunca publicar dados pessoais nesse repositório público.
