// Stats Card Component
import {TrendingUp,Icon} from "lucide-react";

const StatsCard = ({ title, value, change, icon: Icon, trend }) => {
    return (
        <div className="bg-[#181818] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/60 text-sm font-medium">{title}</p>
                    <p className="text-white text-2xl font-bold mt-1">{value}</p>
                    <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`} />
                        <span className={`text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {change}
            </span>
                        <span className="text-white/60 text-sm">vs last month</span>
                    </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                    <Icon className="w-6 h-6 text-white/80" />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;