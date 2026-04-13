import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bot, Lock, Phone, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface LoginProps {
  onLogin: (user: { username: string; role: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPwdOpen, setIsForgotPwdOpen] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [copyrightText, setCopyrightText] = useState("© 2024 Enterprise Intelligence Suite");
  const [bgImage, setBgImage] = useState('url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070")');

  useEffect(() => {
    const savedCopyright = localStorage.getItem("systemCopyright");
    if (savedCopyright) {
      setCopyrightText(savedCopyright);
    }
    const savedBg = localStorage.getItem("loginBackground");
    if (savedBg) {
      setBgImage(`url("${savedBg}")`);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    setTimeout(() => {
      if (account === "admin" && password === "password") {
        toast.success("登录成功，欢迎回来");
        onLogin({ username: "管理员", role: "admin" });
      } else if (account.length === 11 && password === "123456") {
        toast.success("登录成功");
        onLogin({ username: "用户 " + account.slice(-4), role: "user" });
      } else {
        toast.error("账号或密码错误");
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans bg-slate-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 scale-105"
        style={{
          backgroundImage: bgImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7) blur(2px)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px] z-10 px-4"
      >
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl rounded-[24px] overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 shadow-lg mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">内网工具箱</h1>
              <p className="text-slate-500 text-xs mt-1 font-medium tracking-widest uppercase">Enterprise Intelligence Suite</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">账号 / 手机号</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Phone className="w-4 h-4 text-slate-400" />
                    </div>
                    <Input 
                      type="text"
                      placeholder="请输入账号"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="h-12 pl-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1">密码</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <Input 
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-xs text-slate-600 font-medium">记住登录状态</span>
                </label>
                <button type="button" onClick={() => setIsForgotPwdOpen(true)} className="text-xs text-slate-900 font-bold hover:underline">忘记密码？</button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    登录 <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {copyrightText}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isForgotPwdOpen} onOpenChange={setIsForgotPwdOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">重置密码</DialogTitle>
            <DialogDescription className="text-xs">
              请输入您的手机号码，我们将发送验证码以重置密码。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">手机号码</label>
              <Input 
                placeholder="请输入绑定的手机号码" 
                value={resetPhone}
                onChange={(e) => setResetPhone(e.target.value)}
                className="h-10 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">验证码</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="6位验证码" 
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="h-10 rounded-xl text-sm flex-1"
                />
                <Button variant="outline" className="h-10 rounded-xl text-xs font-bold whitespace-nowrap" onClick={() => toast.success("验证码已发送")}>
                  获取验证码
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">新密码</label>
              <Input 
                type="password"
                placeholder="请输入新密码" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-xl text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForgotPwdOpen(false)} className="rounded-xl text-xs font-bold h-9">取消</Button>
            <Button 
              className="bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold h-9"
              onClick={() => {
                if(!resetPhone || !resetCode || !newPassword) {
                  toast.error("请填写完整信息");
                  return;
                }
                toast.success("密码重置成功，请使用新密码登录");
                setIsForgotPwdOpen(false);
                setResetPhone("");
                setResetCode("");
                setNewPassword("");
              }}
            >
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
