import type { DocumentMetadata } from "@/lib/types";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

type DocumentHistoryProps = {
	documents: DocumentMetadata[];
	onSelect: (documentId: string) => void;
	currentId?: string;
};

export const DocumentHistory = ({
	documents,
	onSelect,
	currentId,
}: DocumentHistoryProps) => {
	return (
		<Card className="p-4">
			<h2 className="text-lg font-semibold mb-4">Document History</h2>
			{documents.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-4">
					No documents have been uploaded yet.
				</p>
			) : (
				<ScrollArea className="h-[300px">
					{documents.map((doc) => (
						<div
							key={doc.id}
							className={`p-3 rounded-lg mb-2 transition-colors ${currentId === doc.id ? "bg-primary/10" : "hover:bg-primary/5"}`}
						>
							<div className="flex items-center justify-between">
								{/* biome-ignore lint/a11y/useKeyWithClickEvents: <i not going to use accessibility in this app */}
								<div
									className="flex-1 cursor-pointer"
									onClick={() => onSelect(doc.id)}
								>
									{doc.filename}
								</div>
							</div>
							<div className="text-sm text-muted-foreground">
								{new Date(doc.uploadedAt).toLocaleDateString()}
							</div>
						</div>
					))}
				</ScrollArea>
			)}
		</Card>
	);
};
