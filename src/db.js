import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({ errorFormat: "pretty" });

export default db;
