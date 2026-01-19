import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
  });

  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: 'user',
    },
  });

  console.log('✅ Created users:', { admin: admin.id, john: john.id, jane: jane.id });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with GraphQL',
      content: 'GraphQL is a query language for APIs that allows clients to request exactly the data they need. In this post, we will explore the basics of GraphQL and how to set up a GraphQL server.',
      published: true,
      authorId: john.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Prisma with GraphQL Yoga',
      content: 'Prisma is a modern database toolkit that makes it easy to work with databases. Combined with GraphQL Yoga, you can build powerful and type-safe APIs.',
      published: true,
      authorId: john.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Understanding Context in GraphQL',
      content: 'Context is a powerful feature in GraphQL that allows you to share data across all resolvers. Learn how to use context for database connections and authentication.',
      published: true,
      authorId: jane.id,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: 'Draft: Advanced Prisma Techniques',
      content: 'This is a draft post about advanced Prisma techniques including transactions, raw queries, and performance optimization.',
      published: false,
      authorId: jane.id,
    },
  });

  console.log('✅ Created posts:', { post1: post1.id, post2: post2.id, post3: post3.id, post4: post4.id });

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'Great introduction to GraphQL!',
        authorId: jane.id,
        postId: post1.id,
      },
      {
        content: 'Very helpful, thanks for sharing!',
        authorId: admin.id,
        postId: post1.id,
      },
      {
        content: 'Prisma makes database work so much easier.',
        authorId: john.id,
        postId: post2.id,
      },
      {
        content: 'Context is indeed very powerful!',
        authorId: john.id,
        postId: post3.id,
      },
    ],
  });

  console.log('✅ Created comments');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
