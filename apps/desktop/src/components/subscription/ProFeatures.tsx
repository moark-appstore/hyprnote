import { Card, CardContent, CardHeader, CardTitle } from "@hypr/ui/components/ui/card";
import { Check, Sparkles } from "lucide-react";

const features = [
  "无限制笔记创建",
  "高级AI功能",
  "优先客服支持",
  "团队协作功能",
  "高级搜索",
  "数据更准确",
];

export function ProFeatures() {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Pro 功能特性
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
