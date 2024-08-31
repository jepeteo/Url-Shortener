import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { nanoid } from 'nanoid'

export async function POST(request) {
  const { url } = await request.json()
  
  const client = await clientPromise
  const db = client.db("urlShortener")
  
  const shortCode = nanoid(6) // Generate a short, unique ID
  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`

  await db.collection("urls").insertOne({
    originalUrl: url,
    shortCode: shortCode,
    createdAt: new Date()
  })

  return NextResponse.json({ shortUrl })
}