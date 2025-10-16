import prisma from '../utils/prisma';

// Run before all tests
beforeAll(async () => {
  // Optional: seed test data or setup
});

// Run after all tests
afterAll(async () => {
  // Clean up and disconnect
  await prisma.$disconnect();
});
