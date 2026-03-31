import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getReportById, downloadReport } from '../../services/reportService';
import { ArrowLeft, Download, FileText, User, Building2, Hash, Calendar, CheckCircle, XCircle, MinusCircle } from 'lucide-react';

const Badge = ({ status }) => {
    const styles = {
        SUBMITTED: 'bg-blue-100 text-blue-800',
        APPROVED:  'bg-green-100 text-green-800',
        REJECTED:  'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const BoolBadge = ({ value }) => {
    if (value === null || value === undefined) return <span className="text-gray-400 text-sm">—</span>;
    return value
        ? <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={14} /> Oui</span>
        : <span className="flex items-center gap-1 text-red-500 text-sm"><XCircle size={14} /> Non</span>;
};

const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-800 text-right max-w-xs">{value}</span>
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
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={18} /> Retour
                </button>
                <Badge status={report.reportStatus} />
            </div>

            {/* Section 1 — Identification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <User size={18} /> Identification
                </h2>
                <Row label="Gestionnaire" value={report.nomGestionnaire || '—'} />
                <Row label="Service d'appartenance" value={report.serviceAppartenance || '—'} />
                <Row label="Nombre de bâtiments" value={report.nombreBatiments ?? '—'} />
                <Row label="N° Police Senelec" value={report.numeroPoliceSenelec || '—'} />
                <Row label="Date du rapport" value={report.reportDate ? new Date(report.reportDate).toLocaleDateString('fr-FR') : '—'} />
            </div>

            {/* Section 2 — Campagnes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <FileText size={18} /> Activités et réalisations
                </h2>

                {parsedCampagnes.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Campagnes de communication</p>
                        <ul className="space-y-1">
                            {parsedCampagnes.map((c, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="space-y-1">
                    <Row label="Guide partagé (commande)" value={<BoolBadge value={report.guidePartageCommande} />} />
                    <Row label="Guide partagé (performance)" value={<BoolBadge value={report.guidePartagePerformance} />} />
                    <Row label="Procédure résiliation" value={<BoolBadge value={report.procedureResiliation} />} />
                    <Row label="Modification puissance" value={<BoolBadge value={report.modificationPuissance} />} />
                    <Row label="Consommations nulles identifiées" value={<BoolBadge value={report.consommationsNullesIdentifiees} />} />
                    <Row label="Estimations recensées" value={<BoolBadge value={report.estimationsRecensees} />} />
                    <Row label="Batteries condensateurs installées" value={<BoolBadge value={report.batteriesCondensateursInstallees} />} />
                    <Row label="Cadastre énergétique réalisé" value={<BoolBadge value={report.cadastreEnergetiqueRealise} />} />
                    <Row label="Index transmis" value={<BoolBadge value={report.indexTransmis} />} />
                    <Row label="Plateforme digitale" value={<BoolBadge value={report.plateformeDigitale} />} />
                </div>

                {parsedAutresActivites.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Autres activités</p>
                        <ul className="space-y-1">
                            {parsedAutresActivites.map((a, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> {a}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Section 3 — Contraintes & Recommandations */}
            {(report.contraintes || report.recommandations) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    {report.contraintes && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Contraintes</p>
                            <p className="text-sm text-gray-700">{report.contraintes}</p>
                        </div>
                    )}
                    {report.recommandations && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Recommandations</p>
                            <p className="text-sm text-gray-700">{report.recommandations}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Section 4 — Fichiers */}
            {(report.illustrationsName || report.autresDocumentsName) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <Download size={18} /> Fichiers joints
                    </h2>
                    <div className="space-y-3">
                        {report.illustrationsName && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{report.illustrationsName}</p>
                                        <p className="text-xs text-gray-400">Illustrations</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => downloadReport(report.id, 'illustrations', report.illustrationsName)}
                                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                    <Download size={16} /> Télécharger
                                </button>
                            </div>
                        )}
                        {report.autresDocumentsName && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{report.autresDocumentsName}</p>
                                        <p className="text-xs text-gray-400">Autres documents</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => downloadReport(report.id, 'autresDocuments', report.autresDocumentsName)}
                                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                    <Download size={16} /> Télécharger
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportDetails;