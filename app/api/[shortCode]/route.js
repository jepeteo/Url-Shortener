import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET(request, { params }) {
  const { shortCode } = params

  const client = await clientPromise
  const db = client.db("urlShortener")

  const urlEntry = await db.collection("urls").findOne({ shortCode })

  if (urlEntry) {
    return NextResponse.redirect(urlEntry.originalUrl)
  } else {
    return NextResponse.json({ error: "URL not found" }, { status: 404 })
  }
}
