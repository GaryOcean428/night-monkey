"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import Markdown from "react-markdown";
import { ResponsesStream } from "openai/lib/ResponsesStream";
import { defaultModel } from "@/frontend/openai";
import threadManager from "@/frontend/utils/thread-manager";
import { FunctionToolCall } from "openai/resources/shared";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

const UserMessage = ({ text }: { text: string }) => {
  return <div className={styles.userMessage}>{text}</div>;
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.assistantMessage}>
      <Markdown>{text}</Markdown>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: FunctionToolCall
  ) => Promise<string>;
  model?: string;
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
  model = defaultModel
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [currentResponseId, setCurrentResponseId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // create a new thread when chat component is created
  useEffect(() => {
    const createThread = async () => {
      try {
        const thread = await threadManager.createThread();
        setThreadId(thread.id);
        console.log("Created new thread with ID:", thread.id);
      } catch (error) {
        console.error("Failed to create thread:", error);
      }
    };
    createThread();
  }, []);

  const sendMessage = async (text) => {
    try {
      setIsGenerating(true);
      
      // Use thread manager to send message and get response stream
      const stream = await threadManager.sendMessageToThread(
        threadId,
        text,
        { 
          model, 
          tools: [{ type: "function", function: { name: "get_weather" } }],
          stream: true 
        }
      );
      
      // Set current response ID for potential tool call handling
      setCurrentResponseId(stream.id);
      
      // Handle the response stream
      handleResponseStream(stream);
    } catch (error) {
      console.error("Error sending message:", error);
      setInputDisabled(false);
      setIsGenerating(false);
    }
  };

  const submitToolOutputs = async (toolOutputs) => {
    try {
      setIsGenerating(true);
      
      if (!currentResponseId) {
        console.error("No current response ID for tool outputs");
        return;
      }
      
      // Submit tool outputs to continue the conversation
      const stream = await threadManager.submitToolOutputs(
        currentResponseId,
        toolOutputs,
        { model, stream: true }
      );
      
      // Update current response ID for potential further tool calls
      setCurrentResponseId(stream.id);
      
      // Handle the continued response stream
      handleResponseStream(stream);
    } catch (error) {
      console.error("Error submitting tool outputs:", error);
      setInputDisabled(false);
      setIsGenerating(false);
    }
  };
  
  // Interrupt the current stream generation
  const interruptGeneration = async () => {
    if (!currentResponseId) return;
    
    try {
      const response = await fetch('/api/responses/interrupt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamId: currentResponseId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        appendToLastMessage('\n\n*Generation interrupted*');
      }
    } catch (error) {
      console.error('Error interrupting generation:', error);
    } finally {
      setIsGenerating(false);
      setInputDisabled(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // Handle the start of a new message
  const handleMessageStart = () => {
    appendMessage("assistant", "");
  };

  // Handle text content in the message
  const handleMessageContent = (content: string) => {
    appendToLastMessage(content);
  };

  // Handle image file responses
  const handleImageFile = (file: any) => {
    appendToLastMessage(`\n![Image](/api/files/${file.file_id})\n`);
  };

  // Handle tool calls
  const handleToolCalls = async (toolCalls: FunctionToolCall[]) => {
    // Process tool calls and get outputs
    const toolOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        try {
          // For function calls, display the function and args in chat
          if (toolCall.type === 'function') {
            appendMessage("code", `Function: ${toolCall.function.name}\nArguments: ${toolCall.function.arguments}`);
          }
          
          // Call the function handler to get the result
          const result = await functionCallHandler(toolCall);
          
          return { 
            tool_call_id: toolCall.id, 
            output: result 
          };
        } catch (error) {
          console.error(`Error processing tool call ${toolCall.id}:`, error);
          return { 
            tool_call_id: toolCall.id, 
            output: JSON.stringify({ error: error.message }) 
          };
        }
      })
    );

    // Submit the tool outputs to continue the conversation
    setInputDisabled(true);
    submitToolOutputs(toolOutputs);
  };

  // Handle the end of a response
  const handleMessageEnd = () => {
    setInputDisabled(false);
    setIsGenerating(false);
  };

  // Handle all events from the ResponsesStream
  const handleResponseStream = (stream: ResponsesStream) => {
    // When the message starts
    stream.on("messageStart", handleMessageStart);
    
    // For each chunk of content
    stream.on("messageDelta", (delta) => {
      if (delta.content) {
        handleMessageContent(delta.content);
      }
    });
    
    // When tool calls are received
    stream.on("toolCalls", (toolCalls) => {
      handleToolCalls(toolCalls);
    });
    
    // When image files are included
    stream.on("imageFile", handleImageFile);
    
    // When the message is complete
    stream.on("messageEnd", handleMessageEnd);
    
    // Handle any errors
    stream.on("error", (error) => {
      console.error("Stream error:", error);
      setInputDisabled(false);
      setIsGenerating(false);
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === 'file_path') {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      })
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
    
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
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
        {isGenerating ? (
          <button
            type="button"
            className={`${styles.interruptButton} ${isGenerating ? styles.visible : ''}`}
            onClick={interruptGeneration}
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            className={styles.button}
            disabled={inputDisabled}
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
};

export default Chat;
