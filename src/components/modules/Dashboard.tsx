import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Bot
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard({ onNavigate }: { onNavigate?: (tab: "dashboard" | "contracts" | "data" | "ai" | "settings") => void }) {
  const stats = [
    { label: "待办提醒", value: "5", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", trend: "+2" },
    { label: "已完成审计", value: "156", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%" },
    { label: "高风险拦截", value: "12", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", trend: "-1" },
    { label: "AI 生成合同", value: "45", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+8" },
  ];

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">欢迎回来，管理员</h1>
          <p className="text-slate-500 mt-0.5 text-xs">这是您今天的内网工具概览，一切运行正常。</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">
          <Clock className="w-3 h-3" />
          最后更新: 2024-03-15 10:30
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all group cursor-default bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className={cn(stat.bg, "p-1 rounded-lg transition-transform group-hover:scale-110 duration-300")}>
                    <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    stat.trend.startsWith("+") ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  )}>
                    <TrendingUp className="w-2 h-2" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">最近合同动态</CardTitle>
              <CardDescription className="text-xs">最近 7 天的合同审计与生成记录</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-sm font-bold h-7"
              onClick={() => onNavigate?.("contracts")}
            >
              查看全部 <ArrowUpRight className="w-2.5 h-2.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <div className="space-y-0.5">
              {[
                { title: "2024年度采购框架协议", type: "采购合同", status: "审计中", time: "2小时前", party: "阿里云" },
                { title: "技术服务外包合同-云服务", type: "技术合同", status: "已完成", time: "5小时前", party: "腾讯云" },
                { title: "办公场地租赁协议补充条款", type: "租赁合同", status: "待审计", time: "昨天", party: "万科物业" },
                { title: "保密协议 (NDA) - 合作伙伴", type: "法律文书", status: "已完成", time: "2天前", party: "字节跳动" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-all group cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                      <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{item.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.type} • {item.party}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold border",
                      item.status === "已完成" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                      item.status === "审计中" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-slate-50 text-slate-500 border-slate-200"
                    )}>
                      {item.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium w-12 text-right">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Bot className="w-16 h-16" />
            </div>
            <CardHeader className="pb-1.5 pt-3 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bot className="w-3 h-3" />
                AI 助手建议
              </CardTitle>
              <CardDescription className="text-indigo-100 text-[10px]">基于最近审计结果的智能提醒</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 relative z-10 px-4 pb-4">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                <p className="text-sm text-white leading-relaxed">
                  发现 3 份合同存在<span className="font-bold text-indigo-200">违约责任条款模糊</span>的风险。
                </p>
              </div>
              <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none h-7 text-sm font-bold">
                立即处理风险
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-1.5 pt-3 px-4">
              <CardTitle className="text-sm font-bold text-slate-900">系统通知</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 flex gap-2">
                <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  待办提醒：有 5 份采购合同将在 30 天内到期，请及时处理。
                </p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  系统已成功接入企业级大模型，AI 审计功能已就绪。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

