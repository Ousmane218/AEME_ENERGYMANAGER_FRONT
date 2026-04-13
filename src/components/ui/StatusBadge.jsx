import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { REPORT_STATUS } from "@/lib/constants";

export const StatusBadge = ({ status, className }) => {
    const getStyles = () => {
        switch(status) {
            case REPORT_STATUS.APPROVED: return 'bg-green-50 text-green-600 border-green-100 shadow-sm hover:bg-green-100';
            case REPORT_STATUS.REJECTED: return 'bg-red-50 text-red-600 border-red-100 shadow-sm hover:bg-red-100';
            case REPORT_STATUS.SUBMITTED:
            case REPORT_STATUS.PENDING:
            case REPORT_STATUS.EN_ATTENTE: return 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm hover:bg-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100 shadow-sm';
        }
    };
    return <Badge className={cn("text-[10px] font-black uppercase tracking-tight px-3 h-6 rounded-lg", getStyles(), className)}>{status || 'PENDING'}</Badge>;
};
