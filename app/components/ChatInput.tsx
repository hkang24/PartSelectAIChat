// handles the input and submit button for the chatbox

import { useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";

import { ArrowUp } from "lucide-react";

export default function ChatInput({
  generateResponse,
  isPending,
  input,
  setInput,
}: {
  generateResponse: () => void;
  isPending: boolean;
  input: string;
  setInput: (input: string) => void;
}) {

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // adjusts the height of the textarea based on the input length / shrinks when empty
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = input ? `${textarea.scrollHeight}px` : "40px"; // default height when empty
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  return (
    <div className="absolute bottom-0 w-full bg-gray-50 rounded-[24px] flex items-end justify-between border p-1">
      <textarea
        ref={textareaRef}
        className="bg-gray-50 rounded-[24px] border-none flex-1 overflow-hidden px-4 py-2 focus:outline-none text-sm h-[40px]"
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.length > 0 && !isPending) {
              generateResponse();
            }
          }
        }}
      />
      <Button
        variant="ghost"
        className={`bg-[#398584] text-white rounded-full h-8 w-8 mr-1 mb-[4px]`}
        disabled={input.length === 0 || isPending}
        onClick={() => generateResponse()}
      >
        <ArrowUp />
      </Button>
    </div>
  );
}
