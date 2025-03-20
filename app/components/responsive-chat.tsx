"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import Markdown from "react-markdown";
import { availableTools } from "@/app/tools-config";

type MessageProps = {
  role: "user" | "assistant" | "code" | "tool";
  content: string;
  toolCall?: any;
};

const UserMessage = ({ content }: { content: string }) => {
  return <div className={styles.userMessage}>{content}</div>;
};

const AssistantMessage = ({ content }: { content: string }) => {
  return (
    <div className={styles.assistantMessage}>
      <Markdown>{content}</Markdown>
    </div>
  );
};

const CodeMessage = ({ content }: { content: string }) => {
  return (
    <div className={styles.codeMessage}>
      {content.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const ToolMessage = ({ content, toolCall }: { content: string, toolCall: any }) => {
  return (
    <div className={styles.toolMessage}>
      <div className={styles.toolHeader}>
        {toolCall.function?.name || toolCall.type}
      </div>
      <div className={styles.toolContent}>
        <pre>{content}</pre>
      </div>
    </div>
  );
};

const Message = ({ role, content, toolCall }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage content={content} />;
    case "assistant":
      return <AssistantMessage content={content} />;
    case "code":
      return <CodeMessage content={content} />;
    case "tool":
      return <ToolMessage content={content} toolCall={toolCall} />;
    default:
      return null;
  }
};

type ResponseChatProps = {
  enabledTools?: string[];
  initialSystemMessage?: string;
};

const ResponseChat = ({
  enabledTools = ["weather"],
  initialSystemMessage = "You are a helpful assistant."
}: ResponseChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);

  // Automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    try {
      // Prepare tools based on enabled tools
      const tools = enabledTools.map(toolName => availableTools[toolName]).filter(Boolean);
      
      // Initial system message if conversation not started yet
      const input = !conversationStarted 
        ? [
            { role: "system", content: initialSystemMessage },
            { role: "user", content: text }
          ]
        : text;

      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          stream: true,
          previousResponseId: conversationStarted ? previousResponseId : undefined,
          store: true,
          tools: tools.length > 0 ? tools : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      setConversationStarted(true);
      
      // Process the streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      // Current accumulating message
      let accumulatedMessage = "";
      let currentResponseId = "";
      let pendingToolCalls: any[] = [];

      // Function to read from the stream
      const read = async () => {
        const { value, done } = await reader.read();
        
        if (done) {
          // If we have tool calls that need processing, handle them
          if (pendingToolCalls.length > 0) {
            handleToolCalls(pendingToolCalls, currentResponseId);
          } else {
            setInputDisabled(false);
          }
          return;
        }

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        
        try {
          // Split by lines - each line is a separate event
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              if (pendingToolCalls.length > 0) {
                handleToolCalls(pendingToolCalls, currentResponseId);
              } else {
                setInputDisabled(false);
              }
              return;
            }

            const event = JSON.parse(data);
            
            // Handle different event types
            if (event.type === 'response') {
              currentResponseId = event.id;
              setPreviousResponseId(event.id);
            } 
            else if (event.type === 'content_block_delta' && event.delta && event.delta.text) {
              if (accumulatedMessage === "") {
                // Start a new assistant message
                setMessages(prev => [...prev, { 
                  role: "assistant", 
                  content: event.delta.text 
                }]);
                accumulatedMessage = event.delta.text;
              } else {
                // Append to the existing message
                accumulatedMessage += event.delta.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: accumulatedMessage
                  };
                  return updated;
                });
              }
            }
            else if (event.type === 'tool_calls') {
              // Store tool calls for later processing
              pendingToolCalls = event.tool_calls;
            }
            else if (event.type === 'content_block_stop') {
              // Message is complete
              accumulatedMessage = "";
            }
          }

          // Continue reading
          read();
        } catch (error) {
          console.error("Error processing stream:", error);
          setInputDisabled(false);
        }
      };

      // Start reading the stream
      read();
    } catch (error) {
      console.error("Error sending message:", error);
      setInputDisabled(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, there was an error processing your request. Please try again." 
      }]);
    }
  };

  const handleToolCalls = async (toolCalls: any[], responseId: string) => {
    if (!toolCalls || !Array.isArray(toolCalls) || toolCalls.length === 0) {
      console.warn("No valid tool calls to process");
      setInputDisabled(false);
      return;
    }

    if (!responseId) {
      console.error("Missing responseId for tool calls");
      setInputDisabled(false);
      return;
    }

    // Display tool calls in the UI
    toolCalls.forEach(toolCall => {
      if (!toolCall || !toolCall.type) {
        console.warn("Invalid tool call object", toolCall);
        return;
      }
      
      let displayContent = "";
      
      if (toolCall.type === "function" && toolCall.function) {
        displayContent = `Function: ${toolCall.function.name || "unknown"}\nArguments: ${
          toolCall.function.arguments || "{}"
        }`;
      } else {
        displayContent = `Tool type: ${toolCall.type}`;
      }
      
      setMessages(prev => [...prev, { 
        role: "tool", 
        content: displayContent,
        toolCall
      }]);
    });

    // Send tool calls to API for processing
    try {
      const response = await fetch("/api/responses/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseId,
          toolCalls,
          stream: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process tool calls");
      }

      // Process the streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      // Current accumulating message
      let accumulatedMessage = "";
      let currentResponseId = "";
      let pendingToolCalls: any[] = [];

      // Function to read from the stream
      const read = async () => {
        const { value, done } = await reader.read();
        
        if (done) {
          // If we have tool calls that need processing, handle them
          if (pendingToolCalls.length > 0) {
            handleToolCalls(pendingToolCalls, currentResponseId);
          } else {
            setInputDisabled(false);
          }
          return;
        }

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        
        try {
          // Split by lines - each line is a separate event
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              if (pendingToolCalls.length > 0) {
                handleToolCalls(pendingToolCalls, currentResponseId);
              } else {
                setInputDisabled(false);
              }
              return;
            }

            const event = JSON.parse(data);
            
            // Handle different event types
            if (event.type === 'response') {
              currentResponseId = event.id;
              setPreviousResponseId(event.id);
            } 
            else if (event.type === 'content_block_delta' && event.delta && event.delta.text) {
              if (accumulatedMessage === "") {
                // Start a new assistant message
                setMessages(prev => [...prev, { 
                  role: "assistant", 
                  content: event.delta.text 
                }]);
                accumulatedMessage = event.delta.text;
              } else {
                // Append to the existing message
                accumulatedMessage += event.delta.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: accumulatedMessage
                  };
                  return updated;
                });
              }
            }
            else if (event.type === 'tool_calls') {
              // Store tool calls for later processing
              pendingToolCalls = event.tool_calls;
            }
            else if (event.type === 'content_block_stop') {
              // Message is complete
              accumulatedMessage = "";
            }
          }

          // Continue reading
          read();
        } catch (error) {
          console.error("Error processing stream:", error);
          setInputDisabled(false);
        }
      };

      // Start reading the stream
      read();
    } catch (error) {
      console.error("Error processing tool calls:", error);
      setInputDisabled(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, there was an error processing the tool calls. Please try again." 
      }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userInput },
    ]);
    
    // Send message to API
    sendMessage(userInput);
    
    // Reset input and disable until response
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            role={msg.role} 
            content={msg.content}
            toolCall={msg.toolCall} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className={`${styles.inputForm} ${styles.clearfix}`}
      >
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
          disabled={inputDisabled}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ResponseChat;