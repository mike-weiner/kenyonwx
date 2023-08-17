import { NextResponse } from 'next/server';

export function middleware(req, ev) {
    if (process.env.NODE_ENV === 'production' && (!req.headers.get('x-forwarded-proto').includes('https'))) {
        return NextResponse.redirect(`https://${req.headers.get('host')}${req.nextUrl.pathname}`, 301);
    }

    return NextResponse.next();
}