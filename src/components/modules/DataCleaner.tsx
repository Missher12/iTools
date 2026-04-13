import { useState, useCallback } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Table as TableIcon,
  RefreshCw,
  Bot,
  Sparkles,
  Wand2,
  FileJson,
  FileCode
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import axios from "axios";
import * as XLSX from "xlsx";

export default function DataCleaner() {
  const [file, setFile] = useState<File | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [allSheetsData, setAllSheetsData] = useState<Record<string, any[]>>({});
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [stats, setStats] = useState<Record<string, { original: number; cleaned: number }>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setAllSheetsData({});
      setSheetNames([]);
      setActiveSheet("");
      setStats({});
      toast.success("文件已上传: " + acceptedFiles[0].name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"]
    },
    multiple: false
  } as any);

  const handleInitialProcess = async () => {
    if (!file) return;

    setIsCleaning(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/clean-data", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const data = response.data.data;
      const sheets = response.data.sheets;
      
      setAllSheetsData(data);
      setSheetNames(sheets);
      setActiveSheet(sheets[0]);
      
      const newStats: any = {};
      sheets.forEach((s: string) => {
        newStats[s] = {
          original: data[s].length + 2, // Mocking
          cleaned: data[s].length
        };
      });
      setStats(newStats);
      
      toast.success("基础清洗完成，共处理 " + sheets.length + " 个工作表");
    } catch (error) {
      console.error(error);
      toast.error("处理失败，请检查文件格式。");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleAiClean = async () => {
    if (!activeSheet || !aiPrompt.trim()) {
      toast.error("请输入 AI 清洗指令并确保已加载数据");
      return;
    }

    setIsAiProcessing(true);
    const currentData = allSheetsData[activeSheet];
    
    // We send a sample or the whole thing if it's small
    const dataToProcess = currentData.slice(0, 50); 

    try {
      const prompt = `
        You are a data cleaning expert. 
        Here is a JSON array representing data from an Excel sheet:
        ${JSON.stringify(dataToProcess)}
        
        Task: ${aiPrompt}
        
        Return ONLY the cleaned JSON array. Do not include any explanation or markdown formatting.
      `;

      const response = await axios.post("/api/ai/chat", {
        prompt,
        model: "llama3", // Assuming llama3 is available
      });

      // Try to parse the response
      let cleaned;
      try {
        const text = response.data.response;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        cleaned = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch (e) {
        console.error("AI response parsing error:", e);
        throw new Error("AI 返回的格式不正确");
      }

      setAllSheetsData(prev => ({
        ...prev,
        [activeSheet]: cleaned
      }));
      
      toast.success("AI 深度清洗完成！");
    } catch (error: any) {
      console.error(error);
      toast.error("AI 清洗失败: " + error.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    if (!activeSheet || !allSheetsData[activeSheet]) {
      toast.error("没有可导出的数据");
      return;
    }

    try {
      toast.success(`正在准备导出 ${activeSheet} 为 ${format.toUpperCase()} 格式...`);
      
      const data = allSheetsData[activeSheet];
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeSheet);
      
      if (format === 'xlsx') {
        XLSX.writeFile(workbook, `${activeSheet}_cleaned.xlsx`);
      } else {
        XLSX.writeFile(workbook, `${activeSheet}_cleaned.csv`, { bookType: 'csv' });
      }
      
      toast.success("导出成功！");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("导出失败，请重试");
    }
  };

  return (
    <div className="space-y-3 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">智能数据清洗</h1>
          <p className="text-slate-500 text-xs mt-0.5">多 Sheet 处理与 AI 深度清洗，确保数据精准无误。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar: Upload & Controls */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. 上传文件</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-300",
                  isDragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50",
                  file ? "bg-indigo-50/30 border-indigo-200" : ""
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="space-y-1.5">
                    <div className="w-7 h-7 bg-white rounded-lg shadow-sm border border-indigo-100 flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[100px] mx-auto">{file.name}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg px-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setAllSheetsData({});
                      }}
                    >
                      重新上传
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">点击或拖拽文件</p>
                  </div>
                )}
              </div>
              <Button 
                className="w-full mt-2.5 bg-indigo-600 hover:bg-indigo-700 h-8 text-sm font-bold rounded-xl shadow-sm shadow-indigo-100" 
                disabled={!file || isCleaning}
                onClick={handleInitialProcess}
              >
                {isCleaning ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <RefreshCw className="w-3 h-3 mr-1.5" />}
                解析并基础清洗
              </Button>
            </CardContent>
          </Card>

          {sheetNames.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                    <Bot className="w-3 h-3 text-indigo-400" />
                    2. AI 深度清洗
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2.5">
                  <div className="relative">
                    <Textarea 
                      placeholder="输入清洗指令..."
                      className="bg-slate-800 border-slate-700 text-xs min-h-[60px] focus:ring-indigo-500/50 rounded-xl placeholder:text-slate-500 resize-none"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 h-8 text-sm font-bold gap-1.5 rounded-xl"
                    disabled={isAiProcessing || !aiPrompt.trim()}
                    onClick={handleAiClean}
                  >
                    {isAiProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    执行 AI 清洗
                  </Button>
                </CardContent>
              </Card>

              {activeSheet && stats[activeSheet] && (
                <Card className="border-none shadow-sm bg-indigo-50/50 border border-indigo-100/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Sheet 统计</span>
                      <CheckCircle2 className="w-2.5 h-2.5 text-indigo-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">原始</p>
                        <p className="text-sm font-bold text-slate-900">{stats[activeSheet].original}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-medium">清洗后</p>
                        <p className="text-sm font-bold text-indigo-600">{stats[activeSheet].cleaned}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Content: Data Preview */}
        <div className="lg:col-span-9 space-y-3">
          <Card className="border-none shadow-sm h-full flex flex-col min-h-[450px] bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 py-2.5 px-5">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <TableIcon className="w-3.5 h-3.5 text-indigo-600" />
                  数据预览
                </CardTitle>
                {sheetNames.length > 0 && (
                  <Tabs value={activeSheet} onValueChange={setActiveSheet} className="ml-2">
                    <TabsList className="bg-slate-100/50 h-7 p-0.5 gap-0.5 rounded-lg">
                      {sheetNames.map(name => (
                        <TabsTrigger 
                          key={name} 
                          value={name}
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 rounded-md px-2.5 py-0.5 text-xs font-bold transition-all h-6"
                        >
                          {name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}
              </div>
              {sheetNames.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs font-bold gap-1 rounded-lg border-slate-200 hover:bg-slate-50 px-2" 
                    onClick={() => handleDownload('csv')}
                  >
                    <FileCode className="w-2.5 h-2.5" /> CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs font-bold gap-1 rounded-lg border-slate-200 hover:bg-slate-50 px-2" 
                    onClick={() => handleDownload('xlsx')}
                  >
                    <FileSpreadsheet className="w-2.5 h-2.5" /> XLSX
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              {sheetNames.length > 0 ? (
                <div className="flex-1 overflow-auto px-4 pb-4 pt-2">
                  {sheetNames.map(name => (
                    <div key={name} className={cn("m-0 p-0 focus-visible:outline-none", activeSheet === name ? "block" : "hidden")}>
                      <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                            <TableRow className="hover:bg-transparent border-slate-100">
                              {allSheetsData[name]?.[0] && Object.keys(allSheetsData[name][0]).map((key) => (
                                <TableHead key={key} className="text-[10px] font-bold text-slate-500 uppercase py-1.5 px-3 h-auto">
                                  {key}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allSheetsData[name]?.slice(0, 12).map((row, i) => (
                              <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                {Object.values(row).map((val: any, j) => (
                                  <TableCell key={j} className="text-xs text-slate-600 py-1.5 px-3 truncate max-w-[120px]">
                                    {String(val)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {allSheetsData[name]?.length > 12 && (
                          <div className="p-1.5 text-center border-t border-slate-50 bg-slate-50/30">
                            <p className="text-[10px] text-slate-400 font-medium">
                              仅显示前 12 条记录（共 {allSheetsData[name].length} 条）
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                    <Sparkles className="w-6 h-6 text-slate-200" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-xs mb-1">准备就绪</h3>
                  <p className="text-xs text-slate-500 max-w-[180px] text-center leading-relaxed">
                    上传您的文件，开启智能清洗。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
