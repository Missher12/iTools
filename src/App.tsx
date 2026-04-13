import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  Bot, 
  Settings, 
  Menu,
  X,
  ChevronRight,
  Search,
  Bell,
  User,
  LogOut,
  Key,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Modules
import Dashboard from "./components/modules/Dashboard";
import ContractHub from "./components/modules/ContractHub";
import DataCleaner from "./components/modules/DataCleaner";
import AIAssistant from "./components/modules/AIAssistant";
import SystemSettings from "./components/modules/SystemSettings";
import Login from "./components/modules/Login";

type Tab = "dashboard" | "contracts" | "data" | "ai" | "settings";

interface UserData {
  username: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    avatar: ""
  });
  const [passwordData, setPasswordData] = useState({
    old: "",
    new: "",
    confirm: ""
  });

  useEffect(() => {
    if (user) {
      setProfileData({ username: user.username, avatar: "" });
    }
  }, [user]);

  const handleUpdateProfile = () => {
    if (!profileData.username) {
      toast.error("用户名不能为空");
      return;
    }
    setUser(prev => prev ? { ...prev, username: profileData.username } : null);
    setIsProfileOpen(false);
    toast.success("个人资料已更新");
  };

  const handleUpdatePassword = () => {
    if (!passwordData.old || !passwordData.new || !passwordData.confirm) {
      toast.error("请填写完整信息");
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("两次输入的新密码不一致");
      return;
    }
    setIsPasswordOpen(false);
    setPasswordData({ old: "", new: "", confirm: "" });
    toast.success("密码已修改，请下次登录时使用新密码");
  };

  if (!user) {
    return (
      <>
        <Login onLogin={setUser} />
        <Toaster position="top-right" />
      </>
    );
  }

  const navItems = [
    { id: "dashboard", label: "仪表盘", icon: LayoutDashboard },
    { id: "contracts", label: "合同管理", icon: FileText },
    { id: "data", label: "数据清洗", icon: Database },
    { id: "ai", label: "AI 助手", icon: Bot },
    { id: "settings", label: "系统设置", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="relative flex flex-col bg-white border-r border-slate-200 z-20"
      >
        <div className="flex items-center h-16 px-6 border-b border-slate-100 bg-slate-50/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
              <Bot className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-none">内网工具箱</span>
                <span className="text-sm text-slate-400 mt-1 font-medium">Enterprise Suite</span>
              </motion.div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  activeTab === item.id 
                    ? "bg-indigo-50 text-indigo-700 font-medium" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  activeTab === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
                {activeTab === item.id && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                  />
                )}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center w-full gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {isSidebarOpen && <span className="text-sm">收起菜单</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="搜索合同、文档或工具..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-50 rounded-xl">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-8 bg-slate-200" />
            
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <div className="flex items-center gap-3 pl-1 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-900 leading-none">{user.username}</p>
                      <p className="text-sm text-slate-500 mt-1.5 font-medium uppercase tracking-wider">{user.role === "admin" ? "超级管理员" : "普通用户"}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all shadow-sm">
                      <User className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                }
              />
              <DropdownMenuContent className="w-56 rounded-2xl border-none shadow-2xl p-2" align="end">
                <div className="px-3 py-2">
                  <p className="text-xs font-bold text-slate-900">{user.username}</p>
                  <p className="text-sm text-slate-500 font-medium">{user.role === "admin" ? "超级管理员" : "普通用户"}</p>
                </div>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="rounded-xl gap-2 text-xs font-medium py-2 px-3 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                    <Camera className="w-4 h-4" /> 编辑头像
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsPasswordOpen(true)} className="rounded-xl gap-2 text-xs font-medium py-2 px-3 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                    <Key className="w-4 h-4" /> 修改密码
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem onClick={() => setUser(null)} className="rounded-xl gap-2 text-xs font-medium py-2 px-3 focus:bg-rose-50 focus:text-rose-600 text-rose-500 cursor-pointer">
                  <LogOut className="w-4 h-4" /> 退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dialogs */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="rounded-2xl border-none shadow-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">编辑个人资料</DialogTitle>
              <DialogDescription className="text-xs">更新您的头像和用户名。</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-indigo-300 transition-all overflow-hidden">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-400 font-medium">点击上传新头像 (支持 JPG, PNG)</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-500 uppercase ml-1">用户名</Label>
                <Input 
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  className="h-10 rounded-xl border-slate-100 bg-slate-50/50" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsProfileOpen(false)} className="rounded-xl text-xs h-9">取消</Button>
              <Button onClick={handleUpdateProfile} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs h-9 px-6">保存更改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogContent className="rounded-2xl border-none shadow-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">修改登录密码</DialogTitle>
              <DialogDescription className="text-xs">为了您的账号安全，请定期更换密码。</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-500 uppercase ml-1">当前密码</Label>
                <Input 
                  type="password"
                  value={passwordData.old}
                  onChange={(e) => setPasswordData({...passwordData, old: e.target.value})}
                  className="h-10 rounded-xl border-slate-100 bg-slate-50/50" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-500 uppercase ml-1">新密码</Label>
                <Input 
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  className="h-10 rounded-xl border-slate-100 bg-slate-50/50" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-500 uppercase ml-1">确认新密码</Label>
                <Input 
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  className="h-10 rounded-xl border-slate-100 bg-slate-50/50" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsPasswordOpen(false)} className="rounded-xl text-xs h-9">取消</Button>
              <Button onClick={handleUpdatePassword} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs h-9 px-6">确认修改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Content Area */}
        <div className="flex-1 overflow-x-hidden overflow-y-scroll bg-[#fcfdfe]">
          <div className="max-w-[1600px] mx-auto p-8 h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full"
              >
                {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
                {activeTab === "contracts" && <ContractHub />}
                {activeTab === "data" && <DataCleaner />}
                {activeTab === "ai" && <AIAssistant />}
                {activeTab === "settings" && <SystemSettings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
