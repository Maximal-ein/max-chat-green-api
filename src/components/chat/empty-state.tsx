"use client";

import { MessageCircle, ShieldCheck, Zap, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";

export function EmptyChat() {
  return (
    <div className="flex-1 chat-bg flex flex-col relative">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="relative mx-auto mb-5"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              >
                <MessageCircle className="h-12 w-12" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2
            className="text-2xl font-semibold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Добро пожаловать в MAX Chat
          </motion.h2>

          <motion.p
            className="text-sm text-muted-foreground mt-2 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Выберите чат слева или создайте новый, чтобы начать переписку с
            пользователем MAX. Сообщения отправляются и принимаются через
            GREEN-API.
          </motion.p>

          <motion.div
            className="mt-6 inline-flex"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <NewChatDialog />
          </motion.div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <Feature icon={<Zap className="h-4 w-4" />} title="Быстро" text="Long-poll 5 сек, автообновление" delay={0.5} />
            <Feature icon={<Lock className="h-4 w-4" />} title="Безопасно" text="Токен не покидает сервер" delay={0.6} />
            <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Текстовые" text="Согласно тестовому заданию" delay={0.7} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  delay: number;
}) {
  return (
    <motion.div
      className="rounded-xl border bg-card/80 backdrop-blur p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{text}</p>
    </motion.div>
  );
}
