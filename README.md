# School Library System

A comprehensive web application for managing school libraries, allowing librarians to efficiently track books, students, and loans in an educational environment.

## Features

### User Management
- **Authentication**: Secure login system for librarians and staff
- **Password Recovery**: Password reset functionality for account access

### Book Management
- **Complete Book Catalog**: Register and maintain detailed book information including title, authors, genres, publisher, and more
- **Book Search**: Advanced filtering capabilities to quickly locate books by title, code, or author
- **Book Inventory**: Track book quantities and location information (shelf, collection)

### Student Management
- **Student Profiles**: Maintain records of all students with their classroom information
- **Student Dashboard**: Individual dashboard for each student showing reading history and statistics

### Staff Management
- **Staff Profiles**: Register and manage staff members who can borrow books
- **Staff Loans**: Track books borrowed by staff separately from student loans

### Loan System
- **Student Loans**: Process and track book borrowing by students
- **Staff Loans**: Process and track book borrowing by staff
- **Return Management**: Register returned books and maintain history
- **Withdrawal Workflow**: Step-by-step process for book withdrawal with confirmation

### Analytics and Statistics
- **Dashboard**: Comprehensive dashboard with key metrics and visualizations
- **Reading Trends**: Track reading patterns across different time periods
- **Genre Analysis**: Visualize popularity of different book genres
- **Top Readers**: Identify and showcase the most active student readers
- **Classroom Performance**: Compare reading statistics across different classrooms
- **Reading Completion Rates**: Track how many students complete the books they borrow

### Settings and Customization
- **System Settings**: Customize application parameters according to library needs
- **Tag Management**: Create and manage tags for books
- **Author Management**: Maintain a comprehensive list of authors

## Project Organization

The project follows a well-structured React architecture:

- **Authentication**: Firebase authentication for user management
- **State Management**: Context API for global state management
- **Routing**: React Router for navigating between different sections
- **Database**: Firebase Firestore for data storage
- **UI Components**: Custom components with CSS modules for styling
- **Analytics**: Chart.js for data visualization

## Development

The application is built using:
- React.js with TypeScript for type safety
- Firebase for authentication and database
- React Router for navigation
- Chart.js for data visualization
- Date-fns for date manipulation
- Heroicons for iconography

## Future Projections

The system will be expanded to include:
- **Student Self-Service Portal**: Allow students to track their own reading progress and statistics
- **Reading Gamification**: Implement rewards and achievements for reading milestones
- **Mobile App**: Develop a companion mobile application for on-the-go access
- **Book Recommendations**: AI-powered book recommendations based on reading history
- **Integration with Learning Management Systems**: Connect with school LMS platforms for seamless data sharing
- **Advanced Analytics**: More detailed insights into reading patterns and educational impact
- **Digital Reading Tracking**: Monitor digital book consumption alongside physical books

---

# Sistema de Biblioteca Escolar

Uma aplicação web abrangente para gerenciamento de bibliotecas escolares, permitindo que bibliotecários rastreiem eficientemente livros, alunos e empréstimos em um ambiente educacional.

## Funcionalidades

### Gestão de Usuários
- **Autenticação**: Sistema de login seguro para bibliotecários e funcionários
- **Recuperação de Senha**: Funcionalidade de redefinição de senha para acesso à conta

### Gestão de Livros
- **Catálogo Completo de Livros**: Registre e mantenha informações detalhadas sobre livros, incluindo título, autores, gêneros, editora e mais
- **Busca de Livros**: Recursos avançados de filtragem para localizar rapidamente livros por título, código ou autor
- **Inventário de Livros**: Acompanhe quantidades de livros e informações de localização (estante, coleção)

### Gestão de Alunos
- **Perfis de Alunos**: Mantenha registros de todos os alunos com suas informações de sala de aula
- **Painel do Aluno**: Painel individual para cada aluno mostrando histórico de leitura e estatísticas

### Gestão de Funcionários
- **Perfis de Funcionários**: Registre e gerencie funcionários que podem emprestar livros
- **Empréstimos para Funcionários**: Acompanhe livros emprestados por funcionários separadamente dos empréstimos de alunos

### Sistema de Empréstimo
- **Empréstimos para Alunos**: Processe e acompanhe empréstimos de livros por alunos
- **Empréstimos para Funcionários**: Processe e acompanhe empréstimos de livros por funcionários
- **Gestão de Devoluções**: Registre livros devolvidos e mantenha histórico
- **Fluxo de Retirada**: Processo passo a passo para retirada de livros com confirmação

### Análises e Estatísticas
- **Painel**: Painel abrangente com métricas-chave e visualizações
- **Tendências de Leitura**: Acompanhe padrões de leitura em diferentes períodos
- **Análise de Gêneros**: Visualize a popularidade de diferentes gêneros de livros
- **Principais Leitores**: Identifique e destaque os alunos leitores mais ativos
- **Desempenho por Sala**: Compare estatísticas de leitura entre diferentes salas de aula
- **Taxas de Conclusão de Leitura**: Acompanhe quantos alunos concluem os livros que tomam emprestados

### Configurações e Personalização
- **Configurações do Sistema**: Personalize parâmetros da aplicação de acordo com as necessidades da biblioteca
- **Gestão de Tags**: Crie e gerencie tags para livros
- **Gestão de Autores**: Mantenha uma lista abrangente de autores

## Organização do Projeto

O projeto segue uma arquitetura React bem estruturada:

- **Autenticação**: Firebase authentication para gestão de usuários
- **Gerenciamento de Estado**: Context API para gerenciamento de estado global
- **Roteamento**: React Router para navegação entre diferentes seções
- **Banco de Dados**: Firebase Firestore para armazenamento de dados
- **Componentes de UI**: Componentes personalizados com módulos CSS para estilização
- **Analytics**: Chart.js para visualização de dados

## Desenvolvimento

A aplicação é construída usando:
- React.js com TypeScript para segurança de tipos
- Firebase para autenticação e banco de dados
- React Router para navegação
- Chart.js para visualização de dados
- Date-fns para manipulação de datas
- Heroicons para iconografia

## Projeções Futuras

O sistema será expandido para incluir:
- **Portal de Autoatendimento para Alunos**: Permitir que os alunos acompanhem seu próprio progresso de leitura e estatísticas
- **Gamificação da Leitura**: Implementar recompensas e conquistas para marcos de leitura
- **Aplicativo Móvel**: Desenvolver um aplicativo móvel complementar para acesso em qualquer lugar
- **Recomendações de Livros**: Recomendações de livros baseadas em IA com base no histórico de leitura
- **Integração com Sistemas de Gestão de Aprendizagem**: Conectar-se com plataformas de LMS escolares para compartilhamento contínuo de dados
- **Analytics Avançados**: Insights mais detalhados sobre padrões de leitura e impacto educacional
- **Rastreamento de Leitura Digital**: Monitorar o consumo de livros digitais junto com livros físicos
