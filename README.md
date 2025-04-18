# EN: School Library System

A comprehensive web application for managing school libraries, allowing librarians to efficiently track books, students, and loans in an educational environment.

## Features

### User Management
- **Authentication**: Secure login system for librarians and staff
- **Password Recovery**: Password reset functionality for account access
- **Role-Based Access**: Different permission levels for administrators, librarians, and assistants

### Book Management
- **Complete Book Catalog**: Register and maintain detailed book information including title, authors, genres, publisher, and more
- **Book Search**: Advanced filtering capabilities to quickly locate books by title, code, or author
- **Book Inventory**: Track book quantities and location information (shelf, collection)

### Student Management
- **Student Profiles**: Maintain records of all students with their classroom information
- **Student Dashboard**: Individual dashboard for each student showing reading history and statistics
- **Bulk Import/Export**: Easily add multiple students via CSV upload

### Staff Management
- **Staff Profiles**: Register and manage staff members who can borrow books
- **Staff Loans**: Track books borrowed by staff separately from student loans

### Loan System
- **Student Loans**: Process and track book borrowing by students
- **Staff Loans**: Process and track book borrowing by staff
- **Return Management**: Register returned books and maintain history
- **Withdrawal Workflow**: Step-by-step process for book withdrawal with confirmation
- **Late Return Notifications**: Automatic alerts for overdue books

### Analytics and Statistics
- **Dashboard**: Comprehensive dashboard with key metrics and visualizations
- **Reading Trends**: Track reading patterns across different time periods
- **Genre Analysis**: Visualize popularity of different book genres
- **Top Readers**: Identify and showcase the most active student readers
- **Classroom Performance**: Compare reading statistics across different classrooms
- **Reading Completion Rates**: Track how many students complete the books they borrow
- **Export Reports**: Generate and download reports in PDF or Excel format

### Settings and Customization
- **System Settings**: Customize application parameters according to library needs
- **Tag Management**: Create and manage tags for books
- **Author Management**: Maintain a comprehensive list of authors
- **Theme Customization**: Personalize the application appearance and colors

## Installation

### Requirements
- Node.js 16.x or later
- npm 8.x or later
- Windows 10/11 or macOS 12+

### Setup Instructions (Windows)
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/school-library-system.git
   cd school-library-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the necessary Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Build for production:
   ```
   npm run build
   ```

## Project Organization

The project follows a well-structured React architecture:

- **Authentication**: Firebase authentication for user management
- **State Management**: Context API for global state management
- **Routing**: React Router for navigating between different sections
- **Database**: Firebase Firestore for data storage
- **UI Components**: Custom components with CSS modules for styling
- **Analytics**: Chart.js for data visualization
- **Testing**: Jest and React Testing Library for unit and integration tests

## Development

The application is built using:
- React.js v18+ with TypeScript for type safety
- Firebase v9+ for authentication and database
- React Router v6+ for navigation
- Chart.js v4+ for data visualization
- Date-fns v2+ for date manipulation
- Heroicons for iconography
- Tailwind CSS for styling

## Contribution Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Projections

The system will be expanded to include:
- **Student Self-Service Portal**: Allow students to track their own reading progress and statistics
- **Reading Gamification**: Implement rewards and achievements for reading milestones
- **Mobile App**: Develop a companion mobile application for on-the-go access
- **Book Recommendations**: AI-powered book recommendations based on reading history
- **Integration with Learning Management Systems**: Connect with school LMS platforms for seamless data sharing
- **Advanced Analytics**: More detailed insights into reading patterns and educational impact
- **Digital Reading Tracking**: Monitor digital book consumption alongside physical books
- **QR Code Integration**: Generate and print QR codes for physical books to streamline checkout process

---

# PT: Sistema de Biblioteca Escolar

Uma aplicação web abrangente para gerenciamento de bibliotecas escolares, permitindo que bibliotecários rastreiem eficientemente livros, alunos e empréstimos em um ambiente educacional.

## Funcionalidades

### Gestão de Usuários
- **Autenticação**: Sistema de login seguro para bibliotecários e funcionários
- **Recuperação de Senha**: Funcionalidade de redefinição de senha para acesso à conta
- **Acesso Baseado em Funções**: Diferentes níveis de permissão para administradores, bibliotecários e assistentes

### Gestão de Livros
- **Catálogo Completo de Livros**: Registre e mantenha informações detalhadas sobre livros, incluindo título, autores, gêneros, editora e mais
- **Busca de Livros**: Recursos avançados de filtragem para localizar rapidamente livros por título, código ou autor
- **Inventário de Livros**: Acompanhe quantidades de livros e informações de localização (estante, coleção)

### Gestão de Alunos
- **Perfis de Alunos**: Mantenha registros de todos os alunos com suas informações de sala de aula
- **Painel do Aluno**: Painel individual para cada aluno mostrando histórico de leitura e estatísticas
- **Importação/Exportação em Massa**: Adicione facilmente múltiplos alunos via upload de CSV

