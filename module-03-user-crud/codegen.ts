// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Where to find your schema
  schema: './src/schema/typeDefs.ts',

  // Output configuration
  generates: {
    // Output file path
    './src/generated/graphql.ts': {
      // Plugins to use
      plugins: [
        'typescript', // Generate base types
        'typescript-resolvers', // Generate resolver types
      ],

      // Plugin configuration
      config: {
        // Use your context type
        contextType: '../context/index.js#Context',

        // Map custom scalars
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },

        // Make fields optional in resolvers (recommended)
        makeResolverTypeCallable: true,

        // Use type imports
        useTypeImports: true,
      },
    },
  },
};

export default config;