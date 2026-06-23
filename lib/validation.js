import { ObjectId } from "mongodb";

export function isValidObjectId(id) {
  if (!id || typeof id !== "string") {
    return false;
  }
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}
