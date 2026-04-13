import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, downloadReport } from '../../services/reportService';
import { 
    ArrowLeft, Download, FileText, User, Building2, 
    Hash, Calendar, CheckCircle, XCircle, MinusCircle,
    ClipboardList, Info, FileCheck, ExternalLink,
    AlertCircle, Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const StatusBadge = ({ status }) => {
    const variants = {
        SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
        APPROVED:  'bg-green-50 text-green-700 border-green-200',
        REJECTED:  'bg-red-50 text-red-700 border-red-200',
    };
    const labels = {
        SUBMITTED: 'EN ATTENTE',
        APPROVED:  'VALIDE',
        REJECTED:  'RÉJECTÉ',
    };
    return (
        <Badge variant="outline" className={cn("font-black uppercase tracking-widest px-3", variants[status])}>
            {labels[status] || status}
        </Badge>
    );
};

const BoolIndicator = ({ value }) => {
    if (value === null || value === undefined) return <Badge variant="outline" className="opacity-30">N/A</Badge>;
    return value
        ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-bold gap-1"><CheckCircle size={12} /> OUI</Badge>
        : <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100 font-bold gap-1"><XCircle size={12} /> NON</Badge>;
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between py-4 group">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
                <Icon size={16} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{value}</span>
    </div>
);

const QuestionRow = ({ label, boolValue, subLabel, subValue, customSubNode }) => (
    <div className="py-4 border-b border-gray-50 space-y-3 group/row">
        <div className="flex items-start justify-between gap-4">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest leading-relaxed flex-1 group-hover/row:text-primary transition-colors">{label}</span>
            <BoolIndicator value={boolValue} />
        </div>
        {boolValue === true && (subValue || customSubNode) && (
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-inner">
                {customSubNode ? customSubNode : (
                    <>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{subLabel}</span>
                        <span className="text-[11px] font-black text-primary max-w-xs text-right truncate bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">{subValue}</span>
                    </>
                )}
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate('/reports')}
                        className="rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Détails du Rapport</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: {id?.substring(0, 8)}... · Consulté le {new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <StatusBadge status={report.reportStatus} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="md:col-span-8 space-y-8">
                    {/* Identification Card */}
                    <Card className="border-none shadow-xl shadow-black/5 bg-white overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                <ClipboardList size={18} /> Identification & Période
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y divide-gray-100 px-8">
                            <InfoRow icon={User} label="Gestionnaire" value={report.nomGestionnaire} />
                            <InfoRow icon={Building2} label="Service" value={report.serviceAppartenance} />
                            <InfoRow icon={Hash} label="Bâtiments" value={report.nombreBatiments} />
                            <InfoRow icon={Info} label="Police Senelec" value={report.numeroPoliceSenelec} />
                            <InfoRow icon={Calendar} label="Date d'Enregistrement" value={report.reportDate ? new Date(report.reportDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <Card className="border-none shadow-xl shadow-black/5 bg-white overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Activity size={18} className="text-primary" /> Suivi Technique & Activités
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 space-y-8 pb-10">
                            {parsedCampagnes.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Campagnes de Communication</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedCampagnes.map((c, i) => (
                                            <Badge key={i} variant="secondary" className="bg-gray-100/80 text-gray-700 font-bold border-none hover:bg-primary/10 hover:text-primary transition-colors">
                                                {c}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-x-12 gap-y-2">
                                <QuestionRow label="Partage du guide bâtiment ?" boolValue={report.guidePartageCommande} />
                                <QuestionRow label="Amélioration performance équipements ?" boolValue={report.guidePartagePerformance} />
                                <QuestionRow label="Résiliation contrat électricité ?" boolValue={report.procedureResiliation} />
                                <QuestionRow label="Modification puissance souscrite ?" boolValue={report.modificationPuissance} />
                                <QuestionRow 
                                    label="Consommations nulles identifiées ?" 
                                    boolValue={report.consommationsNullesIdentifiees} 
                                    subLabel="Action menée"
                                    subValue={report.actionMeneeConsoNulles}
                                />
                                <QuestionRow 
                                    label="Estimations recensées ?" 
                                    boolValue={report.estimationsRecensees} 
                                    subLabel="Action menée"
                                    subValue={report.actionMeneeEstimations}
                                />
                                <QuestionRow 
                                    label="Batteries condensateurs installées ?" 
                                    boolValue={report.batteriesCondensateursInstallees} 
                                    subLabel="Quantité"
                                    subValue={report.nombreBatteries}
                                />
                                <QuestionRow label="Cadastre énergétique réalisé ?" boolValue={report.cadastreEnergetiqueRealise} />
                                <QuestionRow 
                                    label="Index de consommation transmis ?" 
                                    boolValue={report.indexTransmis} 
                                    customSubNode={
                                        <div className="flex items-center gap-4 w-full justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Date :</span>
                                                <span className="text-[11px] font-black text-primary bg-white px-2 py-1 rounded-md">{report.dateIndex ? new Date(report.dateIndex).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Index :</span>
                                                <span className="text-[11px] font-black text-primary bg-white px-2 py-1 rounded-md">{report.valeurIndex || 'N/A'}</span>
                                            </div>
                                        </div>
                                    }
                                />
                                <QuestionRow 
                                    label="Plateforme digitale existante ?" 
                                    boolValue={report.plateformeDigitale} 
                                    customSubNode={
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Assure-t-il le suivi ?</span>
                                            <BoolIndicator value={report.suiviPlateforme} />
                                        </div>
                                    }
                                />
                            </div>
                            
                            {parsedAutresActivites.length > 0 && (
                                <div className="space-y-4 pt-6 border-t mt-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Autres Activités Réalisées</h4>
                                    <div className="flex flex-col gap-2">
                                        {parsedAutresActivites.map((a, i) => (
                                            <div className="flex items-start gap-2 text-xs font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100" key={i}>
                                                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                                <span>{a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>

                    {/* Feedback Card */}
                    {(report.contraintes || report.recommandations) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-none shadow-lg bg-orange-50/30 border-orange-100">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-orange-700 flex items-center gap-2">
                                        <AlertCircle size={14} /> Contraintes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-medium text-orange-950/80 leading-relaxed italic">
                                        "{report.contraintes || 'Aucune contrainte signalée'}"
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-lg bg-blue-50/30 border-blue-100">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-blue-700 flex items-center gap-2">
                                        <Info size={14} /> Recommandations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-medium text-blue-950/80 leading-relaxed italic">
                                        "{report.recommandations || 'Aucune recommandation formulée'}"
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Sidebar Context */}
                <div className="md:col-span-4 space-y-8">
                    {/* Files Card */}
                    <Card className="border-none shadow-xl shadow-black/5 bg-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <FileCheck size={18} className="text-primary" /> Pièces Jointes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            {report.illustrationsName ? (
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-primary/20 transition-all">
                                    <FileText size={24} className="text-primary mb-3" />
                                    <p className="text-xs font-black uppercase truncate mb-1">{report.illustrationsName}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold mb-4 uppercase">Galerie Photos</p>
                                    <Button 
                                        variant="default" 
                                        size="sm" 
                                        onClick={() => downloadReport(report.id, 'illustrations', report.illustrationsName)}
                                        className="w-full h-8 text-[10px] font-black uppercase tracking-widest h-9"
                                    >
                                        <Download size={14} className="mr-2" /> Télécharger
                                    </Button>
                                </div>
                            ) : null}

                            {report.autresDocumentsName ? (
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-primary/20 transition-all">
                                    <FileText size={24} className="text-primary mb-3" />
                                    <p className="text-xs font-black uppercase truncate mb-1">{report.autresDocumentsName}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold mb-4 uppercase">Documentation Technique</p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => downloadReport(report.id, 'autresDocuments', report.autresDocumentsName)}
                                        className="w-full h-8 text-[10px] font-black uppercase tracking-widest border-2 h-9"
                                    >
                                        <Download size={14} className="mr-2" /> Télécharger
                                    </Button>
                                </div>
                            ) : null}

                            {!report.illustrationsName && !report.autresDocumentsName && (
                                <div className="text-center py-8 opacity-40">
                                    <MinusCircle size={32} className="mx-auto mb-2 text-gray-400" />
                                    <p className="text-[10px] font-black uppercase">Aucun fichier joint</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats Summary */}
                    <Card className="border-none shadow-xl bg-primary text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity size={100} />
                        </div>
                        <CardContent className="p-8 space-y-4 relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">Synthèse de Performance</h4>
                            <p className="text-2xl font-black italic">Rapport en cours d'audit par l'AEME.</p>
                            <Separator className="bg-white/20" />
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Vérification des preuves</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ReportDetails;