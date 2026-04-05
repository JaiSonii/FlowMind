'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function registerUserAction(data: any) {
  const { name, email, password } = data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('Email already in use')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  })
}