import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Cpu,
  Database,
  Users,
  Bell,
  Lock,
  Globe,
  Save,
  RefreshCw,
  Server,
  Cloud,
  Terminal,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Phone,
  UserPlus,
  Upload,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  Info,
  Monitor,
  Languages,
  Clock as ClockIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Account {
  id: string;
  username: string;
  phone: string;
  role: "admin" | "legal" | "analyst" | "user";
  status: "active" | "disabled";
  permissions: string[];
}

export default function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState({
    username: "",
    phone: "",
    password: "",
    role: "user" as Account["role"],
    permissions: ["dashboard"] as string[],
  });

  const availablePermissions = [
    { id: "dashboard", label: "仪表盘" },
    { id: "contracts", label: "合同管理" },
    { id: "data", label: "数据清洗" },
    { id: "ai", label: "AI 助手" },
    { id: "settings", label: "系统设置" },
  ];

  const handleAddAccount = () => {
    if (!newAccount.username || !newAccount.phone || !newAccount.password) {
      toast.error("请填写完整信息");
      return;
    }
    const account: Account = {
      id: Math.random().toString(36).substr(2, 9),
      username: newAccount.username,
      phone: newAccount.phone,
      role: newAccount.role,
      status: "active",
      permissions: newAccount.permissions,
    };
    setAccounts([...accounts, account]);
    setIsAddAccountOpen(false);
    setNewAccount({
      username: "",
      phone: "",
      password: "",
      role: "user",
      permissions: ["dashboard"],
    });
    toast.success("账号创建成功");
  };

  const togglePermission = (permissionId: string, isNew: boolean = true) => {
    if (isNew) {
      setNewAccount((prev) => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter((p) => p !== permissionId)
          : [...prev.permissions, permissionId],
      }));
    } else if (editingAccount) {
      setEditingAccount((prev) =>
        prev
          ? {
              ...prev,
              permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter((p) => p !== permissionId)
                : [...prev.permissions, permissionId],
            }
          : null,
      );
    }
  };

  const handleSavePermissions = () => {
    if (editingAccount) {
      setAccounts(
        accounts.map((a) => (a.id === editingAccount.id ? editingAccount : a)),
      );
      setIsEditPermissionsOpen(false);
      toast.success("权限已更新");
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (id === "1") {
      toast.error("无法删除初始管理员账号");
      return;
    }
    setAccounts(accounts.filter((a) => a.id !== id));
    toast.success("账号已删除");
  };

  const [copyrightText, setCopyrightText] = useState("© 2024 Enterprise Intelligence Suite");
  const [loginBg, setLoginBg] = useState("");

  useEffect(() => {
    const savedCopyright = localStorage.getItem("systemCopyright");
    if (savedCopyright) {
      setCopyrightText(savedCopyright);
    }
    const savedBg = localStorage.getItem("loginBackground");
    if (savedBg) {
      setLoginBg(savedBg);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("systemCopyright", copyrightText);
    localStorage.setItem("loginBackground", loginBg);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("系统设置已保存");
    }, 1000);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLoginBg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    if (!updateFile) {
      toast.error("请先选择更新包 (.zip)");
      return;
    }
    setIsUpdating(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setIsUpdating(false);
        setUpdateFile(null);
        toast.success("系统更新成功！正在重启服务...");
      }
    }, 300);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            系统设置
          </h1>
          <p className="text-slate-500 mt-0.5 text-xs">
            管理内网工具箱的全局配置、模型接入与权限控制。
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 h-9 px-5 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 text-xs"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          保存更改
        </Button>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-4 shadow-sm inline-flex h-auto overflow-x-auto max-w-full">
          <TabsTrigger
            value="ai"
            className="rounded-lg px-6 py-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 transition-all font-bold text-sm whitespace-nowrap"
          >
            AI 模型接入
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="rounded-lg px-6 py-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 transition-all font-bold text-sm whitespace-nowrap"
          >
            权限与安全
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="rounded-lg px-6 py-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 transition-all font-bold text-sm whitespace-nowrap"
          >
            常规设置
          </TabsTrigger>
          <TabsTrigger
            value="update"
            className="rounded-lg px-6 py-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 transition-all font-bold text-sm whitespace-nowrap"
          >
            系统更新
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-50">
                  <CardTitle className="text-sm font-bold text-slate-900">
                    大模型配置
                  </CardTitle>
                  <CardDescription className="text-sm">
                    配置 AI 推理引擎的连接参数（支持 OpenAI 兼容接口）。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-5 px-5 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                        API Base URL
                      </Label>
                      <Input
                        placeholder="https://api.openai.com/v1"
                        defaultValue="https://api.openai.com/v1"
                        className="h-9 rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                        模型名称 (Model Name)
                      </Label>
                      <Input
                        placeholder="例如: gpt-4o, claude-3-5-sonnet"
                        defaultValue="gpt-4o"
                        className="h-9 rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                      API Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="sk-..."
                        className="h-9 rounded-xl border-slate-200 text-xs"
                      />
                      <Button
                        variant="outline"
                        className="h-9 px-4 rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-sm"
                      >
                        测试连接
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 font-medium ml-1">
                      您的 API Key 仅保存在本地浏览器中，不会上传至服务器。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Activity className="w-16 h-16" />
                </div>
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-xs font-bold flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    引擎状态
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10 px-5 pb-5">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                    <span className="text-sm text-slate-400 font-medium">
                      服务状态
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold text-xs h-4">
                      运行中
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                    <span className="text-sm text-slate-400 font-medium">
                      当前模型
                    </span>
                    <span className="text-sm font-mono font-bold text-indigo-300">
                      gpt-4o
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                    <span className="text-sm text-slate-400 font-medium">
                      API 延迟
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold">124 ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-indigo-100 flex-shrink-0">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-900">
                      LM Studio 提示
                    </p>
                    <p className="text-sm text-indigo-800 mt-1 leading-relaxed font-medium">
                      使用 LM Studio 时，请确保开启了 "CORS" 选项。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="permissions"
          className="mt-0 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      账号管理
                    </CardTitle>
                    <CardDescription className="text-sm">
                      管理系统访问账号及其对应的权限角色。
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isAddAccountOpen}
                    onOpenChange={setIsAddAccountOpen}
                  >
                    <DialogTrigger
                      render={
                        <Button
                          size="sm"
                          className="h-8 bg-indigo-600 hover:bg-indigo-700 gap-1.5 rounded-xl text-sm font-bold"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          新增账号
                        </Button>
                      }
                    />
                    <DialogContent className="rounded-2xl border-none shadow-2xl max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-base font-bold">
                          新增访问账号
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          为新成员创建账号并分配初始权限。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                            用户名
                          </Label>
                          <Input
                            placeholder="输入姓名或昵称"
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50"
                            value={newAccount.username}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                username: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                            手机号 / 登录账号
                          </Label>
                          <Input
                            placeholder="输入 11 位手机号"
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50"
                            value={newAccount.phone}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                            登录密码
                          </Label>
                          <Input
                            type="password"
                            placeholder="设置初始密码"
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50"
                            value={newAccount.password}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                            分配角色
                          </Label>
                          <Select
                            value={newAccount.role}
                            onValueChange={(v: any) =>
                              setNewAccount({ ...newAccount, role: v })
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-slate-50/50">
                              <SelectValue placeholder="选择角色" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="admin">超级管理员</SelectItem>
                              <SelectItem value="legal">法务专员</SelectItem>
                              <SelectItem value="analyst">
                                数据分析师
                              </SelectItem>
                              <SelectItem value="user">普通用户</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                            功能权限
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            {availablePermissions.map((perm) => (
                              <div
                                key={perm.id}
                                className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-100"
                              >
                                <Checkbox
                                  id={`new-${perm.id}`}
                                  checked={newAccount.permissions.includes(
                                    perm.id,
                                  )}
                                  onCheckedChange={() =>
                                    togglePermission(perm.id, true)
                                  }
                                  className="rounded-sm h-3.5 w-3.5"
                                />
                                <label
                                  htmlFor={`new-${perm.id}`}
                                  className="text-sm font-bold text-slate-600 cursor-pointer"
                                >
                                  {perm.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setIsAddAccountOpen(false)}
                          className="rounded-xl text-xs h-9"
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleAddAccount}
                          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs h-9 px-6"
                        >
                          确认创建
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isEditPermissionsOpen}
                    onOpenChange={setIsEditPermissionsOpen}
                  >
                    <DialogContent className="rounded-2xl border-none shadow-2xl max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-base font-bold">
                          编辑账号权限
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          修改 {editingAccount?.username} 的系统访问权限。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-2">
                          {availablePermissions.map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-100"
                            >
                              <Checkbox
                                id={`edit-${perm.id}`}
                                checked={editingAccount?.permissions.includes(
                                  perm.id,
                                )}
                                onCheckedChange={() =>
                                  togglePermission(perm.id, false)
                                }
                                className="rounded-sm h-3.5 w-3.5"
                              />
                              <label
                                htmlFor={`edit-${perm.id}`}
                                className="text-sm font-bold text-slate-600 cursor-pointer"
                              >
                                {perm.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setIsEditPermissionsOpen(false)}
                          className="rounded-xl text-xs h-9"
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleSavePermissions}
                          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs h-9 px-6"
                        >
                          保存修改
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50">
                          <th className="px-5 py-3 text-sm font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            用户信息
                          </th>
                          <th className="px-5 py-3 text-sm font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            角色
                          </th>
                          <th className="px-5 py-3 text-sm font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            权限范围
                          </th>
                          <th className="px-5 py-3 text-sm font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                            状态
                          </th>
                          <th className="px-5 py-3 text-sm font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {accounts.map((account) => (
                          <tr
                            key={account.id}
                            className="hover:bg-slate-50/30 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                  {account.username[0]}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">
                                    {account.username}
                                  </p>
                                  <p className="text-sm text-slate-400 font-medium">
                                    {account.phone}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs font-bold px-2 py-0.5 border-none",
                                  account.role === "admin"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : account.role === "legal"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : account.role === "analyst"
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-slate-100 text-slate-500",
                                )}
                              >
                                {account.role === "admin"
                                  ? "超级管理员"
                                  : account.role === "legal"
                                    ? "法务专员"
                                    : account.role === "analyst"
                                      ? "数据分析师"
                                      : "普通用户"}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 max-w-[150px]">
                              <div className="flex gap-1 overflow-hidden whitespace-nowrap mask-linear-fade">
                                {account.permissions.map((p) => (
                                  <Badge
                                    key={p}
                                    variant="outline"
                                    className="text-[10px] font-medium px-1.5 py-0 border-slate-200 text-slate-500 whitespace-nowrap flex-shrink-0"
                                  >
                                    {
                                      availablePermissions.find(
                                        (ap) => ap.id === p,
                                      )?.label
                                    }
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-sm font-bold text-slate-600">
                                  正常
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                  onClick={() => {
                                    setEditingAccount(account);
                                    setIsEditPermissionsOpen(true);
                                  }}
                                >
                                  <Shield className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                  onClick={() =>
                                    handleDeleteAccount(account.id)
                                  }
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Shield className="w-16 h-16" />
                </div>
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-xs font-bold flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-300" />
                    安全加固
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10 px-5 pb-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-white">
                          双重身份验证
                        </Label>
                        <p className="text-[10px] text-indigo-200">
                          登录时需要手机验证码
                        </p>
                      </div>
                      <Switch className="scale-75 data-[state=checked]:bg-indigo-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-white">
                          异地登录提醒
                        </Label>
                        <p className="text-[10px] text-indigo-200">
                          发现异常 IP 立即通知
                        </p>
                      </div>
                      <Switch
                        defaultChecked
                        className="scale-75 data-[state=checked]:bg-indigo-400"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-white">
                          操作日志全量审计
                        </Label>
                        <p className="text-[10px] text-indigo-200">
                          记录所有敏感操作
                        </p>
                      </div>
                      <Switch
                        defaultChecked
                        className="scale-75 data-[state=checked]:bg-indigo-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-xs font-bold text-slate-900">
                    全局安全策略
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-5 pb-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Checkbox
                        id="p1"
                        defaultChecked
                        className="rounded-sm h-3.5 w-3.5"
                      />
                      <label
                        htmlFor="p1"
                        className="text-sm font-bold text-slate-600 cursor-pointer"
                      >
                        内网 IP 访问限制
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Checkbox
                        id="p2"
                        defaultChecked
                        className="rounded-sm h-3.5 w-3.5"
                      />
                      <label
                        htmlFor="p2"
                        className="text-sm font-bold text-slate-600 cursor-pointer"
                      >
                        敏感操作二次审计
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Checkbox id="p3" className="rounded-sm h-3.5 w-3.5" />
                      <label
                        htmlFor="p3"
                        className="text-sm font-bold text-slate-600 cursor-pointer"
                      >
                        密码过期强制修改
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-5 border-b border-slate-50">
                  <CardTitle className="text-xs font-bold text-slate-900">
                    系统操作日志
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {[] as any[]}
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">
                      暂无操作日志
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="general"
          className="mt-0 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-50">
                  <CardTitle className="text-sm font-bold text-slate-900">
                    常规配置
                  </CardTitle>
                  <CardDescription className="text-sm">
                    调整界面显示、系统信息与区域设置。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-5 px-5 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                        系统名称
                      </Label>
                      <Input
                        defaultValue="内网工具箱"
                        className="h-9 rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                        组织名称
                      </Label>
                      <Input
                        defaultValue="Enterprise Intelligence Suite"
                        className="h-9 rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <Languages className="w-3 h-3" /> 系统语言
                      </Label>
                      <Select defaultValue="zh">
                        <SelectTrigger className="h-9 rounded-xl border-slate-200 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="zh">简体中文</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" /> 时区设置
                      </Label>
                      <Select defaultValue="utc8">
                        <SelectTrigger className="h-9 rounded-xl border-slate-200 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="utc8">
                            (UTC+08:00) 北京, 重庆, 香港
                          </SelectItem>
                          <SelectItem value="utc9">
                            (UTC+09:00) 东京, 首尔
                          </SelectItem>
                          <SelectItem value="utc0">
                            (UTC+00:00) 伦敦, 都柏林
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                        底部版权信息
                      </Label>
                      <Input
                        value={copyrightText}
                        onChange={(e) => setCopyrightText(e.target.value)}
                        className="h-9 rounded-xl border-slate-200 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase ml-1">
                        登录页背景图
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleBgUpload}
                          className="h-9 rounded-xl border-slate-200 text-xs file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                        />
                        {loginBg && (
                          <Button 
                            variant="outline" 
                            className="h-9 px-3 rounded-xl text-xs font-bold"
                            onClick={() => setLoginBg("")}
                          >
                            清除
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-slate-500 uppercase ml-1 tracking-wider">
                      界面主题
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 border-2 border-indigo-600 bg-indigo-50/50 rounded-xl shadow-sm"
                      >
                        <div className="w-full h-4 bg-white rounded shadow-sm border border-indigo-100" />
                        <span className="text-xs font-bold">明亮</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 border-slate-200 rounded-xl hover:bg-slate-50"
                      >
                        <div className="w-full h-4 bg-slate-900 rounded shadow-sm" />
                        <span className="text-xs font-bold">深色</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 border-slate-200 rounded-xl hover:bg-slate-50"
                      >
                        <div className="w-full h-4 bg-gradient-to-r from-white to-slate-900 rounded shadow-sm" />
                        <span className="text-xs font-bold">跟随系统</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-indigo-500" />
                    通知设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-5 pb-5">
                  {[
                    { label: "合同到期提醒", desc: "到期前 30 天发送通知" },
                    { label: "审计异常警报", desc: "发现高风险条款时提醒" },
                    { label: "系统更新通知", desc: "获取最新功能更新" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100"
                    >
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-slate-900">
                          {item.label}
                        </span>
                        <p className="text-xs text-slate-500 font-medium">
                          {item.desc}
                        </p>
                      </div>
                      <Switch defaultChecked={i < 2} className="scale-75" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl shadow-sm">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-amber-100 flex-shrink-0">
                    <Info className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">温馨提示</p>
                    <p className="text-sm text-amber-800 mt-1 leading-relaxed font-medium">
                      修改系统名称和组织名称后，页面标题将同步更新。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="update" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-50">
                  <CardTitle className="text-sm font-bold text-slate-900">
                    系统更新
                  </CardTitle>
                  <CardDescription className="text-sm">
                    上传更新包进行系统热更新升级。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 px-5 pb-6">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group",
                      updateFile
                        ? "border-indigo-300 bg-indigo-50/30"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50",
                    )}
                    onClick={() =>
                      document.getElementById("update-upload")?.click()
                    }
                  >
                    <input
                      id="update-upload"
                      type="file"
                      className="hidden"
                      accept=".zip"
                      onChange={(e) =>
                        setUpdateFile(e.target.files?.[0] || null)
                      }
                    />
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {updateFile
                        ? updateFile.name
                        : "点击或拖拽 ZIP 更新包到此处"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      仅支持 .zip 格式的官方更新包
                    </p>
                  </div>

                  {isUpdating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold text-slate-600">
                        <span>正在解压并校验更新包...</span>
                        <span>请勿刷新页面</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-indigo-600"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3 }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 h-10 px-8 rounded-xl text-xs font-bold gap-2"
                      disabled={!updateFile || isUpdating}
                      onClick={handleUpdate}
                    >
                      {isUpdating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileArchive className="w-4 h-4" />
                      )}
                      立即开始热更新
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <FileArchive className="w-16 h-16" />
                </div>
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-xs font-bold flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-indigo-300" />
                    更新说明
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10 px-5 pb-5">
                  <div className="space-y-2 text-sm text-indigo-100 leading-relaxed">
                    <p>1. 更新过程中请勿关闭或刷新浏览器窗口。</p>
                    <p>2. 系统会自动备份当前版本，如果更新失败将自动回滚。</p>
                    <p>3. 更新完成后，系统会自动重启服务并刷新页面。</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
