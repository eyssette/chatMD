import "../css/styles.css";
import defaultMd from "../index.md";
import { createChatbot } from "./core/chatbot/createChatbot.mjs";

createChatbot(defaultMd);
