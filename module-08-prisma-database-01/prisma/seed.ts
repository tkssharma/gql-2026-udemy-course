import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
    },
  });

  // Create posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Getting Started with Prisma',
        content: 'Prisma is a modern database toolkit...',
        published: true,
        authorId: alice.id,
      },
      {
        title: 'GraphQL with Prisma',
        content: 'Combining GraphQL and Prisma...',
        published: true,
        authorId: alice.id,
      },
      {
        title: 'Draft Post',
        content: 'This is a draft...',
        published: false,
        authorId: bob.id,
      },
    ],
  });

  console.log('✅ Seed completed!');
  console.log(`   Created ${await prisma.user.count()} users`);
  console.log(`   Created ${await prisma.post.count()} posts`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
