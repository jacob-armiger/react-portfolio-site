//import { createClient } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js'

import { NextResponse } from 'next/server';
export default async function Books() {
    const supabaseUrl = 'https://zzbmxyucqflrvgmkblox.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createClient(supabaseUrl, supabaseKey)
    const books = await supabase.from("book_data").select();

    // return <pre>{JSON.stringify(books, null, 2)}</pre>
    return NextResponse.json({ books }, { status: 200 });
}