import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

export async function startDB() {
    console.log('Connect to database...');
    await db.$connect();
}