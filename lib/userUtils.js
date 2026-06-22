import clientPromise from "./mongodb";

const DB_NAME = "urlShortener";

export async function findUserByEmail(email) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection("users").findOne({ email: email.toLowerCase().trim() });
}

export async function createNewUser(userData) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection("users").insertOne({
    ...userData,
    plan: "free",
    createdAt: new Date(),
  });
}
