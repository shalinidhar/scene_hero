import { NextRequest, NextResponse } from "next/server";
import {db} from "../../../../backend/db"
import getRedisClient from "../../../../lib/redis";

export async function GET(req : NextRequest){
  const id = req.nextUrl.searchParams.get("id"); //search by project id
  const user = req.nextUrl.searchParams.get("user"); //search projects by user
  try {
    let result;
    if (id){
        result = await db.query('SELECT * FROM projects WHERE id = $1',[id]);
        return NextResponse.json(result.rows[0]);
    } else if (user){
        result = await db.query('SELECT * FROM projects WHERE owner = $1', [user]);
        return NextResponse.json(result.rows);
    }
    if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT (req: NextRequest){
    const user = req.nextUrl.searchParams.get("user")
    const title = req.nextUrl.searchParams.get("title")

    try{
        if (user && title){
            const empty = '[{"type": "heading", "children": [{ "text": "" }]}]'
            const result = await db.query('INSERT INTO projects (owner, title, access, story) VALUES ($1, $2, ARRAY[$3], $4::jsonb)',[user,title, user,empty]);
        }

    } catch(err: any){
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

}

export async function PATCH (req: NextRequest){
    console.log("EKHANE BHAI")
    const body = await req.json(); 
    const story = JSON.stringify(body.story);
    const pages = body.page_count;
    const id = req.nextUrl.searchParams.get("id")   

    try{
        if (story && id){
            console.log(story)
            //Save to PSQL
            const result = await db.query('UPDATE projects SET story = $1, pages=$2 WHERE id=$3', [story, pages, id])
            //Save to Redis  (or delete from redis)
            const redisClient = await getRedisClient()
            const old_val = await redisClient.get(id.toString())
            if (old_val!=null){
                const parsed = JSON.parse(old_val)
                parsed.story = body.story
                parsed.pages = pages
                //store this in cache
                await redisClient.set(id.toString(), JSON.stringify(parsed), {
                EX: 360000, 
                })
            }
            

            
            return NextResponse.json(result.rows);
        }

    } catch(err: any){
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

}