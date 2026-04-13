import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, downloadReport } from '../../services/reportService';
import { 
    ArrowLeft, Download, FileText, User, Building2, 
    Hash, Calendar, CheckCircle, XCircle, MinusCircle,
    ClipboardList, Info, FileCheck, ExternalLink,
    AlertCircle, Activity, BookOpen, Zap, FileX, Settings,
    EyeOff, Edit3, Battery, Map, Layout, Star, Shield, Paperclip
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const StatusBadge = ({ status }) => {
    const variants = {
        SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
        APPROVED:  'bg-green-100 text-green-800 border-green-200',
        REJECTED:  'bg-red-100 text-red-800 border-red-200',
    };
    const labels = {
        SUBMITTED: 'En Attente',
        APPROVED:  'Validé',
        REJECTED:  'Rejeté',
    };
    return (
        <span className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border", variants[status])}>
            <Shield size={12} /> {labels[status] || status}
        </span>
    );
};

const BoolIndicator = ({ value }) => {
    if (value === null || value === undefined) return <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">N/A</span>;
    return value
        ? <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-100"><CheckCircle size={10} strokeWidth={3} /> OUI</span>
        : <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100"><XCircle size={10} strokeWidth={3} /> NON</span>;
};

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
            <Icon size={12} />
        </div>
        <div className="min-w-0 space-y-0.5">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{label}</p>
            <p className={`text-[12px] font-bold truncate ${value ? 'text-gray-900' : 'text-gray-300 italic'}`}>
                {value || 'Non renseigné'}
            </p>
        </div>
    </div>
);

