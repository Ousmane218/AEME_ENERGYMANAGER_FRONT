import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Search, Trash2, Filter, Download, MoreHorizontal, ChevronRight, Calendar, Building2 } from 'lucide-react';
import { getMyReports, deleteReport, getAllReports } from '../../services/reportService';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn, formatDate } from "@/lib/utils";

const ReportsList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const targetedUserId = searchParams.get('userId');
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            // If we have a targeted user, we load ALL reports and then filter.
            // (Assuming permissions allow or the backend handles it gracefully)
            const data = targetedUserId ? await getAllReports() : await getMyReports();
            
            let filteredData = data || [];
            if (targetedUserId) {
                // Filter specifically by the ID we want
                // Note: The structure of report might have user.id or createdBy
                // Based on previous analysis, we'll try to match by some identifier or trust the backend's result if we had a specific endpoint.
                // Since there is no getReportsByUserId, we filter the full list.
                // We'll check for user.id or a similar field. 
                // In AdminUserDetail it used reportsData directly from getReportsByUser(userId).
                // I'll add getReportsByUser to reportService if needed, but let's try filtering first.
                filteredData = (data || []).filter(r => r.userId === targetedUserId || r.createdBy === targetedUserId);
            }

            const sortedData = filteredData.sort((a, b) => new Date(b.createdAt || b.reportDate || 0) - new Date(a.createdAt || a.reportDate || 0));
            setReports(sortedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Voulez-vous supprimer définitivement ce rapport ?')) return;
        try {
            await deleteReport(id);
            setReports(reports.filter(r => r.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredReports = reports.filter(report => {
        const matchFilter =
            filter === 'All' ||
            (filter === 'Submitted' && report.reportStatus === 'SUBMITTED') ||
            (filter === 'Approved'  && report.reportStatus === 'APPROVED')  ||
            (filter === 'Rejected'  && report.reportStatus === 'REJECTED');
        const matchSearch =
            report.nomGestionnaire?.toLowerCase().includes(search.toLowerCase()) ||
            report.serviceAppartenance?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        Archives des Rapports
                        {!loading && <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0">{reports.length}</Badge>}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        Historique complet de vos soumissions et relevés énergétiques.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => navigate('/reports/new')}
                        className="h-10 gap-2 shadow-xl font-bold bg-primary hover:bg-primary/95 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={18} /> Nouveau Rapport
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="border-none shadow-2xl shadow-black/5 bg-white/60 backdrop-blur-sm overflow-hidden rounded-[2rem]">
                <CardHeader className="pb-6 border-b bg-gray-50/50 px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner w-full md:w-auto">
                            {['All', 'Submitted', 'Approved', 'Rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={cn(
                                        "flex-1 md:flex-none px-6 py-2 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest",
                                        filter === status
                                            ? 'bg-white text-primary shadow-md'
                                            : 'text-gray-400 hover:text-gray-600'
                                    )}
                                >
                                    {status === 'All' ? 'Tous' : 
                                     status === 'Submitted' ? 'Soumis' : 
                                     status === 'Approved' ? 'Approuvés' : 'Rejetés'}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <Input
                                placeholder="Rechercher par gestionnaire ou service..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 h-12 text-sm bg-white shadow-sm border-2 border-transparent focus:border-primary/20 rounded-2xl transition-all"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                <Plus size={40} className="rotate-45" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">Une erreur est survenue</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchReports} className="rounded-xl">Réessayer</Button>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="p-32 text-center space-y-6">
                            <div className="h-24 w-24 bg-gray-50 text-gray-300 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                                <FileText size={48} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-gray-900 uppercase tracking-tight">Aucun document trouvé</p>
                                <p className="text-sm text-muted-foreground font-medium">Affinez vos filtres ou créez votre premier rapport.</p>
                            </div>
                            <Button variant="outline" onClick={() => {setFilter('All'); setSearch('');}} className="rounded-xl border-gray-200">Effacer les filtres</Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/30">
                                    <TableRow className="hover:bg-transparent border-b-gray-100">
                                        <TableHead className="px-8 py-5 h-auto text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Gestionnaire</TableHead>
                                        <TableHead className="py-5 h-auto text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Département</TableHead>
                                        <TableHead className="py-5 h-auto text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Date Expertise</TableHead>
                                        <TableHead className="py-5 h-auto text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">État</TableHead>
                                        <TableHead className="px-8 py-5 h-auto text-[10px] font-bold uppercase tracking-[0.2em] text-right text-muted-foreground">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.map((report) => (
                                        <TableRow 
                                            key={report.id}
                                            className="group cursor-pointer hover:bg-primary/[0.02] transition-all border-b-gray-50 last:border-0"
                                            onClick={() => navigate(`/reports/${report.id}`)}
                                        >
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 rounded-2xl bg-white border-2 border-gray-50 flex items-center justify-center text-primary font-bold shadow-sm group-hover:scale-110 group-hover:border-primary/20 transition-all">
                                                        {report.nomGestionnaire?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{report.nomGestionnaire || 'Expert Anonyme'}</div>
                                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">REF-{report.id.toString().slice(-6).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 bg-gray-100/50 px-3 py-1 rounded-lg w-fit shadow-inner">
                                                    <Building2 size={12} className="text-primary/40" />
                                                    <span className="uppercase tracking-tight">{report.serviceAppartenance || 'Service non défini'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                                    <Calendar size={14} className="text-primary/30" />
                                                    {formatDate(report.reportDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <StatusBadge status={report.reportStatus} />
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-10 w-10 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl border border-transparent hover:border-red-100"
                                                        onClick={(e) => handleDelete(e, report.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                    <div className="h-10 w-10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                <div className="p-6 bg-gray-50/50 border-t flex items-center justify-between px-8">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">Interface Gouvernementale Sécurisée</p>
                    <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base de données à jour</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportsList;