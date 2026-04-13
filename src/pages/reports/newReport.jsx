import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Send, UploadCloud, X, CheckCircle,
    Calendar, ClipboardList, Activity, FileCheck, Info, HelpCircle,
    Loader2, Paperclip
} from 'lucide-react';
import { createReport } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/profileService';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CAMPAGNES_OPTIONS = [
    "Diffusion d'affiches / Flyers",
    "Envoi de newsletters énergie",
    "Publication d'infographies interactives",
    "Sessions de formations / Ateliers pratiques",
    "Campagne sur les réseaux sociaux",
    "Sensibilisation à l'utilisation rationnelle de l'énergie auprès des collègues",
    "Autre(s)"
];

const AUTRES_ACTIVITES_OPTIONS = [
    "Réglage de la température de consigne de climatisation",
    "Extinction des équipements en dehors des horaires",
    "Repérage des consommations anormales via les factures",
    "Affichage d'écogestes simples dans les lieux stratégiques (WC, cuisines, ascenceurs, bureaux etc.)",
    "Sensibilisation rapide lors des réunions d'équipe",
    "Autre(s)"
];

const OuiNonField = ({ label, value, onChange }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50/40 border border-gray-100 hover:border-primary/20 transition-all group shadow-sm bg-white">
        <Label className="text-[12px] font-bold text-gray-700 leading-snug md:pr-6 group-hover:text-gray-900 transition-colors uppercase tracking-tight">{label}</Label>
        <div className="flex shrink-0 p-1 bg-gray-100/50 rounded-xl border border-gray-200/50 shadow-inner">
            {['OUI', 'NON'].map(val => (
                <button
                    key={val}
                    type="button"
                    onClick={() => onChange(val)}
                    className={cn(
                        "px-5 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest",
                        value === val 
                            ? val === 'OUI' ? "bg-green-600 text-white shadow-lg shadow-green-200" : "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    {val}
                </button>
            ))}
        </div>
    </div>
);

const QuestionBlock = ({ formData, setFormData, fieldName, label, conditionalNode }) => (
    <div className="space-y-3 flex flex-col justify-start">
        <OuiNonField 
            label={label} 
            value={formData[fieldName]} 
            onChange={(val) => setFormData(prev => ({ ...prev, [fieldName]: val }))} 
        />
        {formData[fieldName] === 'OUI' && conditionalNode && (
            <div className="pl-2 animate-in zoom-in-95 duration-300">
                {conditionalNode}
            </div>
        )}
    </div>
);

const FileZone = ({ field, label, accept, formData, handleFile }) => (
    <div className="space-y-4 relative group">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">{label}</Label>
        <label className={cn(
            "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
            formData[field]
                ? "border-primary bg-primary/5 shadow-inner"
                : "border-gray-200 bg-gray-50/50 hover:bg-white hover:border-primary/40 hover:shadow-sm"
        )}>
            <input
                type="file"
                accept={accept}
                className="sr-only"
                onChange={e => handleFile(field, e.target.files[0])}
            />
            {formData[field] ? (
                <div className="flex items-center gap-3 text-primary font-bold bg-white px-5 py-3 rounded-xl shadow-sm border border-primary/10 animate-in zoom-in-95">
                    <CheckCircle size={18} className="text-green-500" />
                    <span className="text-xs truncate max-w-[200px]">{formData[field].name}</span>
                    <button
                        type="button"
                        onClick={e => { e.preventDefault(); handleFile(field, null); }}
                        className="text-gray-400 hover:text-red-500 ml-2 transition-colors p-1"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                        <UploadCloud size={24} className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                    <p className="text-[11px] font-bold mb-1">Cliquez pour ajouter un fichier</p>
                    <p className="text-[9px] uppercase tracking-widest opacity-50">
                        {accept === "image/*" ? "Images recommandées (PNG, JPG)" : "Documents (PDF, DOCX, XLSX)"}
                    </p>
                </div>
            )}
        </label>
    </div>
);

const NewReport = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        nomGestionnaire: '',
        telephone: '',
        email: '',
        serviceAppartenance: '',
        reportDate: new Date().toISOString().split('T')[0],
        nombreBatiments: '',
        numeroPoliceSenelec: '',
        campagnesCommunication: [],
        precisezCampagnes: '',
        autresActivites: [],
        precisezAutresActivites: '',
        guidePartageCommande: 'NON',
        guidePartagePerformance: 'NON',
        procedureResiliation: 'NON',
        modificationPuissance: 'NON',
        pieceJustifPuissance: null,
        consommationsNullesIdentifiees: 'NON',
        actionMeneeConsoNulles: '',
        estimationsRecensees: 'NON',
        actionMeneeEstimations: '',
        batteriesCondensateursInstallees: 'NON',
        nombreBatteries: '',
        cadastreEnergetiqueRealise: 'NON',
        indexTransmis: 'NON',
        dateIndex: '',
        valeurIndex: '',
        plateformeDigitale: 'NON',
        suiviPlateforme: 'NON',
        contraintes: '',
        besoins: '',
        illustrations: null,
        autresDocuments: null
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getUserProfile();
                setFormData(prev => ({
                    ...prev,
                    nomGestionnaire: `${profile.firstName} ${profile.lastName}`,
                    email: profile.email || '',
                    serviceAppartenance: profile.membershipService || ''
                }));
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (field, value) => {
        setFormData(prev => {
            const current = prev[field];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleFile = (field, file) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const data = new FormData();
            
            // Map the new UI state to the backend's expected schema format
            data.append('reportDate', `${formData.reportDate}T00:00:00`);
            data.append('nomGestionnaire', formData.nomGestionnaire);
            data.append('serviceAppartenance', formData.serviceAppartenance);
            data.append('nombreBatiments', formData.nombreBatiments || '0');
            data.append('numeroPoliceSenelec', formData.numeroPoliceSenelec || '');
            
            if (formData.campagnesCommunication.length > 0) {
                // If "Autre(s)" is selected, we might want to append the precisez value, or send it separately based on backend structure. For now, send both in JSON or map it nicely.
                let camps = [...formData.campagnesCommunication];
                if (camps.includes("Autre(s)") && formData.precisezCampagnes) {
                    camps = camps.map(c => c === "Autre(s)" ? `Autre(s) : ${formData.precisezCampagnes}` : c);
                }
                data.append('campagnesCommunication', JSON.stringify(camps));
            }
            if (formData.autresActivites.length > 0) {
                let autres = [...formData.autresActivites];
                if (autres.includes("Autre(s)") && formData.precisezAutresActivites) {
                    autres = autres.map(a => a === "Autre(s)" ? `Autre(s) : ${formData.precisezAutresActivites}` : a);
                }
                data.append('autresActivites', JSON.stringify(autres));
            }
            
            const mapBool = (val) => val === 'OUI' ? true : false;
            data.append('guidePartageCommande', mapBool(formData.guidePartageCommande));
            data.append('guidePartagePerformance', mapBool(formData.guidePartagePerformance));
            data.append('procedureResiliation', mapBool(formData.procedureResiliation));
            data.append('modificationPuissance', mapBool(formData.modificationPuissance));
            
            if (formData.modificationPuissance === 'OUI' && formData.pieceJustifPuissance) {
                data.append('pieceJustifPuissance', formData.pieceJustifPuissance);
            }
            
            data.append('consommationsNullesIdentifiees', mapBool(formData.consommationsNullesIdentifiees));
            data.append('estimationsRecensees', mapBool(formData.estimationsRecensees));
            data.append('batteriesCondensateursInstallees', mapBool(formData.batteriesCondensateursInstallees));
            data.append('cadastreEnergetiqueRealise', mapBool(formData.cadastreEnergetiqueRealise));
            data.append('indexTransmis', mapBool(formData.indexTransmis));
            data.append('plateformeDigitale', mapBool(formData.plateformeDigitale));
            if (formData.contraintes) data.append('contraintes', formData.contraintes);
            if (formData.besoins) data.append('recommandations', formData.besoins);
            if (formData.illustrations) data.append('illustrations', formData.illustrations);
            if (formData.autresDocuments) data.append('autresDocuments', formData.autresDocuments);

            await createReport(data);
            setSuccess(true);
            setTimeout(() => navigate('/reports'), 2000);
        } catch (err) {
            setError(err.message || "Une erreur est survenue lors de l'envoi du rapport.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">Initialisation...</p>
        </div>
    );

    if (success) return (
        <Card className="max-w-2xl mx-auto shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-500 rounded-3xl">
            <div className="h-3 bg-gradient-to-r from-primary to-accent"></div>
            <CardContent className="pt-16 pb-20 text-center space-y-8">
                <div className="inline-flex items-center justify-center h-28 w-28 rounded-full bg-green-50 text-green-600 mb-4 border-8 border-white shadow-xl">
                    <CheckCircle size={56} strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Rapport Transmis</h2>
                    <p className="text-base text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                        Votre rapport mensuel a été enregistré avec succès et sera examiné par l'équipe AEME.
                    </p>
                </div>
                <div className="pt-6">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/30" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3 opacity-40">Redirection automatique...</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-30 bg-background/90 backdrop-blur-xl py-6 transition-all border-b border-gray-100 mb-4 px-2">
                <div className="flex items-center gap-5">
                    <Button variant="outline" size="icon" onClick={() => navigate('/reports')} className="h-11 w-11 rounded-xl shadow-sm hover:bg-primary hover:text-white transition-all group">
                        <ArrowLeft className="text-primary group-hover:text-white" size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Soumettre un Relevé</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 mt-1 flex items-center gap-2">
                            <Calendar size={12} className="text-primary" /> {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} • Période Mensuelle
                        </p>
                    </div>
                </div>
                {error && (
                    <Badge variant="destructive" className="animate-in slide-in-from-right-4 font-bold py-1.5 px-5 text-[10px] uppercase tracking-widest shadow-lg shadow-red-100">
                        {error}
                    </Badge>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Section 1: Informations Générales */}
                <Card className="border-none shadow-sm overflow-hidden bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b py-5 px-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl text-primary flex items-center justify-center shadow-inner">
                                <ClipboardList size={22} />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Informations Administratives</CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-0.5">Identité du gestionnaire d'énergie</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Date du Rapport</Label>
                                <Input type="date" name="reportDate" value={formData.reportDate} onChange={handleChange} required className="h-12 bg-white border-2 border-gray-100 focus:border-primary/40 rounded-xl transition-all shadow-sm" />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Nom du Gestionnaire</Label>
                                <Input name="nomGestionnaire" value={formData.nomGestionnaire} onChange={handleChange} required className="h-12 bg-gray-50 border-2 border-gray-100 focus:border-primary/40 rounded-xl transition-all shadow-sm cursor-not-allowed" readOnly />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Structure / Service</Label>
                                <Input name="serviceAppartenance" value={formData.serviceAppartenance} onChange={handleChange} required className="h-12 bg-gray-50 border-2 border-gray-100 focus:border-primary/40 rounded-xl transition-all shadow-sm cursor-not-allowed" readOnly />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Contact Téléphonique</Label>
                                <Input name="telephone" value={formData.telephone} onChange={handleChange} required className="h-12 bg-white border-2 border-gray-100 focus:border-primary/40 rounded-xl transition-all shadow-sm" />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Adresse Email Professionnelle</Label>
                                <Input name="email" type="email" value={formData.email} onChange={handleChange} required className="h-12 bg-white border-2 border-gray-100 focus:border-primary/40 rounded-xl transition-all shadow-sm" />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Nombre de bâtiments d'intervention</Label>
                                <Input type="number" name="nombreBatiments" min="0" value={formData.nombreBatiments} onChange={handleChange} required className="h-12 bg-white border-2 border-gray-100 focus:border-primary/40 rounded-xl transition-all shadow-sm" />
                            </div>
                            <div className="space-y-2.5 md:col-span-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">N° de Police Senelec</Label>
                                <Input name="numeroPoliceSenelec" placeholder="Si plusieurs, séparez par des virgules" value={formData.numeroPoliceSenelec} onChange={handleChange} className="h-12 bg-white border-2 border-gray-100 focus:border-primary/40 rounded-xl transition-all shadow-sm" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Actions de Sensibilisation */}
                <Card className="border-none shadow-sm overflow-hidden bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b py-5 px-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-accent/10 rounded-xl text-accent flex items-center justify-center shadow-inner">
                                <Activity size={22} />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Maîtrise de l'Énergie</CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-0.5">Actions et sensibilisation du mois</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-12">
                        <div className="space-y-6">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">Campagnes de Communication</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CAMPAGNES_OPTIONS.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleCheckbox('campagnesCommunication', opt)}
                                        className={cn(
                                            "p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group relative overflow-hidden shadow-sm",
                                            formData.campagnesCommunication.includes(opt) 
                                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.01]" 
                                                : "bg-white border-gray-100 hover:border-primary/20 text-gray-600 hover:bg-primary/5 hover:scale-[1.01]"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors",
                                            formData.campagnesCommunication.includes(opt) ? "bg-white border-white text-primary" : "border-gray-200 group-hover:border-primary/30"
                                        )}>
                                            {formData.campagnesCommunication.includes(opt) && <CheckCircle size={16} strokeWidth={3} />}
                                        </div>
                                        <span className="text-[11px] font-bold leading-snug uppercase tracking-tight mr-2">{opt}</span>
                                    </button>
                                ))}
                            </div>
                            {formData.campagnesCommunication.includes("Autre(s)") && (
                                <div className="mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 animate-in slide-in-from-top-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1 block mb-2">Précisez :</Label>
                                    <Input name="precisezCampagnes" value={formData.precisezCampagnes} onChange={handleChange} className="h-10 bg-white" placeholder="Précisez votre réponse..." />
                                </div>
                            )}
                        </div>

                        <Separator className="opacity-50" />

                        <div className="space-y-6">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent bg-accent/5 px-4 py-1.5 rounded-full border border-accent/10">Quelles sont les autres activités réalisées ?</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {AUTRES_ACTIVITES_OPTIONS.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleCheckbox('autresActivites', opt)}
                                        className={cn(
                                            "p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group relative overflow-hidden shadow-sm",
                                            formData.autresActivites.includes(opt) 
                                                ? "bg-accent border-accent text-white shadow-xl shadow-accent/20 scale-[1.01]" 
                                                : "bg-white border-gray-100 hover:border-accent/20 text-gray-600 hover:bg-accent/5 hover:scale-[1.01]"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors",
                                            formData.autresActivites.includes(opt) ? "bg-white border-white text-accent" : "border-gray-200 group-hover:border-accent/30"
                                        )}>
                                            {formData.autresActivites.includes(opt) && <CheckCircle size={16} strokeWidth={3} />}
                                        </div>
                                        <span className="text-[11px] font-bold leading-snug uppercase tracking-tight mr-2">{opt}</span>
                                    </button>
                                ))}
                            </div>
                            {formData.autresActivites.includes("Autre(s)") && (
                                <div className="mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 animate-in slide-in-from-top-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1 block mb-2">Précisez :</Label>
                                    <Input name="precisezAutresActivites" value={formData.precisezAutresActivites} onChange={handleChange} className="h-10 bg-white" placeholder="Précisez votre réponse..." />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Questionnaires Techniques */}
                <Card className="border-none shadow-sm overflow-hidden bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b py-5 px-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl text-primary flex items-center justify-center shadow-inner">
                                <FileCheck size={22} />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Auto-Évaluation Technique</CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-0.5">Conformité aux directives AEME</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 gap-y-6 items-start">
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="guidePartageCommande" label="Avez-vous partagé le guide bâtiment avec les services en charge de la commande au niveau de la structure ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="guidePartagePerformance" label="Avez-vous partagé le guide pour l'amélioration de la performance énergétique des équipements avec les services en charge de la commande au niveau de la structure ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="procedureResiliation" label="Avez-vous effectué une procédure de résiliation d’un ou plusieurs contrats d’électricité ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="modificationPuissance" label="Avez-vous effectué une démarche de modification de la puissance souscrite sur un ou plusieurs contrats d'électricité ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="consommationsNullesIdentifiees" label="Avez-vous identifié les consommations nulles ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="estimationsRecensees" label="Avez-vous recensé les estimations ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="batteriesCondensateursInstallees" label="Avez-vous installé les batteries de condensateurs ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="cadastreEnergetiqueRealise" label="Avez-vous réalisé le cadastre énergétique de votre bâtiment ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="indexTransmis" label="Avez-vous relevé et transmis les index de consommation d’énergie pour le suivi des factures ?" />
                            <QuestionBlock formData={formData} setFormData={setFormData} fieldName="plateformeDigitale" label="Disposez-vous d'une plateforme digitale ?" />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 4: Retour d'Expérience */}
                <Card className="border-none shadow-sm overflow-hidden bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b py-5 px-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-accent/10 rounded-xl text-accent flex items-center justify-center shadow-inner">
                                <HelpCircle size={22} />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Retour d'Expérience</CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-0.5">Vos observations et demandes d'appui</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-10">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Difficultés & Contraintes</Label>
                            <textarea 
                                name="contraintes" 
                                value={formData.contraintes} 
                                onChange={handleChange}
                                placeholder="Quelles difficultés avez-vous rencontré dans la gestion de l'énergie ce mois-ci ?"
                                className="w-full h-36 p-5 rounded-2xl border-2 border-gray-100 bg-white focus:border-primary/40 focus:ring-0 transition-all font-medium text-sm shadow-sm placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Besoins d'Accompagnement</Label>
                            <textarea 
                                name="besoins" 
                                value={formData.besoins} 
                                onChange={handleChange}
                                placeholder="De quel appui technique ou matériel auriez-vous besoin de la part de l'AEME ?"
                                className="w-full h-36 p-5 rounded-2xl border-2 border-gray-100 bg-white focus:border-primary/40 focus:ring-0 transition-all font-medium text-sm shadow-sm placeholder:text-gray-300"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 5: Pièces Jointes */}
                <Card className="border-none shadow-sm overflow-hidden bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gray-50/50 border-b py-5 px-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl text-primary flex items-center justify-center shadow-inner">
                                <Paperclip size={22} />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Pièces Jointes & Justificatifs</CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-0.5">Illustrations et documents complémentaires</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FileZone 
                                field="illustrations" 
                                label="Images & Photos de Sensibilisation" 
                                accept="image/*" 
                                formData={formData} 
                                handleFile={handleFile} 
                            />
                            <FileZone 
                                field="autresDocuments" 
                                label="Autres Documents Formels (ex: factures, relevés)" 
                                accept=".pdf,.xlsx,.xls,.doc,.docx" 
                                formData={formData} 
                                handleFile={handleFile} 
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Panel */}
                <div className="pt-10 flex flex-col items-center">
                    <Button 
                        type="submit" 
                        disabled={submitting}
                        className="h-16 px-16 rounded-3xl text-sm font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary group hover:bg-primary/95"
                    >
                        {submitting ? (
                            <><Loader2 className="mr-4 h-6 w-6 animate-spin text-white/50" /> Transmission...</>
                        ) : (
                            <><Send className="mr-4 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> Envoyer le Rapport</>
                        )}
                    </Button>
                    <p className="mt-6 text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Toutes les données sont transmises de manière sécurisée</p>
                </div>
            </form>
        </div>
    );
};

export default NewReport;