const QuestionRow = ({ icon: Icon, label, boolValue, subLabel, subValue, customSubNode }) => (
    <div className="group/row flex flex-col gap-3 py-4 border-b border-gray-50 last:border-0">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/row:bg-primary/5 group-hover/row:text-primary transition-all duration-300">
                    <Icon size={14} />
                </div>
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest leading-none group-hover/row:text-gray-900 transition-colors">{label}</span>
            </div>
            <BoolIndicator value={boolValue} />
        </div>
        {boolValue === true && (subValue || customSubNode) && (
            <div className="ml-12 animate-in slide-in-from-left-2 duration-300">
                <div className="bg-gray-50/50 backdrop-blur-sm p-3 rounded-2xl border border-gray-100/50 flex items-center justify-between shadow-sm">
                    {customSubNode ? customSubNode : (
                        <>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{subLabel}</span>
                            <span className="text-[11px] font-black text-primary px-3 py-1 bg-white rounded-lg shadow-sm border border-gray-100 truncate">{subValue}</span>
                        </>
                    )}
                </div>
            </div>
        )}
    </div>
);

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getReportById(id)
            .then(data => setReport(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-10 text-center text-gray-500">Chargement...</div>;
    if (error)   return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!report) return null;

    const parsedCampagnes = (() => {
        try { return JSON.parse(report.campagnesCommunication || '[]'); }
        catch { return []; }
    })();

    const parsedAutresActivites = (() => {
        try { return JSON.parse(report.autresActivites || '[]'); }
        catch { return []; }
    })();

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/reports')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Retour
                    </button>
                    <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Détails du Rapport</h1>
                </div>
                <StatusBadge status={report.reportStatus} />
            </div>

            {/* Premium Hero Banner */}
            <div className="relative group overflow-hidden px-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-white/70 backdrop-blur-3xl border border-white p-8 rounded-[2.5rem] shadow-2xl shadow-black/5">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        {/* Avatar Area (Report Icon) */}
                        <div className="relative shrink-0">
                            <div className="h-28 w-28 rounded-[2rem] bg-accent flex items-center justify-center text-white shadow-2xl shadow-accent/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <FileText size={48} strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-50 text-primary">
                                <Star size={18} className="fill-primary" />
                            </div>
                        </div>

                        {/* Essential Info */}
                        <div className="flex-1 text-center lg:text-left space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase leading-none">
                                    {report.nomGestionnaire}
                                </h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Code Rapport: {id?.substring(0, 8)}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                    <Calendar size={16} className="text-primary/40" />
                                    {report.reportDate ? new Date(report.reportDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                </div>
                                <div className="h-1 w-1 rounded-full bg-gray-300 hidden sm:block" />
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1 rounded-lg">
                                    <Building2 size={14} />
                                    {report.serviceAppartenance}
                                </div>
                            </div>
                        </div>

                        {/* Metadata Grid Area */}
                        <div className="grid grid-cols-2 gap-8 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-12 w-full lg:w-auto">
                            <div className="text-center lg:text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bâtiments</p>
                                <div className="flex items-center justify-center lg:justify-start gap-2">
                                    <Hash size={16} className="text-primary/40" />
                                    <span className="text-xl font-black text-gray-900">{report.nombreBatiments || '0'}</span>
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Police Senelec</p>
                                <div className="flex items-center justify-center lg:justify-start gap-2">
                                    <Shield size={16} className="text-primary/40" />
                                    <span className="text-xs font-black text-gray-900 tracking-wider truncate max-w-[120px]">{report.numeroPoliceSenelec || '—'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                {/* Main Content Areas (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Technical Assessment Card */}
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-black/5 transition-all duration-500 bg-white">
                        <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-gray-100">
                                    <Activity size={16} />
                                </div>
                                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Suivi Technique & Activités</h3>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary">Détails Mensuels</Badge>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            {parsedCampagnes.length > 0 && (
                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Info size={12} className="text-primary" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Campagnes de Communication</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedCampagnes.map((c, i) => (
                                            <span key={i} className="px-4 py-1.5 bg-gray-50 text-gray-600 font-bold text-[11px] rounded-full border border-gray-100 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all cursor-default">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                    <Separator className="opacity-50" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-1">
                                <QuestionRow icon={BookOpen} label="Partage du guide bâtiment ?" boolValue={report.guidePartageCommande} />
                                <QuestionRow icon={Zap} label="Amélioration performance équipements ?" boolValue={report.guidePartagePerformance} />
                                <QuestionRow icon={FileX} label="Résiliation contrat électricité ?" boolValue={report.procedureResiliation} />
                                <QuestionRow icon={Settings} label="Modification puissance souscrite ?" boolValue={report.modificationPuissance} />
                                <QuestionRow 
                                    icon={EyeOff}
                                    label="Consommations nulles identifiées ?" 
                                    boolValue={report.consommationsNullesIdentifiees} 
                                    subLabel="Action menée"
                                    subValue={report.actionMeneeConsoNulles}
                                />
                                <QuestionRow 
                                    icon={Edit3}
                                    label="Estimations recensées ?" 
                                    boolValue={report.estimationsRecensees} 
                                    subLabel="Action menée"
                                    subValue={report.actionMeneeEstimations}
                                />
                                <QuestionRow 
                                    icon={Battery}
                                    label="Batteries condensateurs installées ?" 
                                    boolValue={report.batteriesCondensateursInstallees} 
                                    subLabel="Quantité"
                                    subValue={report.nombreBatteries}
                                />
                                <QuestionRow icon={Map} label="Cadastre énergétique réalisé ?" boolValue={report.cadastreEnergetiqueRealise} />
                                <QuestionRow 
                                    icon={Hash}
                                    label="Index de consommation transmis ?" 
                                    boolValue={report.indexTransmis} 
                                    customSubNode={
                                        <div className="flex items-center gap-8 w-full">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Date :</span>
                                                <span className="text-[11px] font-black text-primary bg-white px-2 py-1 rounded-lg border border-gray-50">{report.dateIndex ? new Date(report.dateIndex).toLocaleDateString() : '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Index :</span>
                                                <span className="text-[11px] font-black text-primary bg-white px-2 py-1 rounded-lg border border-gray-50">{report.valeurIndex || '—'}</span>
                                            </div>
                                        </div>
                                    }
                                />
                                <QuestionRow 
                                    icon={Layout}
                                    label="Plateforme digitale existante ?" 
                                    boolValue={report.plateformeDigitale} 
                                    customSubNode={
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assure-t-il le suivi de l'interface ?</span>
                                            <BoolIndicator value={report.suiviPlateforme} />
                                        </div>
                                    }
                                />
                            </div>

                            {parsedAutresActivites.length > 0 && (
                                <div className="space-y-4 pt-8 mt-4 border-t border-dashed border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Autres Activités Complémentaires</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {parsedAutresActivites.map((a, i) => (
                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300" key={i}>
                                                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-lg shadow-primary/20" />
                                                <span className="text-[11px] font-bold text-gray-700 leading-relaxed uppercase tracking-tight">{a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Observations Row */}
                    {(report.contraintes || report.recommandations) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-4 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={64} className="text-orange-500" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <AlertCircle size={16} />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Difficultés & Contraintes</p>
                                </div>
                                <p className="text-xs font-bold text-gray-700 italic leading-relaxed relative z-10 px-2 line-clamp-6">
                                    "{report.contraintes || 'Aucune difficulté particulière signalée pour cette période.'}"
                                </p>
                            </div>

                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-4 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <Info size={64} className="text-blue-500" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Info size={16} />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appui & Recommandations</p>
                                </div>
                                <p className="text-xs font-bold text-gray-700 italic leading-relaxed relative z-10 px-2 line-clamp-6">
                                    "{report.recommandations || 'Aucun besoin d\'accompagnement spécifique exprimé.'}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Areas (1/3) */}
                <div className="space-y-8">
                    {/* Synthesis Status Card */}
                    <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/30 group">
                        <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Synthèse d'Audit</p>
                                <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                    <FileCheck size={20} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black italic tracking-tighter leading-tight">Rapport en cours d'audit par l'AEME.</h3>
                                <p className="text-[11px] font-bold opacity-70 leading-relaxed uppercase tracking-tight">Le secrétariat technique procède à la vérification des données transmises.</p>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                                <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Flux de validation actif</span>
                            </div>
                        </div>
                    </div>

                    {/* Evidence & Files Card */}
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-black/5 transition-all duration-500 bg-white">
                        <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                            <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-gray-100">
                                <Paperclip size={16} />
                            </div>
                            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Pièces Jointes</h3>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            {report.illustrationsName ? (
                                <div className="space-y-4">
                                    <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 group/file hover:border-primary/20 transition-all cursor-pointer overflow-hidden">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-10 w-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary border border-gray-50">
                                                <Star size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Illustrations</p>
                                                <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{report.illustrationsName}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => downloadReport(report.id, 'illustrations', report.illustrationsName)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Download size={14} /> Télécharger
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {report.autresDocumentsName ? (
                                <div className="space-y-4">
                                    <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 group/file hover:border-primary/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-10 w-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary border border-gray-50">
                                                <FileText size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Documents</p>
                                                <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{report.autresDocumentsName}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => downloadReport(report.id, 'autresDocuments', report.autresDocumentsName)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary/5 transition-all"
                                        >
                                            <Download size={14} /> Télécharger
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {!report.illustrationsName && !report.autresDocumentsName && (
                                <div className="text-center py-10 opacity-30 flex flex-col items-center">
                                    <div className="h-16 w-16 bg-gray-100 rounded-[1.5rem] flex items-center justify-center text-gray-400 mb-4">
                                        <MinusCircle size={32} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Aucune pièce jointe transmise</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Information Badge Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center space-y-4 group">
                        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                            <Info size={24} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Note Importante</p>
                            <p className="text-[11px] font-bold text-gray-700 leading-relaxed uppercase tracking-tight">Ce rapport est certifié par le gestionnaire d'énergie et fait foi pour le calcul des indicateurs de performance structurels.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetails;