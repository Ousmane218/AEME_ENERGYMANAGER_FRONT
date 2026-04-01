import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, UploadCloud, X, CheckCircle } from 'lucide-react';
import { createReport } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/profileService';

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
    "Affichage d'écogestes simples dans les lieux stratégiques (WC, cuisines, ascenseurs, bureaux etc.)",
    "Sensibilisation rapide lors des réunions d'équipe",
    "Autre(s)"
];

const inputClass = "w-full px-4 py-3 border border-[#d0e8c0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00897b] bg-white text-sm";
const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

const NewReport = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        // Section 1
        reportDate: '',
        // Section 2
        nomGestionnaire: user?.fullName || '',
        serviceAppartenance: user?.membershipService || '',
        nombreBatiments: '',
        numeroPoliceSenelec: '',
        // Section 3
        campagnesCommunication: [],
        guidePartageCommande: null,
        guidePartagePerformance: null,
        procedureResiliation: null,
        modificationPuissance: null,
        consommationsNullesIdentifiees: null,
        estimationsRecensees: null,
        batteriesCondensateursInstallees: null,
        cadastreEnergetiqueRealise: null,
        indexTransmis: null,
        plateformeDigitale: null,
        autresActivites: [],
        contraintes: '',
        recommandations: '',
        // Section 4
        illustrations: null,
        autresDocuments: null,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getUserProfile();
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        nomGestionnaire: profile.fullName || '',
                        serviceAppartenance: profile.membershipService || ''
                    }));
                }
            } catch (err) {
                console.error("Erreur chargement profil:", err);
                // Fallback aux infos du token si le fetch échoue
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        nomGestionnaire: user.fullName || '',
                        serviceAppartenance: user.membershipService || ''
                    }));
                }
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBoolean = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleCheckbox = (field, value) => {
        const current = formData[field];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setFormData({ ...formData, [field]: updated });
    };

    const handleFile = (field, file) => {
        setFormData({ ...formData, [field]: file });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = new FormData();
            data.append('reportDate', `${formData.reportDate}T00:00:00`);
            data.append('nomGestionnaire', formData.nomGestionnaire);
            data.append('serviceAppartenance', formData.serviceAppartenance);
            data.append('nombreBatiments', formData.nombreBatiments);
            data.append('numeroPoliceSenelec', formData.numeroPoliceSenelec);
            if (formData.campagnesCommunication.length > 0)
                data.append('campagnesCommunication', JSON.stringify(formData.campagnesCommunication));
            if (formData.guidePartageCommande !== null)
                data.append('guidePartageCommande', formData.guidePartageCommande);
            if (formData.guidePartagePerformance !== null)
                data.append('guidePartagePerformance', formData.guidePartagePerformance);
            if (formData.procedureResiliation !== null)
                data.append('procedureResiliation', formData.procedureResiliation);
            if (formData.modificationPuissance !== null)
                data.append('modificationPuissance', formData.modificationPuissance);
            if (formData.consommationsNullesIdentifiees !== null)
                data.append('consommationsNullesIdentifiees', formData.consommationsNullesIdentifiees);
            if (formData.estimationsRecensees !== null)
                data.append('estimationsRecensees', formData.estimationsRecensees);
            if (formData.batteriesCondensateursInstallees !== null)
                data.append('batteriesCondensateursInstallees', formData.batteriesCondensateursInstallees);
            if (formData.cadastreEnergetiqueRealise !== null)
                data.append('cadastreEnergetiqueRealise', formData.cadastreEnergetiqueRealise);
            if (formData.indexTransmis !== null)
                data.append('indexTransmis', formData.indexTransmis);
            if (formData.plateformeDigitale !== null)
                data.append('plateformeDigitale', formData.plateformeDigitale);
            if (formData.autresActivites.length > 0)
                data.append('autresActivites', JSON.stringify(formData.autresActivites));
            if (formData.contraintes)
                data.append('contraintes', formData.contraintes);
            if (formData.recommandations)
                data.append('recommandations', formData.recommandations);
            if (formData.illustrations)
                data.append('illustrations', formData.illustrations);
            if (formData.autresDocuments)
                data.append('autresDocuments', formData.autresDocuments);

            await createReport(data);
            navigate('/reports');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Composants réutilisables
    const OuiNon = ({ field, label }) => (
        <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>
            <div className="flex gap-6">
                {[true, false].map(val => (
                    <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={field}
                            checked={formData[field] === val}
                            onChange={() => handleBoolean(field, val)}
                            className="accent-[#00897b] w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">{val ? 'Oui' : 'Non'}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const FileZone = ({ field, label, accept }) => (
        <div className="mb-6">
            <p className={labelClass}>{label}</p>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#d0e8c0] rounded-lg cursor-pointer hover:bg-[#f0f7e6] transition-colors">
                <input
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={e => handleFile(field, e.target.files[0])}
                />
                {formData[field] ? (
                    <div className="flex items-center gap-2 text-[#00897b]">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">{formData[field].name}</span>
                        <button
                            type="button"
                            onClick={e => { e.preventDefault(); handleFile(field, null); }}
                            className="text-red-400 hover:text-red-600 ml-2"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <UploadCloud size={32} className="text-[#00897b] mb-2" />
                        <span className="text-sm text-gray-500">Parcourir les fichiers</span>
                        <span className="text-xs text-gray-400 mt-1">Drag and drop files here</span>
                    </>
                )}
            </label>
        </div>
    );

    const SectionHeader = ({ title }) => (
        <div className="border-b border-[#d0e8c0] mb-6 pb-3">
            <h2 className="text-lg font-bold text-gray-800 tracking-wide uppercase">{title}</h2>
        </div>
    );

    const NavButtons = ({ onNext, onSubmit }) => (
        <div className="flex justify-between mt-8 pt-6 border-t border-[#d0e8c0]">
            {step > 1 ? (
                <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2.5 bg-[#00897b] text-white rounded-lg font-medium hover:bg-[#00796b] transition-colors"
                >
                    Retour
                </button>
            ) : <div />}
            {onNext && (
                <button
                    type="button"
                    onClick={onNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#00897b] text-white rounded-lg font-medium hover:bg-[#00796b] transition-colors"
                >
                    Suivant <ArrowRight size={18} />
                </button>
            )}
            {onSubmit && (
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#00897b] text-white rounded-lg font-medium hover:bg-[#00796b] transition-colors disabled:opacity-50"
                >
                    <Send size={18} />
                    {loading ? 'Envoi...' : 'Soumettre'}
                </button>
            )}
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Nouveau rapport</h1>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            step >= s ? 'bg-[#00897b] text-white' : 'bg-[#d0e8c0] text-gray-500'
                        }`}>
                            {s}
                        </div>
                        {s < 4 && <div className={`h-1 w-8 rounded ${step > s ? 'bg-[#00897b]' : 'bg-[#d0e8c0]'}`} />}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="bg-[#f0f7e6] rounded-2xl p-8 border border-[#d0e8c0]">

                {/* ── SECTION 1 : Date ── */}
                {step === 1 && (
                    <div>
                        {/* Logo + Titre */}
                        <div className="bg-white rounded-xl p-6 mb-8 flex flex-col items-center text-center border border-[#d0e8c0]">
                            <img src="/logo.png" alt="AEME Logo" className="h-12 w-auto" />
                        </div>
                        <div>
                            <label className={labelClass}>Date de saisie du rapport :</label>
                            <input
                                type="date"
                                name="reportDate"
                                value={formData.reportDate}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                            <p className="text-xs text-gray-400 mt-1">Date</p>
                        </div>
                        <NavButtons onNext={() => {
                            if (!formData.reportDate) { setError('La date est requise'); return; }
                            setError(null);
                            setStep(2);
                        }} />
                    </div>
                )}

                {/* ── SECTION 2 : Identification ── */}
                {step === 2 && (
                    <div>
                        <SectionHeader title="Identification" />
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Prénom(s) et nom du gestionnaire de l'énergie :</label>
                                <input type="text" name="nomGestionnaire" value={formData.nomGestionnaire}
                                    readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                            </div>
                            <div>
                                <label className={labelClass}>Service d'appartenance :</label>
                                <input type="text" name="serviceAppartenance" value={formData.serviceAppartenance}
                                    readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                            </div>
                            <div>
                                <label className={labelClass}>Nombre de bâtiments d'intervention :</label>
                                <input type="number" name="nombreBatiments" value={formData.nombreBatiments}
                                    onChange={handleChange} className={inputClass} min="0" />
                            </div>
                            <div>
                                <label className={labelClass}>N° de Police Senelec :</label>
                                <input type="text" name="numeroPoliceSenelec" value={formData.numeroPoliceSenelec}
                                    onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <NavButtons onNext={() => {
                            if (!formData.nomGestionnaire || !formData.serviceAppartenance) {
                                setError('Nom et service sont requis');
                                return;
                            }
                            setError(null);
                            setStep(3);
                        }} />
                    </div>
                )}

                {/* ── SECTION 3 : Activités ── */}
                {step === 3 && (
                    <div>
                        <SectionHeader title="Activités et réalisations" />

                        {/* Campagnes */}
                        <div className="mb-6">
                            <p className={labelClass}>Campagne de communication et de sensibilisation sur l'économie d'énergie :</p>
                            <div className="space-y-2">
                                {CAMPAGNES_OPTIONS.map(opt => (
                                    <label key={opt} className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.campagnesCommunication.includes(opt)}
                                            onChange={() => handleCheckbox('campagnesCommunication', opt)}
                                            className="accent-[#00897b] mt-0.5 w-4 h-4"
                                        />
                                        <span className="text-sm text-gray-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <OuiNon field="guidePartageCommande"
                            label="Avez-vous partagé le guide bâtiment avec les services en charge de la commande au niveau de la structure ?" />
                        <OuiNon field="guidePartagePerformance"
                            label="Avez-vous partagé le guide pour l'amélioration de la performance énergétique des équipements avec les services en charge de la commande au niveau de la structure ?" />
                        <OuiNon field="procedureResiliation"
                            label="Avez-vous effectué une procédure de résiliation d'un ou plusieurs contrats d'électricité ?" />
                        <OuiNon field="modificationPuissance"
                            label="Avez-vous effectué une démarche de modification de la puissance souscrite sur un ou plusieurs contrats d'électricité ?" />
                        <OuiNon field="consommationsNullesIdentifiees"
                            label="Avez-vous identifié les consommations nulles ?" />
                        <OuiNon field="estimationsRecensees"
                            label="Avez-vous recensé les estimations ?" />
                        <OuiNon field="batteriesCondensateursInstallees"
                            label="Avez-vous installé les batteries de condensateurs ?" />
                        <OuiNon field="cadastreEnergetiqueRealise"
                            label="Avez-vous réalisé le cadastre énergétique de votre bâtiment ?" />
                        <OuiNon field="indexTransmis"
                            label="Avez-vous relevé et transmis les index de consommation d'énergie pour le suivi des factures ?" />
                        <OuiNon field="plateformeDigitale"
                            label="Disposez-vous d'une plateforme digitale ?" />

                        {/* Autres activités */}
                        <div className="mb-6">
                            <p className={labelClass}>Quelles sont les autres activités réalisées ?</p>
                            <div className="space-y-2">
                                {AUTRES_ACTIVITES_OPTIONS.map(opt => (
                                    <label key={opt} className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.autresActivites.includes(opt)}
                                            onChange={() => handleCheckbox('autresActivites', opt)}
                                            className="accent-[#00897b] mt-0.5 w-4 h-4"
                                        />
                                        <span className="text-sm text-gray-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Contraintes */}
                        <div className="mb-5">
                            <label className={labelClass}>Quelles sont vos contraintes ?</label>
                            <textarea name="contraintes" rows={4} value={formData.contraintes}
                                onChange={handleChange} className={inputClass} />
                        </div>

                        {/* Recommandations */}
                        <div className="mb-5">
                            <label className={labelClass}>Quelles sont vos recommandations ?</label>
                            <textarea name="recommandations" rows={4} value={formData.recommandations}
                                onChange={handleChange} className={inputClass} />
                        </div>

                        <NavButtons onNext={() => { setError(null); setStep(4); }} />
                    </div>
                )}

                {/* ── SECTION 4 : Illustrations ── */}
                {step === 4 && (
                    <div>
                        <SectionHeader title="Illustrations (images, tableaux, etc.)" />

                        <FileZone
                            field="illustrations"
                            label="Images de la journée consacrée à la sensibilisation avec les collègues sur l'économie d'énergie :"
                            accept="image/*"
                        />
                        <FileZone
                            field="autresDocuments"
                            label="Autres documents à fournir :"
                            accept=".pdf,.xlsx,.xls,.doc,.docx"
                        />

                        <NavButtons onSubmit={handleSubmit} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewReport;