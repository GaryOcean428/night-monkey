import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>OpenAI Chat Examples</h1>
      <div className={styles.grid}>
        <Link href="/examples/basic-chat" className={styles.card}>
          <h2>Basic Chat &rarr;</h2>
          <p>Simple chat interface using the Assistants API</p>
        </Link>

        <Link href="/examples/function-calling" className={styles.card}>
          <h2>Function Calling &rarr;</h2>
          <p>Chat with weather data using function calling</p>
        </Link>

        <Link href="/examples/file-search" className={styles.card}>
          <h2>File Search &rarr;</h2>
          <p>Chat with the ability to search through files</p>
        </Link>

        <Link href="/examples/responses-api" className={styles.card}>
          <h2>Responses API &rarr;</h2>
          <p>Modern chat using the new Responses API</p>
        </Link>

        <Link href="/examples/all" className={styles.card}>
          <h2>All Features &rarr;</h2>
          <p>All features combined in one interface</p>
        </Link>
      </div>
    </main>
  );
}