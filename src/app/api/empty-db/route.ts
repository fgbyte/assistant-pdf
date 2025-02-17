import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

const pinecone = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

export async function POST() {
	try {
		await index.deleteAll();
		console.log("Todos los vectores han sido eliminados.");
		return NextResponse.json({
			message: "Todos los vectores han sido eliminados.",
		});
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json({
			message: "Error al eliminar todos los vectores.",
		});
	}
}
