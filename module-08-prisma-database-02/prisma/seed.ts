import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database...');

  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const techCategory = await prisma.category.create({ data: { name: 'Technology' } });
  const devCategory = await prisma.category.create({ data: { name: 'Development' } });

  // Create users with profiles
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'Full-stack developer',
          avatar: 'https://example.com/alice.jpg',
        },
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      role: 'USER',
      profile: {
        create: {
          bio: 'Backend engineer',
        },
      },
    },
  });

  // Create posts with PostgreSQL-specific features
  await prisma.post.create({
    data: {
      title: 'Getting Started with PostgreSQL',
      content: 'PostgreSQL is a powerful database...',
      published: true,
      authorId: alice.id,
      tags: ['postgresql', 'database', 'prisma'],  // Array type
      metadata: { views: 100, likes: 25 },         // JSON type
      categories: { connect: [{ id: techCategory.id }, { id: devCategory.id }] },
    },
  });

  await prisma.post.create({
    data: {
      title: 'Prisma with GraphQL',
      content: 'Combining Prisma and GraphQL...',
      published: true,
      authorId: alice.id,
      tags: ['prisma', 'graphql'],
      metadata: { views: 50, likes: 10 },
      categories: { connect: [{ id: devCategory.id }] },
    },
  });

  await prisma.post.create({
    data: {
      title: 'Draft Post',
      content: 'Work in progress...',
      published: false,
      authorId: bob.id,
      tags: ['draft'],
    },
  });

  console.log('✅ Seed completed!');
  console.log(`   Created ${await prisma.user.count()} users`);
  console.log(`   Created ${await prisma.post.count()} posts`);
  console.log(`   Created ${await prisma.category.count()} categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
