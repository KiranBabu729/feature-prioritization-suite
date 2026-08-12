import { useRef, useState } from "react";
import Modal from "./Modal";
import { parseFeaturesCSV } from "../utils/csv";
import { IconUpload } from "./Icons";

const SAMPLE_CSV = `Feature Name,Client Name,Client Tier,Feedback Text,Complexity
API Rate Limit Increase,Acme Trading,Top Tier,"Need higher throughput for automated trading bots",4`;

export default function CSVUpload({ onClose, onImport }) {
  const [fileName, setFileName] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [schema, setSchema] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const { features, errors, schema } = parseFeaturesCSV(e.target.result);
      setPreview(features);
      setErrors(errors);
      setSchema(schema);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length === 0) return;
    onImport(preview);
    onClose();
  };

  return (
    <Modal title="Upload Features CSV" onClose={onClose} width="max-w-2xl">
      <div className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver ? "border-brand-blue bg-brand-blue-light" : "border-border-gray hover:border-brand-blue"
          }`}
        >
          <IconUpload className="text-brand-blue" />
          <p className="text-sm font-semibold text-dark-gray">
            {fileName || "Drop CSV file here or click to browse"}
          </p>
          <p className="text-xs text-medium-gray">
            Columns: Feature Name, Client Name, Client Tier, Feedback Text, Complexity
          </p>
          <p className="text-xs text-medium-gray">
            Governance feedback exports (Text, Category, Priority, Sentiment, ...) are also auto-detected
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {errors.length > 0 && (
          <div className="rounded-lg border border-status-error bg-status-error-bg p-3">
            <p className="text-xs font-semibold text-status-error">
              {errors.length} row(s) skipped due to validation errors:
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs text-status-error">
              {errors.slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
              {errors.length > 6 && <li>...and {errors.length - 6} more</li>}
            </ul>
          </div>
        )}

        {preview.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-status-success">
              {preview.length} feature(s) ready to import
              {schema === "governance" && (
                <span className="ml-2 rounded-full bg-brand-blue-light px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
                  Governance feedback schema detected — Client Tier &amp; Complexity derived from Priority
                </span>
              )}
            </p>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border-gray">
              <table className="w-full text-xs">
                <thead className="bg-light-gray">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Client</th>
                    <th className="px-3 py-2 text-left">Tier</th>
                    <th className="px-3 py-2 text-left">Effort</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((f) => (
                    <tr key={f.id} className="border-t border-border-gray">
                      <td className="px-3 py-2">{f.name}</td>
                      <td className="px-3 py-2">{f.clientName}</td>
                      <td className="px-3 py-2">{f.clientTier}</td>
                      <td className="px-3 py-2">{f.complexity}w</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <details className="text-xs text-medium-gray">
          <summary className="cursor-pointer font-semibold">Sample CSV format</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-light-gray p-3">{SAMPLE_CSV}</pre>
        </details>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border-gray px-4 py-2 text-sm font-semibold text-medium-gray hover:bg-light-gray"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={preview.length === 0}
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-40"
          >
            Import {preview.length > 0 ? `${preview.length} Features` : ""}
          </button>
        </div>
      </div>
    </Modal>
  );
}
