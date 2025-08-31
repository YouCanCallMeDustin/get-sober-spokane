# Sober Spokane

A comprehensive web application providing resources and support for the sober community in Spokane, Washington.

## 🏗️ Project Structure

```
sober-spokane/
├── 📁 database/                 # Database-related files
│   ├── 📁 migrations/          # Database migration scripts
│   ├── 📁 schemas/             # Database schema definitions
│   ├── 📁 seeds/               # Database seed data
│   ├── 📁 sql-scripts/         # SQL scripts and queries
│   ├── 📁 tests/               # Database test scripts
│   └── 📁 scripts/             # Database utility scripts
├── 📁 docs/                    # Static documentation and assets
│   ├── 📁 api/                 # API documentation
│   ├── 📁 assets/              # Static assets (images, videos)
│   ├── 📁 auth/                # Authentication pages
│   ├── 📁 components/          # Reusable HTML components
│   ├── 📁 css/                 # Compiled CSS files
│   ├── 📁 js/                  # Client-side JavaScript
│   └── 📁 user/                # User-related pages
├── 📁 src/                     # Source code
│   ├── 📁 admin/               # Admin panel source
│   ├── 📁 api/                 # API source code
│   ├── 📁 assets/              # Source assets
│   ├── 📁 js/                  # Source JavaScript
│   ├── 📁 pug/                 # Pug templates
│   ├── 📁 scss/                # SCSS source files
│   └── 📁 shared/              # Shared utilities
├── 📁 tests/                   # Test files
│   ├── 📁 unit/                # Unit tests
│   ├── 📁 integration/         # Integration tests
│   └── 📁 e2e/                 # End-to-end tests
├── 📁 routes/                  # Express.js routes
├── 📁 controllers/             # Express.js controllers
├── 📁 middleware/              # Express.js middleware
├── 📁 scripts/                 # Build and utility scripts
├── 📁 infrastructure/          # Deployment and infrastructure
├── 📁 monitoring/              # Monitoring and logging
└── 📁 docs/                    # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sober-spokane
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Run the development server:
   ```bash
   npm run start:debug
   ```

## 📝 Available Scripts

- `npm start` - Build and start the application
- `npm run start:debug` - Start with debug logging
- `npm run start:prod` - Start production server
- `npm run build` - Build all assets
- `npm run build:full` - Build with SEO optimization
- `npm run seo:optimize` - Run SEO optimization

## 🗄️ Database

The application uses Supabase as the backend database. Database-related files are organized in the `database/` directory:

- **Migrations**: Database schema changes
- **Schemas**: Table and view definitions
- **Seeds**: Initial data population
- **SQL Scripts**: Utility queries and maintenance scripts
- **Tests**: Database testing scripts

## 🧪 Testing

Tests are organized in the `tests/` directory:

- **Unit Tests**: Individual component testing
- **Integration Tests**: API and database integration testing
- **E2E Tests**: Full application workflow testing

Run tests with:
```bash
npm test
```

## 📚 Documentation

- [Authentication Setup](./AUTHENTICATION-SETUP.md)
- [Database Troubleshooting](./DATABASE-TROUBLESHOOTING.md)
- [Community Forum](./COMMUNITY-FORUM-README.md)
- [SEO Optimization Guide](./SEO-OPTIMIZATION-GUIDE.md)
- [Supabase Setup](./SUPABASE-SETUP.md)
- [Google OAuth Setup](./GOOGLE-OAUTH-SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please refer to the documentation or create an issue in the repository.
