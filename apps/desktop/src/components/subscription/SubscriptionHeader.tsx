import { Crown } from "lucide-react";

export function SubscriptionHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 pt-16 pb-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          升级到 Pro 版本
        </h1>
        <p className="text-xl text-blue-100 mb-2">当前订阅的版本为：免费版</p>
        <p className="text-lg text-blue-200">
          解锁全部高级功能，提升您的工作效率
        </p>
      </div>
    </div>
  );
}
