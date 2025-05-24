import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@hypr/ui/components/ui/card";
import { Input } from "@hypr/ui/components/ui/input";
import { Label } from "@hypr/ui/components/ui/label";
import { GiteeAiPaymentPeriod } from "@hypr/plugin-gitee-ai";

interface SubscriptionPeriodProps {
  selectedPlan: GiteeAiPaymentPeriod;
  periodQuantity: number;
  onPeriodQuantityChange: (quantity: number) => void;
}

export function SubscriptionPeriod({
  selectedPlan,
  periodQuantity,
  onPeriodQuantityChange,
}: SubscriptionPeriodProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>订阅周期</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label htmlFor="period" className="text-base font-medium">
            订阅 {selectedPlan === "DAY" ? "天数" : "月数"}
          </Label>
          <div className="flex items-center space-x-4">
            <Input
              id="period"
              type="number"
              min="1"
              max="36"
              value={periodQuantity}
              onChange={(e) =>
                onPeriodQuantityChange(
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              className="w-24 h-12 text-center text-lg font-semibold border-2 focus:border-blue-500"
            />
            <span className="text-lg text-gray-600 font-medium">
              {selectedPlan === "DAY" ? "天" : "个月"}
            </span>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡{" "}
              {selectedPlan === "DAY"
                ? "建议订阅1-30天，体验完整功能"
                : "建议订阅3-12个月，享受更优惠的价格"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
