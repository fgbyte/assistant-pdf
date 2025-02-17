import type { ChatMessage, DocumentMetadata } from "@/lib/types";
import { FileText } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type ChatInterfaceProps = {
	onSendMessage: (message: string, documentId: string) => Promise<string>;
	loading: boolean;
	currentDocument?: DocumentMetadata;
};

const ChatInterface = ({
	onSendMessage,
	loading,
	currentDocument,
}: ChatInterfaceProps) => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setinput] = useState<string>("");
	const scrillRef = useRef<HTMLDivElement>(null);

	return (
		<Card className="h-[500px] flex flex-col">
			{currentDocument ? (
				<div className="p-3 border-b flex itemx-center justify-between bg-muted/50">
					<div className="flex items-center gap-2">
						<FileText className="size-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">
							Current Document: {currentDocument.filename}
						</span>
					</div>
					{messages.length > 0 && (
						<Button className="text-muted-foreground hover:text-destructive">
							Clear History
						</Button>
					)}
				</div>
			) : (
				<div className="p-3 border-b bg-yellow-500/10 text-yellow-900 dark:text-yellow-200 text-sm">
					Pelase select or upload a document first.
				</div>
			)}
		</Card>
	);
};

export default ChatInterface;
