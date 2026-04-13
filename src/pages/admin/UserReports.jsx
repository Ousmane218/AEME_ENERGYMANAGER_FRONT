import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, XCircle, Download, Loader2, Calendar, User, Info, CheckCircle } from 'lucide-react';
import { getReportsByUser, approveReport, rejectReport } from '../../services/adminService';
import { downloadReport } from '../../services/reportService';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn, formatDate } from "@/lib/utils";

const UserReports = () => {
    const { userId } = useParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, [userId]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getReportsByUser(userId);
            setReports(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (reportId) => {
        try {
            setActionLoading(reportId);
            await approveReport(reportId);
            setReports(reports.map(r => r.id === reportId ? { ...r, reportStatus: 'APPROVED' } : r));
        } catch (err) {
            alert('Erreur: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (reportId) => {
        try {
            setActionLoading(reportId);
            await rejectReport(reportId);
            setReports(reports.map(r => r.id === reportId ? { ...r, reportStatus: 'REJECTED' } : r));
        } catch (err) {
            alert('Erreur: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownload = (report) => {
        downloadReport(report.id, report.fileName || `rapport-${report.id}.pdf`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="animate-spin text-primary/40" size={40} />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Chargement des rapports...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-5">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigate('/admin/users')}
                        className="h-11 w-11 rounded-xl shadow-sm hover:bg-primary hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="text-primary group-hover:text-white" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Rapports de l'Agent</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-1 flex items-center gap-2">
                            <User size={12} className="text-primary" /> ID: {userId} • Revue Administrative
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold py-1 px-3">
                        {reports.length} RAPPORTS TROUVÉS
                    </Badge>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl flex items-center gap-4">
                    <XCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5">
                {reports.length > 0 ? reports.map((report) => (
                    <Card key={report.id} className="border-none shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 bg-white overflow-hidden group">
                        <div className={cn(
                            "absolute top-0 left-0 w-1.5 h-full transition-colors",
                            report.reportStatus === 'APPROVED' ? 'bg-green-500' : 
                            report.reportStatus === 'REJECTED' ? 'bg-red-500' : 'bg-primary'
                        )} />
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center">
                                <div className="p-6 flex-1 flex items-center gap-6">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                        report.reportStatus === 'APPROVED' ? 'bg-green-50 text-green-600' : 
                                        report.reportStatus === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                    )}>
                                        <FileText size={28} />
                                    </div>
                                    <div className="space-y-1.5 overflow-hidden">
                                        <h3 className="text-lg font-bold text-gray-900 truncate leading-tight group-hover:text-primary transition-colors">
                                            {report.title || `Rapport Mensuel - ${new Date(report.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                                                <Calendar size={13} className="text-primary/40" />
                                                Soumis le {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                            <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>
                                            <StatusBadge status={report.reportStatus} className="border-2 px-2.5 py-0" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50/50 md:bg-transparent border-t md:border-t-0 flex flex-wrap items-center justify-end gap-3 px-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload(report)}
                                        className="h-10 rounded-xl px-5 text-[11px] font-bold uppercase tracking-widest border-gray-200 hover:bg-white hover:text-primary hover:border-primary/20 shadow-sm"
                                    >
                                        <Download size={16} className="mr-2" />
                                        PDF
                                    </Button>
                                    
                                    {(!report.reportStatus || report.reportStatus === 'PENDING' || report.reportStatus === 'EN ATTENTE' || report.reportStatus === 'SUBMITTED') && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => handleApprove(report.id)}
                                                disabled={actionLoading === report.id}
                                                className="h-10 rounded-xl px-5 text-[11px] font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100"
                                            >
                                                {actionLoading === report.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} className="mr-2" />}
                                                Approuver
                                            </Button>
                                            
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleReject(report.id)}
                                                disabled={actionLoading === report.id}
                                                className="h-10 rounded-xl px-5 text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-red-100"
                                            >
                                                {actionLoading === report.id ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} className="mr-2" />}
                                                Rejeter
                                            </Button>
                                        </div>
                                    )}
                                    
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 hover:text-primary rounded-xl">
                                        <Info size={20} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="bg-white p-20 rounded-[2.5rem] border-4 border-dashed border-gray-100 text-center space-y-4">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                           <FileText size={40} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">Aucun rapport disponible</p>
                            <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">Cet agent n'a pas encore soumis de relevés pour la période en cours.</p>
                        </div>
                        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4 rounded-xl border-gray-200">Retourner à la liste</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserReports;
