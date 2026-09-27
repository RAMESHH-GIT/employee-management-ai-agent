import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

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

const API_URL = process.env.REACT_APP_API_URL;

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/ai/conversations`,
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
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConversation = async (
    selectedConversationId
  ) => {
    if (loading) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/ai/conversation/${selectedConversationId}`,
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

  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();

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
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/ai/chat`,
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

      if (data.conversationId) {
        setConversationId(
          data.conversationId
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);

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

  const handleNewChat = () => {
    if (loading) return;

    setMessages([]);
    setConversationId(null);
    setMessage("");
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f7f9fc",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "white",
          borderBottom: "1px solid #e0e0e0",
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
            AI Assistant
          </Typography>
        </Stack>

        <Button
          size="small"
          variant="outlined"
          startIcon={<Add />}
          onClick={handleNewChat}
          disabled={loading}
        >
          New Chat
        </Button>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: 0,
        }}
      >
        {/* Conversations */}
        <Box
          sx={{
            width: 180,
            borderRight: "1px solid #e0e0e0",
            bgcolor: "white",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              p: 1.5,
              fontWeight: 600,
            }}
          >
            Conversations
          </Typography>

          <Divider />

          <List dense>
            {conversations.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ p: 2 }}
              >
                No conversations
              </Typography>
            ) : (
              conversations.map((conversation) => (
                <ListItemButton
                  key={
                    conversation.conversationId
                  }
                  selected={
                    conversation.conversationId ===
                    conversationId
                  }
                  onClick={() =>
                    handleSelectConversation(
                      conversation.conversationId
                    )
                  }
                >
                  <ListItemText
                    primary={
                      conversation.title ||
                      "New Conversation"
                    }
                    primaryTypographyProps={{
                      fontSize: 13,
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </Box>

        {/* Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
            }}
          >
            {messages.length === 0 ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <Box>
                  <SmartToy
                    sx={{
                      fontSize: 48,
                      color: "primary.main",
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
                    Ask me about employees,
                    skills, locations or company
                    information.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Stack spacing={2}>
                {messages.map(
                  (msg, index) => {
                    const isUser =
                      msg.role === "user";

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
                        <Card
                          sx={{
                            maxWidth: "85%",
                            p: 1.5,
                            bgcolor: isUser
                              ? "primary.main"
                              : "white",
                            color: isUser
                              ? "white"
                              : "text.primary",
                            borderRadius: 2,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                          >
                            {isUser ? (
                              <Person fontSize="small" />
                            ) : (
                              <SmartToy fontSize="small" />
                            )}

                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace:
                                  "pre-wrap",
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {msg.content}
                            </Typography>
                          </Stack>
                        </Card>
                      </Box>
                    );
                  }
                )}

                {loading && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "flex-start",
                    }}
                  >
                    <Card
                      sx={{
                        p: 1.5,
                        bgcolor: "white",
                      }}
                    >
                      <CircularProgress
                        size={20}
                      />
                    </Card>
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
              p: 1.5,
              bgcolor: "white",
              borderTop:
                "1px solid #e0e0e0",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Ask AI something..."
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
                  loading ||
                  !message.trim()
                }
              >
                <Send />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AIAssistant;