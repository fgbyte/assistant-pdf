"use client";

import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DocumentMetadata } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(false);
	const [error, setError] = useState<string>("");
	const [summary, setSummary] = useState<string>("");
	const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
	const [currentDocument, setCurrentDocument] = useState<DocumentMetadata>();

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		try {
			setError("");
			setUploadProgress(true);
			const formData = new FormData();
			formData.append("file", acceptedFiles[0]);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to upload document");
			}

			const data = await response.json();
			setSummary(data.summary);

			const newDoc: DocumentMetadata = {
				id: data.documentId,
				filename: acceptedFiles[0].name,
				uploadedAt: new Date(),
				summary: data.summary,
				pageCount: data.pageCount,
				fileSize: acceptedFiles[0].size,
			};
			setDocuments((prev) => [...prev, newDoc]);
			setCurrentDocument(newDoc);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unknown error");
		} finally {
			setUploadProgress(false);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "application/pdf": [".pdf"] },
		maxSize: 10 * 1024 * 1024, // 10 MB
	});

	const handleMessage = async (message: string, documentId: string) => {
		console.log("handleMessage:", message, documentId);
		return "Hello";
	};

	//clear DB function
	const handleClick = async () => {
		try {
			const response = await fetch("/api/empty-db", {
				method: "POST", // Preferably use POST for actions that modify state
			});
			if (response.ok) {
				alert("All vectors have been deleted.");
			} else {
				alert("Failed to delete vectors.");
			}
		} catch (error) {
			console.error("Error:", error);
			alert("An error occurred while trying to delete vectors.");
		}
	};

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">AI PDF Assistant</h1>
				<div>{/* TODO: Add theme toggle */}</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<Card className="p-6 mb-8">
						<div
							{...getRootProps()}
							className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-blue-500" : "border-gray-300 dark:border-gray-700"}`}
						>
							<input {...getInputProps()} />
							{uploadProgress ? (
								<div className="flex- items-center justify-center gap-2">
									<Loader2 className="animate-spin size-4 text-blue-500" />
									<p>Processing document...</p>
								</div>
							) : (
								<p>Drag and drop your PDF here, or click to select a file</p>
							)}
						</div>
					</Card>
					{error && (
						<div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
							{error}
						</div>
					)}

					{summary && (
						<Card className="p-6 mb-8">
							<h2 className="text-2xl font-semibold mb-4">Document Summary</h2>
							<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
								{summary}
							</p>
						</Card>
					)}

					<ChatInterface
						onSendMessage={handleMessage}
						loading={loading}
						currentDocument={currentDocument}
					/>
				</div>
			</div>
			<Button onClick={handleClick}>Clear Database</Button>
		</div>
	);
}
