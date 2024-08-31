import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { hash } from 'bcryptjs'

export async function POST(request) {
  const { name, email, password } = await request.json()

  const client = await clientPromise
  const db = client.db("urlShortener")

  const existingUser = await db.collection("users").findOne({ email })
  if (existingUser) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 })
  }

  const hashedPassword = await hash(password, 12)

  const result = await db.collection("users").insertOne({
    name,
    email,
    password: hashedPassword,
    createdAt: new Date()
  })

  return NextResponse.json({ message: "User created successfully", userId: result.insertedId })
}
