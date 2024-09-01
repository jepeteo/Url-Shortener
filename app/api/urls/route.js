import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import clientPromise from '../../../lib/mongodb'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const client = await clientPromise
  const db = client.db("urlShortener")

  const urls = await db.collection("urls")
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json(urls)
}
