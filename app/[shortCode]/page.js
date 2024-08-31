import { redirect } from 'next/navigation'
import clientPromise from '../../lib/mongodb'

export default async function ShortUrlRedirect({ params }) {
  const { shortCode } = params

  const client = await clientPromise
  const db = client.db("urlShortener")

  const urlEntry = await db.collection("urls").findOne({ shortCode })

  if (urlEntry) {
    redirect(urlEntry.originalUrl)
  } else {
    redirect('/')  // Redirect to home page if URL not found
  }
}
