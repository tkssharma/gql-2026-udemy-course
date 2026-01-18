# 2. Project Setup

A step-by-step guide to setting up a GraphQL Yoga project with TypeScript.

---

## Prerequisites

Before starting, ensure you have the following installed:

### Node.js (v18 or higher)

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
```

**Installation options:**

- [Official installer](https://nodejs.org/)
- Using nvm (recommended):

  ```bash
  # Install nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

  # Install latest LTS
  nvm install --lts
  nvm use --lts
  ```

### Package Manager

Choose one (npm comes with Node.js):

| Manager | Install Command       |
| ------- | --------------------- |
| npm     | Included with Node.js |
| yarn    | `npm install -g yarn` |
| pnpm    | `npm install -g pnpm` |

### Code Editor

Recommended: **VS Code** with extensions:

- ESLint
- Prettier
- GraphQL (GraphQL Foundation)
- TypeScript Importer

---

## Step 1: Create Project Directory

```bash
# Create and navigate to project folder
mkdir graphql-yoga-api
cd graphql-yoga-api
```

---

## Step 2: Initialize Node.js Project

```bash
# Initialize with default settings
npm init -y
```

This creates `package.json`:

```json
{
  "name": "graphql-yoga-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

---

## Step 3: Install Dependencies

### Production Dependencies

```bash
npm install graphql-yoga graphql
```

| Package        | Description                       |
| -------------- | --------------------------------- |
| `graphql-yoga` | The GraphQL server                |
| `graphql`      | GraphQL JavaScript implementation |

### Development Dependencies

```bash
npm install -D typescript @types/node tsx
```

| Package       | Description                                |
| ------------- | ------------------------------------------ |
| `typescript`  | TypeScript compiler                        |
| `@types/node` | Node.js type definitions                   |
| `tsx`         | TypeScript execution (faster than ts-node) |

### Optional: Additional Tools

```bash
# For code quality
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# For environment variables
npm install dotenv

# For automatic type generation (optional)
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers
```

---

## Step 4: Configure TypeScript

Create `tsconfig.json` in the project root:

```bash
npx tsc --init
```

Replace the contents with this optimized configuration:

```json
{
  "compilerOptions": {
    // Language & Environment
    "target": "ES2022",
    "lib": ["ES2022"],

    // Modules
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,

    // Emit
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Type Checking (Strict)
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,

    // Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // Completeness
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Key Options Explained

| Option             | Purpose                       |
| ------------------ | ----------------------------- |
| `target: ES2022`   | Modern JavaScript features    |
| `module: NodeNext` | Native ES modules support     |
| `strict: true`     | Enable all strict type checks |
| `outDir: ./dist`   | Compiled JS output directory  |
| `rootDir: ./src`   | Source files directory        |

---

## Step 5: Update package.json

Update your `package.json` with proper configuration:

```json
{
  "name": "graphql-yoga-api",
  "version": "1.0.0",
  "description": "GraphQL API with Yoga and TypeScript",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  },
  "keywords": ["graphql", "yoga", "typescript", "api"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "graphql": "^16.8.1",
    "graphql-yoga": "^5.1.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Scripts Explained

| Script      | Command             | Purpose                          |
| ----------- | ------------------- | -------------------------------- |
| `dev`       | `npm run dev`       | Start dev server with hot reload |
| `build`     | `npm run build`     | Compile TypeScript to JavaScript |
| `start`     | `npm start`         | Run compiled production server   |
| `typecheck` | `npm run typecheck` | Check types without emitting     |

---

## Step 6: Create Project Structure

```bash
# Create directories
mkdir -p src/schema
mkdir -p src/types
mkdir -p src/resolvers
mkdir -p src/context
mkdir -p src/utils
```

### Final Project Structure

```
graphql-yoga-api/
├── src/
│   ├── index.ts              # Server entry point
│   ├── schema/
│   │   ├── index.ts          # Schema composition
│   │   └── typeDefs.ts       # GraphQL type definitions
│   ├── resolvers/
│   │   ├── index.ts          # Resolver composition
│   │   ├── Query.ts          # Query resolvers
│   │   └── Mutation.ts       # Mutation resolvers
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── context/
│   │   └── index.ts          # Context factory
│   └── utils/
│       └── index.ts          # Utility functions
├── dist/                      # Compiled output (git ignored)
├── node_modules/              # Dependencies (git ignored)
├── .env                       # Environment variables (git ignored)
├── .env.example               # Example env file
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## Step 7: Create Initial Files

### src/index.ts (Entry Point)

```typescript
import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema/index.js';

// Create Yoga instance
const yoga = createYoga({
  schema,
  graphiql: {
    title: 'GraphQL Yoga API',
  },
});

// Create HTTP server
const server = createServer(yoga);

// Get port from environment or default
const PORT = process.env.PORT || 4000;

// Start server
server.listen(PORT, () => {
  console.log(`🧘 Server is running on http://localhost:${PORT}/graphql`);
});
```

### src/schema/typeDefs.ts

```typescript
export const typeDefs = /* GraphQL */ `
  type Query {
    hello: String!
    greeting(name: String!): String!
  }
`;
```

### src/schema/index.ts

```typescript
import { createSchema } from 'graphql-yoga';
import { typeDefs } from './typeDefs.js';
import { resolvers } from '../resolvers/index.js';

export const schema = createSchema({
  typeDefs,
  resolvers,
});
```

### src/resolvers/Query.ts

```typescript
export const Query = {
  hello: () => 'Hello, World!',
  greeting: (_: unknown, args: { name: string }) => `Hello, ${args.name}!`,
};
```

### src/resolvers/index.ts

```typescript
import { Query } from './Query.js';

export const resolvers = {
  Query,
};
```

### src/types/index.ts

```typescript
// Add your TypeScript interfaces here
export interface User {
  id: string;
  name: string;
  email: string;
}
```

---

## Step 8: Create Configuration Files

### .gitignore

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Test coverage
coverage/
```

### .env.example

```env
# Server
PORT=4000
NODE_ENV=development

# Database (for future use)
DATABASE_URL=

# Auth (for future use)
JWT_SECRET=
```

### .env

```env
PORT=4000
NODE_ENV=development
```

---

## Step 9: Run the Server

### Development Mode (with hot reload)

```bash
npm run dev
```

You should see:

```
🧘 Server is running on http://localhost:4000/graphql
```

### Test in Browser

1. Open `http://localhost:4000/graphql`
2. You'll see the GraphiQL playground
3. Run this query:

```graphql
query {
  hello
  greeting(name: "GraphQL Yoga")
}
```

4. Expected response:

```json
{
  "data": {
    "hello": "Hello, World!",
    "greeting": "Hello, GraphQL Yoga!"
  }
}
```

---

## Step 10: Build for Production

```bash
# Type check
npm run typecheck

# Build
npm run build

# Run production server
npm start
```

---

## Troubleshooting

### Common Issues

#### 1. Module Resolution Errors

**Error:** `Cannot find module './schema/index.js'`

**Solution:** Ensure you're using `.js` extension in imports (required for ES modules):

```typescript
// ✅ Correct
import { schema } from './schema/index.js';

// ❌ Wrong
import { schema } from './schema/index';
```

#### 2. Type Errors

**Error:** `Cannot find type definitions`

**Solution:** Ensure `@types/node` is installed:

```bash
npm install -D @types/node
```

#### 3. Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:** Kill the process or use a different port:

```bash
# Find process using port 4000
lsof -i :4000

# Kill it
kill -9 <PID>

# Or use different port
PORT=4001 npm run dev
```

#### 4. ESM/CommonJS Issues

**Error:** `require is not defined in ES module scope`

**Solution:** Ensure `"type": "module"` is in `package.json` and use `import` syntax.

---

## Summary

| Step | Action                      |
| ---- | --------------------------- |
| 1    | Create project directory    |
| 2    | Initialize npm project      |
| 3    | Install dependencies        |
| 4    | Configure TypeScript        |
| 5    | Update package.json scripts |
| 6    | Create folder structure     |
| 7    | Create initial source files |
| 8    | Add configuration files     |
| 9    | Run development server      |
| 10   | Build for production        |

---

## Next: [3. Your First GraphQL Server →](./first-server.md)
