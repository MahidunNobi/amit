import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Test database connection
    const userCount = await User.countDocuments();
    
    return NextResponse.json({ 
      message: 'Auth test successful',
      userCount,
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      }
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({ 
      message: 'Auth test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 