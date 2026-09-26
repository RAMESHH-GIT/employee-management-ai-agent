import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  Add,
  Send,
  SmartToy,
  Person,
} from "@mui/icons-material";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Current conversation ID
  const [conversationId, setConversationId] = useState(null);

  // All saved conversations
  const [conversations, setConversations] = useState([]);

  // Get JWT token
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Load saved conversations when page opens
  useEffect(() => {
    fetchConversations();
  }, []);

  // Get all conversations
  const fetchConversations = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/ai/conversations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load conversations"
        );
      }

      setConversations(data.conversations || []);
    } catch (error) {
      console.error(
        "Load conversations error:",
        error
      );
    }
  };

  // Load one conversation
  const handleSelectConversation = async (
    selectedConversationId
  ) => {
    if (loading) return;

    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `http://localhost:5000/api/ai/conversation/${selectedConversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load conversation"
        );
      }

      setConversationId(
        data.conversation.conversationId
      );

      setMessages(
        data.conversation.messages || []
      );
    } catch (error) {
      console.error(
        "Load conversation error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    // Show user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/ai/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: userMessage,
            conversationId: conversationId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "AI request failed"
        );
      }

      // Save conversation ID
      if (data.conversationId) {
        setConversationId(
          data.conversationId
        );
      }

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);

      // Refresh conversation list
      fetchConversations();
    } catch (error) {
      console.error("AI error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Start a new chat
  const handleNewChat = () => {
    if (loading) return;

    setMessages([]);
    setConversationId(null);
    setMessage("");
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: 500,
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* LEFT - CONVERSATIONS */}

      <Box
        sx={{
          width: 260,
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Header */}

        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            fontWeight={600}
          >
            AI Assistant
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={handleNewChat}
            disabled={loading}
            sx={{
              mt: 2,
              textTransform: "none",
            }}
          >
            New Chat
          </Button>
        </Box>

        <Divider />

        {/* Previous Chats */}

        <Box
          sx={{
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
          >
            PREVIOUS CHATS
          </Typography>
        </Box>

        <List
          sx={{
            px: 1,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {conversations.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 1, py: 2 }}
            >
              No previous conversations
            </Typography>
          ) : (
            conversations.map((conversation) => (
              <ListItemButton
                key={
                  conversation.conversationId
                }
                selected={
                  conversationId ===
                  conversation.conversationId
                }
                onClick={() =>
                  handleSelectConversation(
                    conversation.conversationId
                  )
                }
                disabled={loading}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemText
                  primary={
                    conversation.title
                  }
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: 14,
                  }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Box>

      {/* RIGHT - CHAT */}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Chat Header */}

        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <SmartToy color="primary" />

            <Typography
              variant="h6"
              fontWeight={600}
            >
              Employee AI Assistant
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Ask questions about employees.
          </Typography>
        </Box>

        {/* Messages */}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            backgroundColor: "#fafafa",
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  maxWidth: 400,
                }}
              >
                <SmartToy
                  sx={{
                    fontSize: 42,
                    color: "text.secondary",
                    mb: 1,
                  }}
                />

                <Typography
                  variant="h6"
                  gutterBottom
                >
                  How can I help?
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Ask something like "Show me React
                  employees in Hyderabad."
                </Typography>
              </Box>
            </Box>
          ) : (
            <Stack spacing={2}>
              {messages.map((item, index) => {
                const isUser =
                  item.role === "user";

                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: isUser
                        ? "flex-end"
                        : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        maxWidth: "75%",
                        alignItems: "flex-start",
                      }}
                    >
                      {!isUser && (
                        <SmartToy
                          fontSize="small"
                          color="primary"
                          sx={{ mt: 1 }}
                        />
                      )}

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          {isUser
                            ? "You"
                            : "AI"}
                        </Typography>

                        <PaperMessage
                          isUser={isUser}
                        >
                          {item.content}
                        </PaperMessage>
                      </Box>

                      {isUser && (
                        <Person
                          fontSize="small"
                          color="action"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}

              {loading && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <SmartToy
                    fontSize="small"
                    color="primary"
                  />

                  <CircularProgress size={18} />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Thinking...
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Box>

        {/* Input */}

        <Box
          component="form"
          onSubmit={handleSend}
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "#ffffff",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
          >
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Ask about employees..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              disabled={loading}
            />

            <IconButton
              type="submit"
              color="primary"
              disabled={
                loading || !message.trim()
              }
              sx={{
                border: "1px solid",
                borderColor: "primary.main",
                borderRadius: 1,
                width: 42,
                height: 40,
              }}
            >
              <Send />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}

/*
  Small message bubble component.
  Only controls presentation.
*/
function PaperMessage({
  children,
  isUser,
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        backgroundColor: isUser
          ? "primary.main"
          : "#ffffff",
        color: isUser
          ? "primary.contrastText"
          : "text.primary",
        border: isUser
          ? "none"
          : "1px solid",
        borderColor: "divider",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export default AIAssistant;