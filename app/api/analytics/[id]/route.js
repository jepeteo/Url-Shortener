import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    const db = await getDatabase();
    const analytics = await db.collection("urls").findOne({ _id: new ObjectId(id) });
    
    if (!analytics) {
      return new Response(JSON.stringify({ error: "Analytics not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
