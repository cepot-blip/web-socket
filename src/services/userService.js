import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserByPhone = async (phone) => {
  return prisma.chatUser.findUnique({ where: { phone } });
};

export const createUser = async (data) => {
  return prisma.chatUser.create({ data });
};
