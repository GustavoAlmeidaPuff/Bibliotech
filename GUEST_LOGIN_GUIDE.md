# Guia do Login de Convidado - Bibliotech

Este documento explica como habilitar/desabilitar e configurar o sistema de login de convidado para demonstrações e pitches.

## 📋 Resumo

O sistema de login de convidado permite que visitantes acessem o sistema automaticamente clicando em um único botão, sem precisar inserir credenciais manualmente. É ideal para:

- Demonstrações do sistema
- Pitches para clientes
- Apresentações rápidas
- Acesso simplificado em eventos

## ⚙️ Como Habilitar/Desabilitar

### Desabilitar o Login de Convidado

No arquivo `src/pages/auth/Login.tsx`, altere a linha 12:

```typescript
// Desabilitar
const GUEST_LOGIN_ENABLED = false;
```

### Habilitar o Login de Convidado

```typescript
// Habilitar
const GUEST_LOGIN_ENABLED = true;
```

## 🔧 Configuração das Credenciais

As credenciais padrão estão definidas no mesmo arquivo (`src/pages/auth/Login.tsx`):

```typescript
const GUEST_CREDENTIALS = {
  email: 'bibliotech.convidado@gmail.com',
  password: 'convidado123'
};
```

### Para Alterar as Credenciais:

1. Abra `src/pages/auth/Login.tsx`
2. Localize as linhas 13-16
3. Modifique o email e/ou senha conforme necessário
4. Salve o arquivo

## 🎨 Personalização da Interface

### Botão da Página Inicial (Recomendado)
**Texto do botão** (linha 2159 em `src/pages/Home.tsx`):
```typescript
{isGuestLoading ? 'Entrando...' : 'Acesso Demo'}
```

**Ícone do botão** (linha 2158):
```typescript
<GuestLoginIcon>🚀</GuestLoginIcon>
```

**Estilos**: Modificar o componente `GuestLoginButton` (linhas 252-315)

### Botão da Tela de Login
**Texto do botão** (linha 154 em `src/pages/auth/Login.tsx`):
```typescript
{isLoading ? 'Entrando...' : 'Login de Convidado'}
```

**Texto de descrição** (linha 157):
```typescript
Acesso rápido para demonstração
```

**Estilos CSS**: Arquivo `src/pages/auth/Login.module.css` nas classes:
- `.guestLogin` - Container principal
- `.guestLoginButton` - Botão de login
- `.guestLoginText` - Texto explicativo

## 🚀 Como Funciona

### Página Inicial (Recomendado para Pitches)
1. **Usuário acessa a página inicial**
2. **Ve o botão "Acesso Demo"** logo abaixo do título de boas-vindas
3. **Clica no botão chamativo**
4. **Sistema faz login automaticamente** com as credenciais pré-definidas
5. **Usuário é redirecionado** para o dashboard

### Tela de Login (Alternativa)
1. **Usuário acessa a tela de login**
2. **Ve o botão "Login de Convidado"** (se habilitado)
3. **Clica no botão**
4. **Sistema faz login automaticamente** com as credenciais pré-definidas
5. **Usuário é redirecionado** para o dashboard

## ⚠️ Considerações de Segurança

- **NUNCA deixe esta funcionalidade habilitada em produção**
- **Use apenas para demonstrações**
- **Certifique-se de que a conta de convidado tem permissões limitadas**
- **Desabilite imediatamente após a demonstração**

## 📁 Arquivos Modificados

Para remover completamente a funcionalidade:

### 1. Página Inicial (`src/pages/Home.tsx`)
   - **Constantes** (linhas 245-250): `GUEST_LOGIN_ENABLED` e `GUEST_CREDENTIALS`
   - **Estilos** (linhas 252-325): `GuestLoginButton` e `GuestLoginIcon`
   - **Hooks** (linhas 1736-1738): `useNavigate`, `useAuth`, `useAsync`
   - **Função** (linhas 1784-1792): `handleGuestLogin`
   - **JSX** (linhas 2147-2162): Botão de acesso demo

### 2. Tela de Login (`src/pages/auth/Login.tsx`)
   - **Constantes** (linhas 11-16): `GUEST_LOGIN_ENABLED` e `GUEST_CREDENTIALS`
   - **Função** (linhas 73-80): `handleGuestLogin`
   - **JSX** (linhas 146-160): Botão de login de convidado

### 3. Estilos do Login (`src/pages/auth/Login.module.css`)
   - **Estilos** (linhas 146-180): `.guestLogin`, `.guestLoginButton`, `.guestLoginText`

## 🔄 Deploy Rápido

Após alterar a configuração:

```bash
npm run build
# ou
npm start
```

## 📞 Suporte

Para dúvidas sobre esta funcionalidade, contate o desenvolvedor.

---

**⚡ Dica:** Mantenha este arquivo como referência para ativar/desativar rapidamente quando necessário!
'