// Process to upload a PDF file to Pinecone
// 1. Convert the PDF file to a BLOB
// 2. Load the BLOB into a document
// 3. Split the document into chunks
// 4. Add documentId to metadata of each chunk
// 5. Store the chunks in Pinecone
// 6. Generate a summary of the document

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextResponse } from "next/server";

const pinecone = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST(req: Request) {
	try {
		const formData = await req.formData(); // get the form data from the request
		const file = formData.get("file") as File; // get the file from the form data

		if (!file) {
			return new Response("No file uploaded", { status: 400 });
		}

		// Generate a document id
		const documentId = crypto.randomUUID();

		// Convert the File into a BLOB = Binary Large Object
		const blob = new Blob([await file.arrayBuffer()], { type: file.type });

		// Load and parse the PDF
		const loader = new PDFLoader(blob);
		const docs = await loader.load();
		// This is likely necessary for extracting the text content from the PDF, which will be used in the next step.

		// Split text into chunks
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});

		const splitDocs = await textSplitter.splitDocuments(docs);
		// splitDocs is an array of documents

		// Add documentId to metadata of each chunk
		//For each document in the splitDocs array, the code is creating a new object
		const docsWithMetadata = splitDocs.map((doc) => ({
			...doc, //maintain the original document
			metadata: {
				// add the documentId to the metadata
				...doc.metadata,
				documentId,
			}, // The docsWithMetadata variable will be an array of objects, where each object represents a single text chunk with its associated metadata.
		}));

		//** Generate summary **//
		// const openai = new ChatOpenAI({
		// 	openAIApiKey: process.env.OPENAI_API_KEY,
		// 	modelName: "gpt-4o-mini",
		// 	temperature: 0.7,
		// });
		const genai = new ChatGoogleGenerativeAI({
			apiKey: process.env.GOOGLE_API_KEY,
			model: "gemini-2.0-flash",
			temperature: 0.3,
		});

		const documentText = splitDocs[0].pageContent;
		// console.log(documentText);

		const response = await genai.invoke([
			{
				role: "system",
				content:
					"You are an AI assistant that generates clear and structured summaries o academic papers.",
			},
			{
				role: "user",
				content: `Summarize the following research paper extract, preserving key insights and findings. Keep it informative and concise, no more than 100 words:\n\n"""${documentText}"""`,
			},
		]);

		const summary = response.content;

		// console.log(summary);

		// Store in Pinecone with metadata
		const embeddings = new OpenAIEmbeddings({
			openAIApiKey: process.env.OPENAI_API_KEY!,
		});
		const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

		await PineconeStore.fromDocuments(docsWithMetadata, embeddings, {
			pineconeIndex: index,
		});

		return NextResponse.json({
			summary,
			documentId,
			pageCount: docs.length,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error(errorMessage);
		return new Response(errorMessage, { status: 500 });
	}
}
