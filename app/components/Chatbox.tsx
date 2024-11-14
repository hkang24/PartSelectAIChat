// handles the chatbox and the input/submit button. displays the messages

"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInput from "./ChatInput";

import { Message } from "@/types/chat-types";


export default function Chatbox() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // initial messages displayed in the chatbox
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState("");

  // handles listing generation and success/error handling
  const { mutate: generateResponse, isPending } = useMutation({
    mutationFn: handleSubmit,
    onSuccess: (data) => {
      setThreadId(data.threadId);
      setMessages([
        ...messages,
        { role: "assistant", content: data.message },
      ]);
    },
    onError: () => {
      setMessages([
        ...messages,
        { role: "user", content: input },
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble generating a response. Please try again later.",
        },
      ]);
    },
  });

  // sends input to the backend to generate agent response
  async function handleSubmit() {
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    const response = await fetch("/api/generateResponse", {
      method: "POST",
      body: JSON.stringify({ message: input, threadId: threadId }),
    });
    const data = await response.json();
    return data;
  }

  // scrolls to the bottom of the chatbox when a new message is added
  useEffect(() => {
    setTimeout(() => {
      const scrollArea = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }, 100);
  }, [messages]);

  return (
    <div className="h-full w-[40rem] relative">
      <ScrollArea className="h-[50rem] w-full" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4 ">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`${
                message.role === "assistant"
                  ? "self-start preserve-formatting flex gap-x-2"
                  : "bg-[#EBF6F6] self-end"
              } px-4 py-2 rounded-xl text-sm text-black`}
            >
              <span>{message.role === "assistant" ? "🤖 " : ""}</span>
              <div
                dangerouslySetInnerHTML={{ __html: message.content }}
                className="[&_*]:my-0 [&_*]:py-0 [&_h1]:text-md [&_h2]:text-md [&_h3]:text-md [&_*]:leading-normal whitespace-pre-line [&_*]:whitespace-pre-line flex flex-col"
              />
            </div>
          ))}
          {isPending && (
            <div className="self-start preserve-formatting flex gap-x-2 px-4 py-2 rounded-xl text-sm text-black flex items-center">
              <span>🤖</span>
              <div className="animate-pulse h-4 w-4 rounded-full bg-[#398584]/60"></div>
            </div>
          )}
        </div>
      </ScrollArea>
      <ChatInput
        generateResponse={generateResponse}
        isPending={isPending}
        input={input}
        setInput={setInput}
      />
    </div>
  );
}
