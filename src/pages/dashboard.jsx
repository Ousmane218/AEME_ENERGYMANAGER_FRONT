import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, MessageSquare, ChevronRight, CheckCircle, Clock, XCircle, TrendingUp, Filter, Download, Zap, Plus } from 'lucide-react';
import { getUserProfile } from '../services/profileService';
import { getMyReports, getAllReports } from '../services/reportService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

const Dashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [myReports, setMyReports] = useState([]);
    const [allReports, setAllReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getUserProfile(), getMyReports(), getAllReports()])
            .then(([profileData, myReportsData, allReportsData]) => {
                const sortDesc = (a, b) => new Date(b.createdAt || b.reportDate || 0) - new Date(a.createdAt || a.reportDate || 0);
                setProfile(profileData);
                setMyReports((myReportsData || []).sort(sortDesc));
                setAllReports((allReportsData || []).sort(sortDesc));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        {loading ? <Skeleton className="h-9 w-48" /> : <span>Tableau de Bord</span>}
                        {!loading && <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 px-2 py-0"><span>LIVE</span></Badge>}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        Heureux de vous revoir, <span className="text-primary font-bold">{profile?.firstName || 'Utilisateur'}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="default" size="sm" className="h-10 px-4 gap-2 text-sm font-bold shadow-md bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]" onClick={() => navigate('/reports/new')}>
                        <Plus size={16} /> Nouveau Rapport
                    </Button>
                </div>
            </div>

            
            {/* Ressources & Documents */}
            <div className="space-y-4 pt-4">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-1">Ressources & Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-dashed border-gray-200 bg-gray-50/30 hover:border-green-500/30 hover:bg-green-50/10 transition-all group relative overflow-hidden">
                        <div className="p-6 flex items-start gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <Download size={28} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-base font-black text-gray-900 tracking-tight uppercase">Cadastre Énergétique</h3>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed max-w-[280px]">
                                    Téléchargez le référentiel complet du cadastre énergétique national (Format Excel).
                                </p>
                                <div className="pt-3 flex items-center gap-3">
                                    <a 
                                        href="/documents/cadastre_energetique.xlsx" 
                                        download 
                                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-green-700 transition-colors"
                                    >
                                        <FileText size={14} /> Télécharger maintenant
                                    </a>
                                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">XLSX • 2.4 MB</span>
                                </div>
                            </div>
                        </div>
                        {/* Decorative background icon */}
                        <div className="absolute -right-6 -bottom-6 text-green-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <FileText size={120} />
                        </div>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-200 bg-gray-50/30 hover:border-blue-500/30 hover:bg-blue-50/10 transition-all group relative overflow-hidden">
                        <div className="p-6 flex items-start gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <Zap size={28} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-base font-black text-gray-900 tracking-tight uppercase">Guide Utilisateur</h3>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed max-w-[280px]">
                                    Manuel complet d'utilisation de la plateforme Energy Manager.
                                </p>
                                <div className="pt-3 flex items-center gap-3 text-gray-400">
                                    <span className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Bientôt disponible</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Panel */}
                <Card className="border-none shadow-sm overflow-hidden bg-white group flex flex-col">
                    <CardHeader className="border-b bg-gray-50/30 flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                            <TrendingUp size={14} className="text-primary" /> <span>Performance</span>
                        </CardTitle>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black"><span>TOP 5%</span></Badge>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center py-10 relative overflow-hidden">
                        <div className="absolute -right-8 -bottom-8 text-primary opacity-[0.03] rotate-12">
                            <Zap size={160} />
                        </div>
                        <div className="relative">
                            <div className="inline-flex items-center justify-center p-8 rounded-full bg-primary/5 mb-6 border-8 border-white shadow-xl">
                                <span className="text-6xl font-black text-primary tracking-tighter">{loading ? "..." : profile?.score || 0}</span>
                            </div>
                            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce-subtle">
                                <TrendingUp size={14} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Points de Maîtrise</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-60">Indice Énergétique</p>
                    </CardContent>
                </Card>

                {/* Recent Activity List */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b py-4 bg-gray-50/30">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground"><span>Activité des Rapports</span></CardTitle>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5" onClick={() => navigate('/reports')}>
                            <span>Voir Tout</span> <ChevronRight size={12} className="ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                            </div>
                        ) : allReports.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText size={40} className="mx-auto mb-4 text-gray-200" />
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest"><span>Aucune activité récente</span></p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {allReports.slice(0, 5).map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary"
                                        onClick={() => navigate(`/reports/${report.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm border border-gray-100">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                    {report.nomGestionnaire?.charAt(0)?.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{report.nomGestionnaire}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-semibold text-muted-foreground/80 lowercase">{report.serviceAppartenance}</span>
                                                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                                    <span className="text-[10px] font-bold text-muted-foreground/60">{formatDate(report.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <StatusBadge status={report.reportStatus} className="text-[9px] px-2 py-0.5 border-2 rounded-full h-auto" />
                                            <Badge variant="ghost" className="h-4 p-0 px-1 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"><span>OUVRIR</span></Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <Button variant="outline" className="h-20 justify-start gap-4 bg-white border-2 border-gray-100 shadow-sm hover:border-primary/30 hover:bg-primary/5 group transition-all rounded-2xl" onClick={() => navigate('/reports/new')}>
                    <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                        <FileText size={22} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-gray-900"><span>Nouveau Rapport</span></p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60"><span>Saisie mensuelle</span></p>
                    </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start gap-4 bg-white border-2 border-gray-100 shadow-sm hover:border-accent/30 hover:bg-accent/5 group transition-all rounded-2xl" onClick={() => navigate('/meetings/new')}>
                    <div className="h-11 w-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                        <Calendar size={22} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-gray-900"><span>Planifier Réunion</span></p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60"><span>Agenda administratif</span></p>
                    </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start gap-4 bg-white border-2 border-gray-100 shadow-sm hover:border-primary/30 hover:bg-primary/5 group transition-all rounded-2xl" onClick={() => navigate('/chat')}>
                    <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                        <MessageSquare size={22} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-gray-900"><span>Messagerie</span></p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60"><span>Discussions directes</span></p>
                    </div>
                </Button>
            </div>
        </div>
    );
};

export default Dashboard;