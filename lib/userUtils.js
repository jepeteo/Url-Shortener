import clientPromise from "./mongodb";

export async function findUserByEmail(email) {
  const client = await clientPromise;
  const db = client.db();
  return db.collection("users").findOne({ email });
}

export async function createNewUser(userData) {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection("users").insertOne(userData);
  return result.insertedId;
}
