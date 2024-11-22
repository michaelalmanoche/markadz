import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Handle GET request for fetching a user by ID
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Extract the ID from the URL

  if (!id) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, username: true, roleType: true },
    });

    if (user) {
      return NextResponse.json(user);
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to retrieve user', error: error.message }, { status: 500 });
  }
}

// Handle PUT request for updating a user by ID
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Extract the ID from the URL

  if (!id) {
    return NextResponse.json({ message: 'ID is required' }, { status: 400 });
  }

  const { username, password, roleType } = await req.json();

  try {
    // Hash the password if it's provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Update user in the database
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        username,
        ...(hashedPassword && { password: hashedPassword }),
        roleType,
      },
    });

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Error during update:', error);
    return NextResponse.json({ message: 'Failed to update user', error: error.message }, { status: 500 });
  }
}

// Handle DELETE request for archiving a user by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { archived: true },
    });

    if (user) {
      return NextResponse.json({ message: 'User archived successfully' });
    } else {
      return NextResponse.json({ message: 'User not found or already archived' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to archive user', error: error.message }, { status: 500 });
  }
}