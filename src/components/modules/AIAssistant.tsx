import { useState, useRef, useEffect, ChangeEvent } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Loader2, 
  Sparkles,
  Cpu,
  Paperclip,
  File as FileIcon,
  X,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "您好！我是您的智能助手。您可以上传合同文件让我帮您分析，或者直接向我提问。", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0 || isLoading) return;

    let content = input;
    if (attachments.length > 0) {
      content += `\n\n[附件: ${attachments.map(f => f.name).join(", ")}]`;
    }

    const userMsg: Message = { role: "user", content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      // Mock API call since we removed the local Ollama config
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = { data: { response: "这是一个模拟的 AI 回复。在实际应用中，这里将连接到企业级大模型。" } };

      const assistantMsg: Message = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error(error);
      toast.error("无法连接到 AI 服务，请检查网络。");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "抱歉，我无法连接到 AI 服务。请稍后再试。",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
      toast.success(`已添加 ${newFiles.length} 个附件`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI 智能助手</h1>
          <p className="text-slate-500 mt-0.5 text-xs">基于企业级大模型能力，确保数据不出内网，支持文档分析与智能问答。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-sm font-bold">AI 模型: 已连接</span>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-sm">
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth" ref={scrollRef}>
          <div className="space-y-8 max-w-4xl mx-auto">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-transform hover:scale-105",
                  msg.role === "user" ? "bg-indigo-600 border-indigo-500" : "bg-white border-slate-100"
                )}>
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[85%] space-y-1",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-3 rounded-xl text-[13px] leading-relaxed shadow-sm border",
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none border-indigo-500" 
                      : "bg-white text-slate-800 border-slate-100 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <p className="text-sm text-slate-400 px-1 font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">正在思考中...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-3 flex flex-wrap gap-2"
                >
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm group">
                      <FileIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-sm font-bold text-slate-600 truncate max-w-[120px]">{file.name}</span>
                      <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative group">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="输入您的问题，例如：'帮我分析这份合同的违约责任'..."
                className="pl-14 pr-28 py-7 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-indigo-500/10 focus:border-indigo-200 transition-all text-sm"
              />
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  multiple 
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  onClick={() => setMessages([messages[0]])}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="h-10 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-5 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-400 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3 h-3 text-indigo-400" /> 快速提问：
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "合同审计", prompt: "请帮我审计这份合同的潜在风险" },
                  { label: "条款生成", prompt: "请生成一段标准的保密协议条款" },
                  { label: "数据解释", prompt: "请解释一下这些清洗后的数据趋势" }
                ].map(tag => (
                  <button 
                    key={tag.label}
                    onClick={() => setInput(tag.prompt)}
                    className="text-sm bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-medium shadow-sm"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { cn } from "@/lib/utils";
