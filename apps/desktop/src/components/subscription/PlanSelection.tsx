import { GiteeAiAppPaymentPlan, GiteeAiPaymentPeriod } from "@hypr/plugin-gitee-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@hypr/ui/components/ui/card";
import { Check, Star } from "lucide-react";

interface PlanSelectionProps {
  subscriptionPlans: GiteeAiAppPaymentPlan[];
  selectedPlan: GiteeAiPaymentPeriod;
  onPlanChange: (plan: GiteeAiPaymentPeriod) => void;
}

export function PlanSelection({
  subscriptionPlans,
  selectedPlan,
  onPlanChange,
}: PlanSelectionProps) {
  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">选择套餐</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptionPlans?.map((plan) => (
            <div
              key={plan.ident}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedPlan === plan.period
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={() => onPlanChange(plan.period)}
            >
              {plan.ident === "monthly" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    推荐
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPlan === plan.period
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPlan === plan.period && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{plan.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      /{plan.period === "DAY" ? "天" : "月"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
