import prisma from '../config/database';
import { clerkClient } from '../config/clerk';

/**
 * Create or get user from database using Clerk ID
 */
export async function createOrGetUser(clerkId: string) {
  // Get user data from Clerk
  const clerkUser = await clerkClient.users.getUser(clerkId);

  // Check if user exists in our database
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  // Create user if doesn't exist
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        imageUrl: clerkUser.imageUrl || null,
      },
    });
  }

  return user;
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      workspaces: {
        include: {
          workspace: true,
        },
      },
    },
  });
}
