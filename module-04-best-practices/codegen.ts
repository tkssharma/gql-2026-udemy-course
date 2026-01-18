import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema/typeDefs.ts',
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../context/index.js#Context',
        useTypeImports: true,
        enumsAsTypes: true,
        maybeValue: 'T | null',
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
