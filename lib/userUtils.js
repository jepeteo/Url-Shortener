import { eq } from "drizzle-orm";
import { getDb, users } from "./db";

export async function findUserByEmail(email) {
  const db = getDb();
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });
}

export async function createNewUser(userData) {
  const db = getDb();
  const [user] = await db
    .insert(users)
    .values({
      ...userData,
      plan: "free",
    })
    .returning({ id: users.id });
  return user;
}