### Gestão de Funcionários
- **Perfis de Funcionários**: Registre e gerencie funcionários que podem emprestar livros
- **Empréstimos para Funcionários**: Acompanhe livros emprestados por funcionários separadamente dos empréstimos de alunos

### Sistema de Empréstimo
- **Empréstimos para Alunos**: Processe e acompanhe empréstimos de livros por alunos
- **Empréstimos para Funcionários**: Processe e acompanhe empréstimos de livros por funcionários
- **Gestão de Devoluções**: Registre livros devolvidos e mantenha histórico
- **Fluxo de Retirada**: Processo passo a passo para retirada de livros com confirmação
- **Notificações de Atraso**: Alertas automáticos para livros com devolução em atraso

### Análises e Estatísticas
- **Painel**: Painel abrangente com métricas-chave e visualizações
- **Tendências de Leitura**: Acompanhe padrões de leitura em diferentes períodos
- **Análise de Gêneros**: Visualize a popularidade de diferentes gêneros de livros
- **Principais Leitores**: Identifique e destaque os alunos leitores mais ativos
- **Desempenho por Sala**: Compare estatísticas de leitura entre diferentes salas de aula
- **Taxas de Conclusão de Leitura**: Acompanhe quantos alunos concluem os livros que tomam emprestados
- **Exportação de Relatórios**: Gere e baixe relatórios em formato PDF ou Excel

### Configurações e Personalização
- **Configurações do Sistema**: Personalize parâmetros da aplicação de acordo com as necessidades da biblioteca
- **Gestão de Tags**: Crie e gerencie tags para livros
- **Gestão de Autores**: Mantenha uma lista abrangente de autores
- **Personalização de Tema**: Personalize a aparência e as cores da aplicação

## Instalação

### Requisitos
- Node.js 16.x ou posterior
- npm 8.x ou posterior
- Windows 10/11 ou macOS 12+

### Instruções de Configuração (Windows)
1. Clone o repositório:
   ```
   git clone https://github.com/seunome/sistema-biblioteca-escolar.git
   cd sistema-biblioteca-escolar
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` no diretório raiz
   - Adicione a configuração necessária do Firebase:
   ```
   REACT_APP_FIREBASE_API_KEY=sua_chave_api
   REACT_APP_FIREBASE_AUTH_DOMAIN=seu_dominio_auth
   REACT_APP_FIREBASE_PROJECT_ID=seu_id_projeto
   REACT_APP_FIREBASE_STORAGE_BUCKET=seu_bucket_armazenamento
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_id_remetente_mensagens
   REACT_APP_FIREBASE_APP_ID=seu_id_app
   ```

4. Inicie o servidor de desenvolvimento:
   ```
   npm start
   ```

5. Compile para produção:
   ```
   npm run build
   ```

## Organização do Projeto

O projeto segue uma arquitetura React bem estruturada:

- **Autenticação**: Firebase authentication para gestão de usuários
- **Gerenciamento de Estado**: Context API para gerenciamento de estado global
- **Roteamento**: React Router para navegação entre diferentes seções
- **Banco de Dados**: Firebase Firestore para armazenamento de dados
- **Componentes de UI**: Componentes personalizados com módulos CSS para estilização
- **Analytics**: Chart.js para visualização de dados
- **Testes**: Jest e React Testing Library para testes unitários e de integração

## Desenvolvimento

A aplicação é construída usando:
- React.js v18+ com TypeScript para segurança de tipos
- Firebase v9+ para autenticação e banco de dados
- React Router v6+ para navegação
- Chart.js v4+ para visualização de dados
- Date-fns v2+ para manipulação de datas
- Heroicons para iconografia
- Tailwind CSS para estilização

## Diretrizes de Contribuição
1. Faça um fork do repositório
2. Crie uma branch de recurso (`git checkout -b feature/recurso-incrivel`)
3. Confirme suas alterações (`git commit -m 'Adiciona um recurso incrível'`)
4. Envie para a branch (`git push origin feature/recurso-incrivel`)
5. Abra um Pull Request

## Projeções Futuras

O sistema será expandido para incluir:
- **Portal de Autoatendimento para Alunos**: Permitir que os alunos acompanhem seu próprio progresso de leitura e estatísticas
- **Gamificação da Leitura**: Implementar recompensas e conquistas para marcos de leitura
- **Aplicativo Móvel**: Desenvolver um aplicativo móvel complementar para acesso em qualquer lugar
- **Recomendações de Livros**: Recomendações de livros baseadas em IA com base no histórico de leitura
- **Integração com Sistemas de Gestão de Aprendizagem**: Conectar-se com plataformas de LMS escolares para compartilhamento contínuo de dados
- **Analytics Avançados**: Insights mais detalhados sobre padrões de leitura e impacto educacional
- **Rastreamento de Leitura Digital**: Monitorar o consumo de livros digitais junto com livros físicos
- **Integração com QR Code**: Gere e imprima códigos QR para livros físicos para agilizar o processo de empréstimo
