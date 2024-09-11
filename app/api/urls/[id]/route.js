import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import clientPromise from '../../../../lib/mongodb'
import { authOptions } from '../../auth/[...nextauth]/route'
import { ObjectId } from 'mongodb'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const client = await clientPromise
  const db = client.db("urlShortener")

  const url = await db.collection("urls").findOne({
    _id: new ObjectId(params.id),
    userId: session.user.id
  })

  if (!url) {
    return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 })
  }

  return NextResponse.json(url)
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const client = await clientPromise
  const db = client.db("urlShortener")

  const result = await db.collection("urls").deleteOne({
    _id: new ObjectId(params.id),
    userId: session.user.id
  })

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 })
  }

  return NextResponse.json({ message: "URL deleted successfully" })
}