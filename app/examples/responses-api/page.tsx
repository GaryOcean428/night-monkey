import ResponseChat from "@/app/components/responsive-chat";
import styles from "../all/page.module.css";

export default function ResponsesApiExample() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Responses API Example</h1>
        <p className={styles.description}>
          This example shows how to use the OpenAI Responses API for chat applications.
          It supports streaming, tool calling, and persistent context.
        </p>
      </div>
      <div className={styles.chat}>
        <ResponseChat 
          enabledTools={["weather", "webSearch"]} 
          initialSystemMessage="You are a helpful AI assistant. You have access to weather information and web search capabilities."
        />
      </div>
    </div>
  );
}