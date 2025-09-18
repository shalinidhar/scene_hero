import Screenplay from "../../components/Editor";
import getRedisClient from "../../../../lib/redis";


const DEFAULT_EXPIRATION = 360000

export default async function Page({params}) {
  console.log("in function")
  const {id} = params
  let story = [{
    type: 'heading',
    children: [{ text: 'INT. ROOM. YOUR SCREENPLAY BEGINS...' }],
  },]
  let page_count = 1

  const redisClient = await getRedisClient()
  redisClient.on('error', err => console.log('Redis Client Error', err));
  const start = performance.now();
  const val = await redisClient.get(id.toString())
  if (val!=null){
    const parsed_val = JSON.parse(val)
    story = parsed_val.story
    page_count= parsed_val.pages
    const end = performance.now();
    console.log(`Redis GET took ${end - start} ms`);
  } else{ 
    console.log('CACHE MISS')
    const res = await fetch(`http://localhost:3000/api/projects?id=${id}`, {
      cache: "no-store", // disable caching for latest data (avoids stale data)
    });

    if (!res.ok) {
      return <div>Could not load project {id}</div>;
    } 
    const db_val = await res.json(); //converts object to json 
    console.log(db_val)
    story = db_val.story
    page_count = db_val.pages
    //store this in cache
     await redisClient.set(id.toString(), JSON.stringify(db_val), {
      EX: DEFAULT_EXPIRATION, 
    });      
  }
  return (
    <Screenplay projectId={id} initialValue={story} page_count={page_count}/> //pass the data in here
  )
}