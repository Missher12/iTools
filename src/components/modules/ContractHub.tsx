import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  FileEdit,
  Download,
  History,
  Eye,
  Trash2,
  AlertTriangle,
  FileCheck,
  Clock,
  ArrowRight,
  X,
  Bell,
  Sparkles,
  Send,
  Bot,
  User,
  FileCode,
  Paperclip,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Settings2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export default function ContractHub() {
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [aiInput, setAiInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    title: "",
    party: "",
    date: "",
    type: "",
    amount: ""
  });

  const contractFields = [
    { key: "title", label: "合同名称", required: true },
    { key: "party", label: "对方单位", required: true },
    { key: "date", label: "签署日期", required: false },
    { key: "type", label: "合同类型", required: false },
    { key: "amount", label: "合同金额", required: false },
  ];

  const [auditFeedback, setAuditFeedback] = useState("");
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [newContractStep, setNewContractStep] = useState(1);
  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContract, setGeneratedContract] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setParsedData(results.data);
          setHeaders(results.meta.fields || []);
          setImportStep(2);
          // Auto mapping
          const newMapping = { ...fieldMapping };
          results.meta.fields?.forEach(header => {
            if (header.includes("名称") || header.includes("标题") || header.toLowerCase().includes("title")) newMapping.title = header;
            if (header.includes("单位") || header.includes("公司") || header.includes("甲方") || header.toLowerCase().includes("party")) newMapping.party = header;
            if (header.includes("日期") || header.toLowerCase().includes("date")) newMapping.date = header;
            if (header.includes("类型") || header.toLowerCase().includes("type")) newMapping.type = header;
            if (header.includes("金额") || header.toLowerCase().includes("amount")) newMapping.amount = header;
          });
          setFieldMapping(newMapping);
        }
      });
    } else {
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        if (data.length > 0) {
          const fileHeaders = data[0].map(h => String(h));
          const rows = data.slice(1).map(row => {
            const obj: any = {};
            fileHeaders.forEach((h, i) => {
              obj[h] = row[i];
            });
            return obj;
          });
          setParsedData(rows);
          setHeaders(fileHeaders);
          setImportStep(2);
          // Auto mapping
          const newMapping = { ...fieldMapping };
          fileHeaders.forEach(header => {
            if (header.includes("名称") || header.includes("标题") || header.toLowerCase().includes("title")) newMapping.title = header;
            if (header.includes("单位") || header.includes("公司") || header.includes("甲方") || header.toLowerCase().includes("party")) newMapping.party = header;
            if (header.includes("日期") || header.toLowerCase().includes("date")) newMapping.date = header;
            if (header.includes("类型") || header.toLowerCase().includes("type")) newMapping.type = header;
            if (header.includes("金额") || header.toLowerCase().includes("amount")) newMapping.amount = header;
          });
          setFieldMapping(newMapping);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleImport = () => {
    const finalData = parsedData.map(row => ({
      id: `CON-IMP-${Math.floor(Math.random() * 10000)}`,
      title: row[fieldMapping.title] || "未命名合同",
      party: row[fieldMapping.party] || "未知单位",
      date: row[fieldMapping.date] || new Date().toISOString().split('T')[0],
      status: "待审计",
      risk: "低",
      type: row[fieldMapping.type] || "其他合同",
      amount: row[fieldMapping.amount] || "-"
    }));

    toast.success(`成功导入 ${finalData.length} 份合同信息`);
    setIsImportOpen(false);
    setImportStep(1);
    setImportFile(null);
    setParsedData([]);
  };

  // Click outside to close sidebar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSelectedContract(null);
      }
    }
    if (selectedContract) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedContract]);

  const contracts: any[] = [];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.party.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && contract.status === "待审计";
    if (activeTab === "warning") return matchesSearch && (contract.risk === "高" || contract.status === "异常");
    
    return matchesSearch;
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">合同管理中心</h1>
          <p className="text-slate-500 mt-0.5 text-xs">企业级合同全生命周期管理，集成 AI 智能审计与合规检查。</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAuditLogsOpen} onOpenChange={setIsAuditLogsOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="h-9 px-4 border-slate-200 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all">
                  <History className="w-3.5 h-3.5 mr-1.5" /> 审计日志
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">全局审计日志</DialogTitle>
                <DialogDescription className="text-xs">查看所有合同的审计与操作记录。</DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[300px] pr-4 mt-2">
                <div className="space-y-4">
                  {[] as any[]}
                  <div className="p-8 text-center text-slate-400 text-xs font-medium">
                    暂无审计日志
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="h-9 px-4 border-slate-200 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all">
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> 批量导入
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-indigo-600 p-6 text-white">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5" /> 批量导入合同
                </DialogTitle>
                <DialogDescription className="text-indigo-100 text-xs mt-1">
                  支持上传 Excel (.xlsx, .xls) 或 CSV 文件，快速导入合同基础信息。
                </DialogDescription>
              </div>

              <div className="p-6">
                {importStep === 1 && (
                  <div className="space-y-6">
                    <div 
                      className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all cursor-pointer group"
                      onClick={() => importFileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={importFileInputRef} 
                        className="hidden" 
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileSelect}
                      />
                      <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">点击或拖拽文件到此处</p>
                      <p className="text-xs text-slate-500 mt-1">支持 .xlsx, .xls, .csv 格式</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-900">导入提示</p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          请确保文件首行包含字段名称。导入后，您可以手动配置列与合同字段的对应关系。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {importStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-indigo-600" /> 字段映射配置
                      </h3>
                      <Badge variant="outline" className="text-sm bg-slate-50">{importFile?.name}</Badge>
                    </div>

                    <div className="grid gap-4">
                      {contractFields.map((field) => (
                        <div key={field.key} className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-xs font-bold text-slate-600 text-right">
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                          </Label>
                          <select 
                            className="col-span-2 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:ring-2 focus:ring-indigo-500/10 outline-none"
                            value={fieldMapping[field.key]}
                            onChange={(e) => setFieldMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                          >
                            <option value="">-- 请选择文件列 --</option>
                            {headers.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">数据预览 (前 3 条)</p>
                      <div className="space-y-2">
                        {parsedData.slice(0, 3).map((row, i) => (
                          <div key={i} className="text-sm text-slate-600 truncate bg-white p-2 rounded-lg border border-slate-100">
                            {Object.values(row).join(" | ")}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 gap-2">
                {importStep === 2 && (
                  <Button variant="ghost" className="text-xs font-bold" onClick={() => setImportStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
                  </Button>
                )}
                <Button variant="outline" className="text-xs font-bold" onClick={() => setIsImportOpen(false)}>取消</Button>
                {importStep === 2 && (
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6"
                    onClick={handleImport}
                    disabled={!fieldMapping.title || !fieldMapping.party}
                  >
                    开始导入 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewContractOpen} onOpenChange={(open) => { setIsNewContractOpen(open); if(!open) setNewContractStep(1); }}>
            <DialogTrigger
              render={
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9 px-4 text-sm font-bold rounded-xl transition-all">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> 新建合同
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[500px] rounded-2xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">新建合同</DialogTitle>
                <DialogDescription className="text-xs">
                  {newContractStep === 1 ? "选择创建合同的方式。" : "选择一个标准模板开始。"}
                </DialogDescription>
              </DialogHeader>
              
              {newContractStep === 1 ? (
                <div className="grid grid-cols-3 gap-3 py-3">
                  <Button 
                    variant="outline" 
                    className="h-32 flex-col gap-3 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all rounded-xl group"
                    onClick={() => setNewContractStep(2)}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <FileEdit className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">从标准模板生成</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-32 flex-col gap-3 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all rounded-xl group"
                    onClick={() => setNewContractStep(3)}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <Sparkles className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">AI 提示词生成</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-32 flex-col gap-3 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all rounded-xl group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">上传本地文件</span>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={() => { toast.success("文件已上传，正在进行 AI 解析..."); setIsNewContractOpen(false); }} />
                  </Button>
                </div>
              ) : newContractStep === 2 ? (
                <div className="space-y-3 py-2">
                  {[
                    "标准采购合同模板",
                    "技术服务外包协议",
                    "保密协议 (NDA)",
                    "房屋租赁合同 (商业)"
                  ].map((template, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group" onClick={() => { toast.success(`已基于【${template}】创建草稿`); setIsNewContractOpen(false); }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">{template}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-xs font-bold mt-2" onClick={() => setNewContractStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> 返回上一步
                  </Button>
                </div>
              ) : newContractStep === 3 ? (
                isGenerating ? (
                  <div className="space-y-4 py-8">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Bot className="w-12 h-12 text-slate-900 animate-bounce" />
                      <p className="text-sm font-bold text-slate-700">AI 正在为您撰写合同条款...</p>
                      <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 transition-all duration-100" style={{ width: `${generationProgress}%` }} />
                      </div>
                      <p className="text-xs text-slate-400">{generationProgress}%</p>
                    </div>
                  </div>
                ) : generatedContract ? (
                  <div className="space-y-4 py-6">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">合同生成完毕</p>
                      <p className="text-xs text-slate-400 text-center px-4">
                        已根据您的提示词生成标准合同草稿，您可以下载到本地或直接查看。
                      </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1 rounded-xl text-xs font-bold h-10" onClick={() => {
                        setGeneratedContract(false);
                        setPromptInput("");
                        setNewContractStep(1);
                        setIsNewContractOpen(false);
                      }}>
                        完成
                      </Button>
                      <Button 
                        className="flex-1 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold h-10 gap-2"
                        onClick={() => {
                          const blob = new Blob(["合同草稿内容...\n\n基于提示词：" + promptInput], { type: "text/plain;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "AI生成合同草稿.txt";
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success("合同已开始下载");
                        }}
                      >
                        <Download className="w-4 h-4" /> 下载合同
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500">描述您需要的合同内容</Label>
                      <Textarea 
                        placeholder="例如：帮我生成一份软件开发外包合同，甲方是腾讯科技，乙方是某技术服务公司，开发周期为3个月，总金额45万元，需要包含严格的保密条款和违约责任..."
                        className="h-32 resize-none rounded-xl text-sm border-slate-200 focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5"
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 rounded-xl text-xs font-bold h-10" onClick={() => setNewContractStep(1)}>
                        返回
                      </Button>
                      <Button 
                        className="flex-1 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold h-10"
                        disabled={!promptInput || isGenerating}
                        onClick={() => {
                          setIsGenerating(true);
                          setGenerationProgress(0);
                          setGeneratedContract(false);
                          
                          const interval = setInterval(() => {
                            setGenerationProgress(prev => {
                              if (prev >= 100) {
                                clearInterval(interval);
                                return 100;
                              }
                              return prev + 5;
                            });
                          }, 100);

                          setTimeout(() => {
                            clearInterval(interval);
                            setGenerationProgress(100);
                            setIsGenerating(false);
                            setGeneratedContract(true);
                            toast.success("AI 已成功为您生成合同草稿");
                          }, 2000);
                        }}
                      >
                        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> 开始生成</span>
                      </Button>
                    </div>
                  </div>
                )
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid - Matching Dashboard Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: "本月审计总数", value: "128", trend: "+12%", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "自动通过率", value: "85%", trend: "+5.2%", icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "高风险拦截", value: "12", trend: "-2", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "待办提醒", value: "5", trend: "+1", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className={cn(stat.bg, "p-1 rounded-lg")}>
                    <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                  </div>
                  <div className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    stat.trend.startsWith("+") ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  )}>
                    {stat.trend}
                  </div>
                </div>
                <div className="mt-1.5">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5 tracking-tight">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
        <div className="xl:col-span-3 space-y-4 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <TabsList className="bg-slate-100/50 p-0.5 rounded-lg h-auto self-start border border-slate-200/50">
                <TabsTrigger 
                  value="all" 
                  className="rounded-md px-4 py-1 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                >
                  全部合同
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="rounded-md px-4 py-1 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                >
                  待审计
                </TabsTrigger>
                <TabsTrigger 
                  value="warning" 
                  className="rounded-md px-4 py-1 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                >
                  风险预警
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input 
                    placeholder="搜索合同..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 w-full md:w-48 pl-8 text-sm bg-white border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 transition-all rounded-lg" 
                  />
                </div>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-lg border-slate-200 hover:bg-white hover:border-indigo-200">
                  <Filter className="w-3 h-3 text-slate-400" />
                </Button>
              </div>
            </div>

            <TabsContent value={activeTab} className="m-0 focus-visible:outline-none flex-1">
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredContracts.length > 0 ? (
                    filteredContracts.map((contract, index) => (
                      <motion.div
                        key={contract.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
                          onClick={() => setSelectedContract(contract)}
                        >
                          <CardContent className="p-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                                  <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                                      {contract.title}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                                      {contract.id}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-medium">
                                    <span>{contract.party}</span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-200" />
                                    <span>{contract.type}</span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-200" />
                                    <span>{contract.date}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">金额</p>
                                  <p className="text-sm font-bold text-slate-900">{contract.amount}</p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 min-w-[60px]">
                                  <Badge variant="outline" className={cn(
                                    "font-bold text-[10px] h-3.5 px-1.5 rounded-full border",
                                    contract.status === "已审计" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                    contract.status === "待审计" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                    "bg-rose-50 text-rose-700 border-rose-100"
                                  )}>
                                    {contract.status}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <div className={cn(
                                      "w-1 h-1 rounded-full",
                                      contract.risk === "低" ? "bg-emerald-500" :
                                      contract.risk === "中" ? "bg-amber-500" : "bg-rose-500"
                                    )} />
                                    <span className="text-[10px] font-bold text-slate-500">{contract.risk}风险</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
                                    onClick={(e) => { e.stopPropagation(); }}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-md hover:bg-rose-50 hover:text-rose-600"
                                    onClick={(e) => { e.stopPropagation(); }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center bg-white/50 rounded-xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">暂无合同数据</p>
                      <p className="text-xs text-slate-400 mt-1">点击右上角“新建合同”开始</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6 flex flex-col h-full">
          <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <ShieldCheck className="w-16 h-16" />
            </div>
            <CardHeader className="pb-1.5 pt-4 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                AI 审计概况
              </CardTitle>
              <CardDescription className="text-indigo-100 text-xs">基于 128 份合同的深度分析</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3 relative z-10">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">合规评分</p>
                  <p className="text-xl font-bold">94<span className="text-sm font-normal opacity-60 ml-1">/100</span></p>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "94%" }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-indigo-100 uppercase mb-0.5">异常条款</p>
                  <p className="text-base font-bold">08</p>
                </div>
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-indigo-100 uppercase mb-0.5">待续约</p>
                  <p className="text-base font-bold">03</p>
                </div>
              </div>
              <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none h-8 text-sm font-bold transition-all">
                生成详细报告
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm flex-1">
            <CardHeader className="pb-1.5 pt-3 px-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                待办提醒
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {[
                { text: "确认阿里云租赁协议条款", time: "2h", color: "text-amber-600", bg: "bg-amber-50" },
                { text: "处理 Phase 2 开发合同风险", time: "5h", color: "text-rose-600", bg: "bg-rose-50" },
                { text: "归档 Q1 市场推广合同", time: "1d", color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((todo, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className={cn("w-1.5 h-1.5 rounded-full", todo.color.replace('text', 'bg'))} />
                  <p className="text-sm font-bold text-slate-700 flex-1 truncate">{todo.text}</p>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">{todo.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Contract Detail Sheet */}
      <AnimatePresence>
        {selectedContract && (
          <>
            {/* Backdrop for click-outside */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40"
            />
            <motion.div 
              ref={sidebarRef}
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedContract.title}</h3>
                    <p className="text-sm text-slate-500">{selectedContract.id}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedContract(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-6">
                  <section className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">基本信息</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-500 uppercase">对方单位</p>
                        <p className="text-sm font-medium">{selectedContract.party}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-500 uppercase">合同金额</p>
                        <p className="text-sm font-medium">{selectedContract.amount}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-500 uppercase">签署日期</p>
                        <p className="text-sm font-medium">{selectedContract.date}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-500 uppercase">合同类型</p>
                        <p className="text-sm font-medium">{selectedContract.type}</p>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">AI 审计结果</h4>
                      <Badge className={cn(
                        "text-xs h-4 px-1.5",
                        selectedContract.risk === "低" ? "bg-emerald-500" : "bg-rose-500"
                      )}>
                        {selectedContract.risk}风险
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="flex gap-2">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <p className="text-sm text-emerald-900 leading-relaxed">主体资质审核通过，对方单位信用记录良好。</p>
                        </div>
                      </div>
                      {selectedContract.risk !== "低" && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
                          <div className="flex gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                            <p className="text-sm text-rose-900 leading-relaxed">发现违约责任条款存在不平衡风险，建议增加卖方赔偿上限。</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">人工复核与意见</h4>
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="如果对 AI 审计结果有异议，请在此输入修改意见..."
                        className="text-sm min-h-[80px] resize-none rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                        value={auditFeedback}
                        onChange={(e) => setAuditFeedback(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 text-sm h-8 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => {
                            if(!auditFeedback) { toast.error("请输入修改意见"); return; }
                            toast.success("已提交修改意见，AI 将重新生成条款");
                            
                            // Add to version history
                            const newVersion = {
                              v: `V1.${versionHistory.length + 1}`,
                              date: new Date().toISOString().split('T')[0],
                              user: "当前用户",
                              action: `提交修改意见: ${auditFeedback.length > 10 ? auditFeedback.substring(0, 10) + '...' : auditFeedback}`,
                              downloadable: true
                            };
                            setVersionHistory([newVersion, ...versionHistory]);
                            
                            setAuditFeedback("");
                          }}
                        >
                          提交修改意见
                        </Button>
                        <Button 
                          className="flex-1 text-sm h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          onClick={() => {
                            toast.success("合同已确认通过");
                            setSelectedContract(null);
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> 确认通过
                        </Button>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">版本历史</h4>
                    <div className="space-y-3">
                      {versionHistory.map((v, i) => (
                        <div key={i} className="flex gap-2.5">
                          <div className="flex flex-col items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            {i < versionHistory.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-bold text-slate-900">{v.v}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">{v.date}</span>
                                {v.downloadable && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 text-indigo-600 hover:bg-indigo-50 rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast.success(`开始下载 ${selectedContract.title} ${v.v} 版本`);
                                    }}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5">{v.action} - {v.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50/50">
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="text-sm h-8 rounded-xl border-slate-200 hover:bg-white hover:border-indigo-200 transition-all"
                    onClick={() => {
                      toast.success(`正在下载 ${selectedContract.title}.pdf`);
                    }}
                  >
                    <Download className="w-3 h-3 mr-1.5" /> PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-sm h-8 rounded-xl border-slate-200 hover:bg-white hover:border-indigo-200 transition-all"
                    onClick={() => {
                      toast.success(`正在下载 ${selectedContract.title}.docx`);
                    }}
                  >
                    <FileCode className="w-3 h-3 mr-1.5" /> Word
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
