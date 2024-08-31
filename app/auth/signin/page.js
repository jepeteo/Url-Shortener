'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })
    if (result.ok) {
      router.push('/')
    } else {
      // Handle error
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-2 rounded border border-gray-300 mb-4"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-2 rounded border border-gray-300 mb-4"
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Sign In
        </button>
      </form>
      <button onClick={() => signIn('github')} className="mt-4 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700">
        Sign in with GitHub
      </button>
    </div>
  )
}
