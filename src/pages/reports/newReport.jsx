import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, X } from 'lucide-react';
import { createReport } from '../../services/reportService';

const NewReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        reportType: 'MONTHLY',
        reportDate: '',
        reportLocation: '',
        reportDesc: '',
        file: null,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const data = new FormData();
            data.append('reportType', formData.reportType);
            data.append('reportDate', `${formData.reportDate}T00:00:00`);
            data.append('reportLocation', formData.reportLocation);
            data.append('reportDesc', formData.reportDesc);
            data.append('file', formData.file);
            await createReport(data);
            navigate('/reports');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-primary">New Report</h1>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Row 1: Type & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                            <select
                                name="reportType"
                                value={formData.reportType}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="MONTHLY">Monthly Consumption</option>
                                <option value="ANNUAL">Annual Audit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                            <input
                                type="date"
                                name="reportDate"
                                value={formData.reportDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Row 2: Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location / Department</label>
                        <input
                            type="text"
                            name="reportLocation"
                            placeholder="e.g. Dakar - Ministry of Energy"
                            value={formData.reportLocation}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Row 3: Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Summary
                        </label>
                        <textarea
                            name="reportDesc"
                            rows="5"
                            value={formData.reportDesc}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter report summary..."
                        />
                    </div>

                    {/* Row 4: File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            File <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label htmlFor="file-upload" className="cursor-pointer font-medium text-primary hover:text-primary-dark">
                                        <span>Upload a file</span>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept=".pdf,.xlsx,.xls,.png,.jpg"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF, Excel, PNG, JPG up to 10MB</p>
                                {formData.file && (
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <p className="text-sm font-medium text-green-600">
                                            {formData.file.name}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, file: null })}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-primary text-white px-8 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Création...' : 'Create Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewReport;