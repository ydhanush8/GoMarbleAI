import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { createOrGetUser } from './user.service';

/**
 * Create a new workspace for a user
 */
export async function createWorkspace(userId: string, name: string) {
  // Ensure user exists in our database (sync from Clerk if needed)
  const user = await createOrGetUser(userId);

  // Create workspace and associate user as owner
  const workspace = await prisma.workspace.create({
    data: {
      name,
      users: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });

  return workspace;
}

/**
 * Get all workspaces for a user
 */
export async function getUserWorkspaces(userId: string) {
  // Ensure user exists
  await createOrGetUser(userId);

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      workspaces: {
        include: {
          workspace: {
            include: {
              integrations: {
                select: {
                  id: true,
                  platform: true,
                  accountName: true,
                  isActive: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found after sync', 404);
  }

  return user.workspaces.map((wu: any) => ({
    id: wu.workspace.id,
    name: wu.workspace.name,
    role: wu.role,
    integrations: wu.workspace.integrations,
    createdAt: wu.workspace.createdAt,
  }));
}

/**
 * Get a specific workspace by ID (with access check)
 */
export async function getWorkspace(workspaceId: string, userId: string) {
  // Ensure user exists
  const user = await createOrGetUser(userId);

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      users: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
      integrations: {
        select: {
          id: true,
          platform: true,
          accountId: true,
          accountName: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new AppError('Workspace not found or access denied', 404);
  }

  return workspace;
}

/**
 * Update workspace name
 */
export async function updateWorkspace(workspaceId: string, userId: string, name: string) {
  // Ensure user exists
  const user = await createOrGetUser(userId);

  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: {
      workspaceId,
      userId: user.id,
      role: { in: ['owner', 'admin'] },
    },
  });

  if (!workspaceUser) {
    throw new AppError('Insufficient permissions', 403);
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name },
  });

  return workspace;
}
