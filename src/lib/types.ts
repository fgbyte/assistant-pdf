export type DocumentMetadata = {
	id: string;
	filename: string;
	uploadedAt: Date;
	summary: string;
	pageCount: number;
	fileSize: number;
};

export type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	documentId: string;
};
