import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { sendChatMessage, fetchChatSuggestions, type ChatResponse, type ChatSuggestion } from "../../api/purchaseOrderApi";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  data?: unknown;
  timestamp: Date;
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        bgcolor: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 14,
        fontWeight: 600
      }}
    >
      AI
    </Box>
  );
}

function UserAvatar() {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        bgcolor: "grey.300",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.primary",
        fontSize: 12,
        fontWeight: 600
      }}
    >
      YOU
    </Box>
  );
}

function formatResponse(response: ChatResponse): string {
  if (typeof response.response === "string") {
    return response.response;
  }
  return JSON.stringify(response.response);
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Hi! I'm your PO Assistant. Ask me about purchase orders, totals, suppliers, or brands.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ["chat-suggestions"],
    queryFn: fetchChatSuggestions,
    enabled: isOpen
  });

  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          type: "bot",
          text: formatResponse(response),
          data: response.data,
          timestamp: new Date()
        }
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          type: "bot",
          text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Please try again."}`,
          timestamp: new Date()
        }
      ]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      text: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    setInput(suggestion.query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setIsOpen(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <ChatIcon />
      </Fab>
    );
  }

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 380,
        maxWidth: "calc(100vw - 48px)",
        height: 500,
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        borderRadius: 2,
        overflow: "hidden"
      }}
    >
      {/* Header */}
      <Card sx={{ borderRadius: 0, bgcolor: "primary.main", color: "primary.contrastText" }}>
        <CardContent sx={{ p: 2, pb: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              PO Assistant
            </Typography>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "inherit" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </CardContent>
      </Card>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2, bgcolor: "grey.50" }}>
        <Stack spacing={2}>
          {messages.map((message) => (
            <Stack
              key={message.id}
              direction={message.type === "user" ? "row-reverse" : "row"}
              spacing={1.5}
              alignItems="flex-start"
            >
              {message.type === "bot" ? <BotAvatar /> : <UserAvatar />}
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: "75%",
                  borderRadius: 2,
                  bgcolor: message.type === "user" ? "primary.main" : "white",
                  color: message.type === "user" ? "primary.contrastText" : "text.primary",
                  boxShadow: 1
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {message.text}
                </Typography>
              </Paper>
            </Stack>
          ))}
          {chatMutation.isPending && (
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <BotAvatar />
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: "white" }}>
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Paper>
            </Stack>
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <Box sx={{ px: 2, py: 1, bgcolor: "grey.50", borderTop: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
            {suggestions.map((suggestion) => (
              <Chip
                key={suggestion.query}
                label={suggestion.label}
                size="small"
                onClick={() => handleSuggestionClick(suggestion)}
                clickable
                sx={{ flexShrink: 0 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Ask about orders, suppliers, or totals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={chatMutation.isPending}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
}
