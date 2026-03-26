import { getHttpProviderClaimParamsFromProof, getProviderParamsAsCanonicalizedString, type HashableHttpProviderClaimParams, type Proof } from "@reclaimprotocol/js-sdk";
import { useState } from "react";

const getProofsInequalityReason = (a: HashableHttpProviderClaimParams, b: HashableHttpProviderClaimParams): string[] => {
    const reasons: string[] = []

    if (a.url != b.url) {
        reasons.push(`Expected url ${a.url} but got ${b.url}`);
    }

    if (a.method != b.method) {
        reasons.push(`Expected method ${a.method} but got ${b.method}`);
    }

    if (a.body != b.body) {
        reasons.push(`Expected body ${a.body} but got ${b.body}`);
    }

    if (a.responseMatches.length != b.responseMatches.length) {
        reasons.push(`Expected ${a.responseMatches.length} response matches but got ${b.responseMatches.length}`);
    } else {
        for (let i = 0; i < a.responseMatches.length; i++) {
            const matchA = a.responseMatches[i];
            const matchB = b.responseMatches[i];
            if (matchA.value != matchB.value) {
                reasons.push(`Expected response match ${i} value ${matchA.value} but got ${matchB.value}`);
            }
            if (matchA.type != matchB.type) {
                reasons.push(`Expected response match ${i} type ${matchA.type} but got ${matchB.type}`);
            }
            if (matchA.invert != matchB.invert) {
                reasons.push(`Expected response match ${i} invert ${matchA.invert} but got ${matchB.invert}`);
            }
        }

    }

    if (a.responseRedactions.length != b.responseRedactions.length) {
        reasons.push(`Expected ${a.responseRedactions.length} response redactions but got ${b.responseRedactions.length}`);
    } else {
        for (let i = 0; i < a.responseRedactions.length; i++) {
            const redactionA = a.responseRedactions[i];
            const redactionB = b.responseRedactions[i];
            if (redactionA.xPath != redactionB.xPath) {
                reasons.push(`Expected response redaction ${i} xPath ${redactionA.xPath} but got ${redactionB.xPath}`);
            }
            if (redactionA.jsonPath != redactionB.jsonPath) {
                reasons.push(`Expected response redaction ${i} jsonPath ${redactionA.jsonPath} but got ${redactionB.jsonPath}`);
            }
            if (redactionA.regex != redactionB.regex) {
                reasons.push(`Expected response redaction ${i} regex ${redactionA.regex} but got ${redactionB.regex}`);
            }
            if (redactionA.hash != redactionB.hash) {
                reasons.push(`Expected response redaction ${i} hash ${redactionA.hash} but got ${redactionB.hash}`);
            }
        }
    }

    return reasons
}

export function CompareProofsSection() {
    const [proofResult1, setProofResult1] = useState("");
    const [proofResult2, setProofResult2] = useState("");
    const [evaluationResult, setEvaluationResult] = useState("");
    const [evaluationError, setEvaluationError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleComparison = async () => {
        setLoading(true);
        setEvaluationResult("");
        setEvaluationError("");
        try {
            let i = 0;
            const proofsOfA = JSON.parse(proofResult1);
            const proofsOfAList = Array.isArray(proofsOfA) ? proofsOfA : [proofsOfA];
            const proofsOfB = JSON.parse(proofResult2);
            const proofsOfBList = Array.isArray(proofsOfB) ? proofsOfB : [proofsOfB];
            for (const proofOf1 of proofsOfAList as Proof[]) {
                const claimParams1 = getHttpProviderClaimParamsFromProof(proofOf1);
                const hashableClaimParams1 = JSON.parse(getProviderParamsAsCanonicalizedString(claimParams1)[0]) as HashableHttpProviderClaimParams;
                let hasMatch = false;
                let reasons: string[][] = []
                for (const proofOf2 of proofsOfBList as Proof[]) {
                    const claimParams2 = getHttpProviderClaimParamsFromProof(proofOf2);
                    const hashableClaimParams2 = JSON.parse(getProviderParamsAsCanonicalizedString(claimParams2)[0]) as HashableHttpProviderClaimParams;
                    const inequalityReason = getProofsInequalityReason(hashableClaimParams1, hashableClaimParams2);
                    if (!inequalityReason) {
                        hasMatch = true;
                        break;
                    }
                    if (reasons.length == 0) {
                        reasons.push(inequalityReason);
                    } else if (reasons[reasons.length - 1].length > inequalityReason.length) {
                        // if this has less reasons, add this and remove others
                        reasons = []
                        reasons.push(inequalityReason);
                    } else if (reasons[reasons.length - 1].length == inequalityReason.length) {
                        // if this has same reasons, add this
                        reasons.push(inequalityReason);
                    }
                }
                if (!hasMatch) {
                    throw new Error(`ProofA[${i}] no match. Reasons: ${reasons.map((r) => r.join(", ")).join(", ")} `);
                }
                i++;
            }

            setEvaluationResult('Proof verification successful');
        } catch (e) {
            (window as any)._handle_error = e;
            console.error(e);
            setEvaluationError(`Verification failed: ${e} `);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>Check why proofs don't match</h2>

            <ClaimProofInput
                label={'A'}
                proofResult={proofResult1}
                setProofResult={setProofResult1}
            />
            <ClaimProofInput
                label={'B'}
                proofResult={proofResult2}
                setProofResult={setProofResult2}
            />

            <VerificationActions
                handleComparison={handleComparison}
                loading={loading}
            />

            <VerificationResultDisplay
                evaluationResult={evaluationResult}
                evaluationError={evaluationError}
            />
        </div>
    );
}

function ClaimProofInput({
    label,
    proofResult,
    setProofResult
}: {
    label: string,
    proofResult: string;
    setProofResult: (val: string) => void;
}) {
    return (
        <div className="input-group">
            <label>Claim Proof {label}</label>
            <textarea
                value={proofResult}
                onChange={(e) => setProofResult(e.target.value)}
                placeholder="Enter claim proof"
                rows={4}
            />
        </div>
    );
}

function VerificationActions({
    handleComparison,
    loading,

}: {
    handleComparison: () => void;
    loading: boolean;

}) {
    return (
        <div className="flex items-center gap-3">
            <button className="plg-button" onClick={handleComparison} disabled={loading}>
                {loading ? "Processing..." : "Compare"}
            </button>
        </div>
    );
}

function VerificationResultDisplay({
    evaluationResult,
    evaluationError
}: {
    evaluationResult: string;
    evaluationError: string;
}) {
    return (
        <>
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
        </>
    );
}
