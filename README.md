# Vibecode DB

Unified front-end DB API with pluggable adapters (Runtime, Supabase, ...).

## Features

- 🔌 **Pluggable Adapters**: Support for multiple database backends
- 🚀 **Runtime Agnostic**: Works in Web, Expo, and other environments
- 🔐 **Built-in Authentication**: See [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md)
- 📦 **Monorepo Structure**: Individual packages for different adapters

## Packages

- `@vibecode-db/client` - Main client library
- `@vibecode-db/sqlite-core` - SQLite core functionality
- `@vibecode-db/sqlite-web` - SQLite adapter for web
- `@vibecode-db/sqlite-expo` - SQLite adapter for Expo

## Installation

```bash
npm install @vibecode-db/client
# or
yarn add @vibecode-db/client
```

## Quick Start

```javascript
// Coming soon - check the examples directory
```

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

## Documentation

For detailed authentication implementation, see [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md).

## About Vibecode DB

Built by [GeekyAnts](https://geekyants.com?utm_source=github&utm_medium=opensource&utm_campaign=vibecode-db), experts in
[AI Engineering](https://geekyants.com/ai?utm_source=github&utm_medium=opensource&utm_campaign=vibecode-db) and
[full stack development](https://geekyants.com/service/full-stack-app-development-services?utm_source=github&utm_medium=opensource&utm_campaign=vibecode-db).

[Try Vibecode DB](https://vibecode-db.geekyants.com?utm_source=github&utm_medium=opensource&utm_campaign=vibecode-db) |
[Contact us](https://geekyants.com/hire?utm_source=github&utm_medium=opensource&utm_campaign=vibecode-db)

## License

MIT
