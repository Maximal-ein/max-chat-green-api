"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/hooks/use-messages";
import { useReply } from "@/hooks/use-reply";
import { ReplyPreview } from "./reply-preview";
import { EmojiPicker } from "./emoji-picker";
import { toast } from "sonner";

interface Props {
  chatId: string;
  disabled?: boolean;
}

const MAX_LEN = 20000;

export function MessageInput({ chatId, disabled }: Props) {
  const { sendMessage } = useMessages(chatId);
  const replyTo = useReply((s) => s.replyTo);
  const clearReply = useReply((s) => s.clear);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [text]);

  // When a reply target is set, focus the textarea so the user can type.
  useEffect(() => {
    if (replyTo) taRef.current?.focus();
  }, [replyTo]);

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    taRef.current?.focus();
  };

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    if (trimmed.length > MAX_LEN) {
      toast.error(`Сообщение слишком длинное (макс. ${MAX_LEN} символов)`);
      return;
    }
    setSending(true);
    setText("");
    const replyId = replyTo?.id ?? null;
    clearReply();
    try {
      await sendMessage(trimmed, replyId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось отправить";
      toast.error(msg);
      setText(trimmed);
      if (replyTo) useReply.getState().setReplyTo(replyTo);
    } finally {
      setSending(false);
      taRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
    if (e.key === "Escape" && replyTo) {
      e.preventDefault();
      clearReply();
    }
  };

  return (
    <div className="border-t bg-card/95 backdrop-blur">
      <ReplyPreview />
      <div className="px-3 sm:px-6 py-3 flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={replyTo ? "Ответьте на сообщение…" : "Напишите сообщение…"}
            rows={1}
            disabled={disabled || sending}
            maxLength={MAX_LEN}
            className={cn(
              "min-h-[44px] max-h-40 resize-none pr-10 scrollbar-thin",
              "rounded-2xl bg-background border focus-visible:ring-1 focus-visible:ring-primary",
            )}
          />
        </div>
        <EmojiPicker onPick={insertEmoji} />
        <Button
          onClick={submit}
          disabled={disabled || sending || !text.trim()}
          size="icon"
          className="h-11 w-11 rounded-full shrink-0"
          aria-label="Отправить сообщение"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
      <p className="px-4 pb-1.5 text-[10px] text-muted-foreground">
        Enter — отправить, Shift+Enter — новая строка{replyTo ? ", Esc — отмена ответа" : ""}
      </p>
    </div>
  );
}
