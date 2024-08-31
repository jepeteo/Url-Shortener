import { redirect } from "next/navigation";
import clientPromise from "../../lib/mongodb";

export default async function ShortUrlRedirect({ params }) {
  const { shortCode } = params;

  const client = await clientPromise;
  const db = client.db("urlShortener");

  const urlEntry = await db
    .collection("urls")
    .findOneAndUpdate(
      { shortCode },
      { $inc: { visits: 1 } },
      { returnDocument: "after" }
    );

  if (urlEntry.value) {
    redirect(urlEntry.value.originalUrl);
  } else {
    redirect("/");
  }
}
