# Checklist de seguranca e privacidade

Escopo verificado: Cordova/Android + frontend Firebase Realtime Database + backend Node.js TCP/HTTP + FCM. O app trata localizacao como dado pessoal quando puder ser associada a dispositivo ou pessoa.

## Inventario de riscos (Top 10)

| Prioridade | Risco | Impacto | Tratamento |
|---|---|---|---|
| Alta | Regras RTDB publicas | Leitura, alteracao e apagamento de localizacao, configuracoes e tokens | Fechar regras por padrao; cliente autenticado anonimamente apenas le caminhos necessarios; Admin SDK grava |
| Alta | `/api/send-notification` sem controle | Spam, abuso de todos os tokens e custo operacional | API key administrativa fora do codigo, rate limit, limites de tamanho e lista de tokens |
| Alta | TCP sem autenticacao/limites | Spoofing de GPS, DoS e corrupcao do estado | Allowlist de IMEI, TLS/VPN recomendado, timeout, limite de conexoes/buffer e validacao |
| Alta | XSS em conteudo Firebase | Execucao de script via eventos, links e imagens adulterados | Escaping contextual, URL somente HTTPS, remover handlers inline como proxima etapa |
| Alta | Segredo Admin no workspace | Comprometimento total do projeto Firebase | `.gitignore`, Secret Manager/variavel protegida e rotacao se houve compartilhamento |
| Alta | Escrita direta do cliente como sharer | Cliente modificado publica qualquer coordenada | Sharer desligado por padrao; autorizacao deve ser server-side e por dispositivo |
| Media | Tokens FCM sem identidade/retencao | Cadastro abusivo e dados obsoletos | Firebase ID token, hash da chave, limite de registro e limpeza por falha |
| Media | CSP e allowlist Cordova amplas | XSS/dependencia comprometida com maior impacto | CSP restritiva, HTTPS-only e hosts explicitos |
| Media | GPS inicia sem consentimento | Coleta sem escolha clara e risco LGPD/GDPR | Consentimento antes de `watchPosition`, revogacao e finalidade exibida |
| Media | Retencao indefinida | Violacao de minimizacao e limitacao de armazenamento | TTL/rotina de exclusao, precisao reduzida e politica publicada |

## Alteracoes feitas

- `backend/server.js`: autentica registro FCM por Firebase ID token; protege notificacao administrativa por `HTTP_API_KEY`; limita corpo, origem, taxa, campos e tokens; nao devolve mensagens internas.
- `backend/parser.js` e `backend/tcpServer.js`: rejeitam payloads grandes/invalidos, limitam conexoes e buffer, tratam fragmentacao TCP e aplicam timeout.
- `backend/firebase.js`: aceita credencial via `FIREBASE_SERVICE_ACCOUNT_JSON`, valida identificador e coordenadas antes de gravar.
- `backend/fcm.js`: usa SHA-256 do token como chave RTDB para evitar path controlado pelo cliente.
- `database.rules.json`: leitura apenas para usuarios autenticados nos caminhos de leitura; escrita publica bloqueada.
- `www/js/firebase.js`: login anonimo para leitura e compartilhamento opt-in; expoe ID token apenas para o registro autenticado.
- `www/js/fcm-native.js`: envia `Authorization: Bearer <Firebase ID token>`.
- `www/js/app.js`: consentimento explicito para geolocalizacao; URLs HTTPS; escaping de conteudo remoto e imagens.
- `config.xml`/`www/index.html`: reduz origins, intents e CSP; remove HTTP generico, `unsafe-eval` e `https:` universal.
- `.gitignore`/`.env.example`: evita adicionar `.env` e service account ao versionamento.

## O que implementar agora

- [ ] Rotacionar a service account se `backend/serviceAccountKey.json`, `.env` ou tokens apareceram em Git, logs, anexos ou backups.
- [ ] Configurar `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_DATABASE_URL`, `HTTP_API_KEY` e `TCP_ALLOWED_IMEIS` no Secret Manager/ambiente de producao.
- [ ] Habilitar Firebase Authentication anonimo e publicar as regras RTDB revisadas; testar leitura e confirmar que qualquer escrita cliente falha.
- [ ] Colocar TCP atras de TLS/VPN/firewall e configurar allowlist de IMEI; nao expor a porta diretamente a internet sem essa camada.
- [ ] Publicar o backend somente em HTTPS e substituir `BACKEND_URL` de desenvolvimento por dominio real permitido.
- [ ] Exibir aviso curto de finalidade, controlador, contato, base legal/consentimento, compartilhamento e revogacao antes do GPS.
- [ ] Definir e publicar retencao: posicao atual sem historico quando possivel; apagar tokens inativos e dados de localizacao no prazo aprovado.
- [ ] Testar no dispositivo: negacao/revogacao de GPS, logout/expiracao do token, notificacao indevida, link `javascript:`, imagem HTTP e escrita RTDB.
- [ ] Remover plugins Cordova duplicados/nao utilizados e declarar somente permissoes necessarias no manifesto Android.
- [ ] Revisar assinatura do app, Privacy Policy/Data Safety e justificativas de permissao para Google Play/App Store antes do release.

## O que revisar depois

- [ ] Trocar handlers inline e `innerHTML` restante por `createElement`, `textContent` e listeners; aplicar Trusted Types quando disponivel.
- [ ] Implementar verificacao de Firebase App Check para reduzir abuso de clientes automatizados.
- [ ] Adicionar testes de autorizacao, rate limit, CORS, limites de payload, SSRF/URL, XSS e regras Firebase em CI.
- [ ] Adicionar correlacao de auditoria sem registrar token, coordenada completa, Authorization header ou dados pessoais em logs.
- [ ] Implementar exclusao/exportacao do titular e fluxo de revogacao; documentar suboperadores e SDKs de terceiros.
- [ ] Fazer threat modeling e teste externo: SQL/NoSQL injection, CSRF, SSRF, path traversal, desserializacao, brute force, upload e endpoints esquecidos.
- [ ] Reduzir precisao/periodicidade da localizacao para a finalidade e avaliar se anuncios/analytics sao realmente necessarios; manter desligados por padrao sem consentimento.

## Criterios de aceite

- Nenhum caminho RTDB sensivel possui `.read: true` ou `.write: true`.
- Toda rota que registra token ou envia notificacao exige autenticacao/autorizacao e tem limite de taxa.
- Coordenadas fora do intervalo, timestamps futuros, IMEI fora da allowlist e mensagens acima do limite sao rejeitados.
- A instalacao nova nao inicia GPS nem compartilha localizacao sem escolha afirmativa.
- Nao existem credenciais Admin em Git, bundle do cliente, logs ou resposta HTTP.
- A politica de privacidade informa finalidade, base legal, retencao, compartilhamentos, direitos e canal de atendimento.
