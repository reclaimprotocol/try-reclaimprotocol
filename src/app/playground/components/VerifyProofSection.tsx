import { type Proof } from "@reclaimprotocol/js-sdk";
import { useState } from "react";
import { YourBackendUsingReclaim } from "../../../service/reclaim";

export function VerifyProofSection() {
    const [proofResult, setProofResult] = useState("");
    const [evaluationResult, setEvaluationResult] = useState("");
    const [evaluationError, setEvaluationError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClaim = async () => {
        setLoading(true);
        setEvaluationResult("");
        try {
            const isValid = await YourBackendUsingReclaim.processProof(JSON.parse(proofResult) as Proof)
            if (!isValid) {
                setEvaluationError('Proof verification failed');
            }
            setEvaluationResult('Proof verification successful');
        } catch (e) {
            setEvaluationError(`Verification failed: ${e}`);
        }
        setLoading(false);
    };

    return (
        <div className="card">
            <h2>Claim Proof Verification</h2>
            <div className="input-group">
                <label>Claim Proof</label>
                <textarea
                    value={proofResult}
                    onChange={(e) => setProofResult(e.target.value)}
                    placeholder="Enter claim proof"
                    rows={4}
                />
            </div>
            <div className="flex items-center gap-3">
                <button className="plg-button" onClick={handleClaim} disabled={loading}>
                    {loading ? "Processing..." : "Test Proof"}
                </button>
            </div>
            {evaluationResult && (
                <div className="result-box">
                    <strong>Evaluation Result:</strong>
                    <p>{evaluationResult}</p>
                </div>
            )}
            {evaluationError && (
                <div className="error-box">
                    <strong>Evaluation Failed:</strong>
                    <p>{evaluationError}</p>
                </div>
            )}
        </div>
    );
}
