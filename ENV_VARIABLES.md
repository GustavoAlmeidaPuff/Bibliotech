# 📋 Variáveis de Ambiente - Bibliotech

Este documento descreve todas as variáveis de ambiente utilizadas no projeto.

## 🔧 Como Configurar

1. **Crie um arquivo `.env.local`** na raiz do projeto
2. **Adicione as variáveis** conforme necessário
3. **Reinicie o servidor de desenvolvimento** após alterar variáveis

```bash
# Exemplo de .env.local
REACT_APP_GUEST_LOGIN_ENABLED=true
REACT_APP_GUEST_EMAIL=bibliotech.convidado@gmail.com
REACT_APP_GUEST_PASSWORD=convidado123
```

## 🔒 Segurança

- ⚠️ **NUNCA** commite o arquivo `.env.local` no Git
- ✅ O arquivo `.env.local` já está no `.gitignore`
- ✅ Use `.env.local` para desenvolvimento local
- ✅ Use variáveis de ambiente do servidor para produção

## 📝 Variáveis Disponíveis

### Login de Convidado (Opcional)

| Variável | Descrição | Tipo | Obrigatória | Padrão |
|----------|-----------|------|-------------|--------|
| `REACT_APP_GUEST_LOGIN_ENABLED` | Habilita/desabilita login de convidado | `string` ("true"/"false") | Não | `false` |
| `REACT_APP_GUEST_EMAIL` | Email do usuário convidado | `string` | Sim* | `""` |
| `REACT_APP_GUEST_PASSWORD` | Senha do usuário convidado | `string` | Sim* | `""` |

\* Obrigatória apenas se `REACT_APP_GUEST_LOGIN_ENABLED=true`

## 💡 Exemplos de Uso

### Desabilitar Login de Convidado

```env
REACT_APP_GUEST_LOGIN_ENABLED=false
```

Ou simplesmente não defina as variáveis de email e senha.

### Habilitar Login de Convidado

```env
REACT_APP_GUEST_LOGIN_ENABLED=true
REACT_APP_GUEST_EMAIL=seu.email.convidado@gmail.com
REACT_APP_GUEST_PASSWORD=sua_senha_segura
```

## 🚀 Produção

Para produção, defina as variáveis de ambiente diretamente no servidor/hosting:

- **Vercel**: Vá em Settings > Environment Variables
- **Netlify**: Vá em Site Settings > Environment Variables
- **Outros**: Consulte a documentação da plataforma

## ⚙️ Como Funciona

O sistema verifica as variáveis de ambiente no momento da compilação (build time). 

- Variáveis devem começar com `REACT_APP_` para serem expostas ao código React
- Após alterar variáveis, é necessário **reiniciar o servidor de desenvolvimento**
- Variáveis são inseridas no código durante o build

## 🔍 Verificação

Se o login de convidado não estiver aparecendo:

1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Verifique se as variáveis estão escritas corretamente
3. Verifique se `REACT_APP_GUEST_LOGIN_ENABLED=true`
4. Verifique se `REACT_APP_GUEST_EMAIL` e `REACT_APP_GUEST_PASSWORD` estão definidas
5. Reinicie o servidor de desenvolvimento (`npm start`)

## 📚 Referências

- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Firebase Setup Guide](./src/config/FIREBASE_SETUP.md)

