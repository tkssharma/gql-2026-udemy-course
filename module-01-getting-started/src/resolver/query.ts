export const Query = {
  hello: () => 'Hello, World!',
  greeting: (_: unknown, args: { name: string }) => `Hello, ${args.name}!`,
  sayHi: (_: unknown, args: { mesage: string }) => `Hi, ${args.mesage}!`,
};