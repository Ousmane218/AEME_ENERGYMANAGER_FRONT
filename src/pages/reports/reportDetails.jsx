import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getReportById, downloadReport } from "../../services/reportService";
import { ArrowLeft, Delete, Download } from "lucide-react";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReportById(id)
      .then((data) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Chargement...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/reports")
        }}
          className="flex items-center gap-2 text-gray-500 hover:text-primary"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadReport(report.id, report.fileName)
        }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          <Download size={18} /> Telecharger
        </button>
      </div>

      {/* Card */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-4">

        <h1 className="text-2xl font-bold text-primary">
          {report.reportType}
        </h1>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="font-semibold">Location:</span> {report.reportLocation}</p>
          <p><span className="font-semibold">Status:</span> {report.reportStatus}</p>
          <p><span className="font-semibold">Date:</span> {new Date(report.reportDate).toLocaleDateString()}</p>
          <p><span className="font-semibold">File:</span> {report.fileName}</p>
        </div>

        <div>
          <p className="font-semibold mb-1">Description:</p>
          <p className="text-gray-600">{report.reportDesc || "No description"}</p>
        </div>

      </div>
    </div>
  );
};

export default ReportDetails;