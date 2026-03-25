import { verifyProof, type Proof, type ValidationConfigWithHash, type ValidationConfigWithProviderInformation } from "@reclaimprotocol/js-sdk";
import { useState } from "react";

type ValidationMethodType = undefined | { type: 'provider', args: ValidationConfigWithProviderInformation } | { type: 'hash', args: ValidationConfigWithHash };

export function VerifyProofSection() {
    const [proofResult, setProofResult] = useState("");
    const [evaluationResult, setEvaluationResult] = useState("");
    const [evaluationError, setEvaluationError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isTEEVerificationRequired, setIsTeeVerificationRequired] = useState(false);
    const [validationMethod, setValidationMethod] = useState<ValidationMethodType>();
    const [validationMethodString, setValidationMethodString] = useState("");

    const handleClaim = async () => {
        setLoading(true);
        setEvaluationResult("");
        setEvaluationError("");
        try {
            // Doing verification without validation and TEE verification
            // to debug the reason of verification failure. Verify Proof resulting false doesn't share reason of failure.
            const verificationResult = await verifyProof(JSON.parse(proofResult) as Proof, { dangerouslyDisableContentValidation: true }, false);
            if (!verificationResult.isVerified) {
                setEvaluationError('Proof verification failed');
                return
            }
            switch (validationMethod?.type) {
                case 'hash':
                    const verificationAndValidationByHashResult = await verifyProof(JSON.parse(proofResult) as Proof, validationMethod.args, false);
                    if (!verificationAndValidationByHashResult.isVerified) {
                        setEvaluationError('Proof validation by hash failed');
                    }
                    break;
                case 'provider':
                    const verificationAndValidationByProviderResult = await verifyProof(JSON.parse(proofResult) as Proof, validationMethod.args, false);
                    if (!verificationAndValidationByProviderResult.isVerified) {
                        setEvaluationError('Proof validation by provider failed');
                    }
                    break;
                default:
                    // no validation
                    break;
            }

            if (isTEEVerificationRequired) {
                const verificationAndTeeResult = await verifyProof(JSON.parse(proofResult) as Proof, { dangerouslyDisableContentValidation: true }, true);
                if (!verificationAndTeeResult.isTeeVerified) {
                    // In this case, `.isVerified` will also be false.
                    setEvaluationError('TEE verification failed');
                    return
                }
            }

            setEvaluationResult('Proof verification successful');
        } catch (e) {
            setEvaluationError(`Verification failed: ${e}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>Claim Proof Verification</h2>

            <ClaimProofInput
                proofResult={proofResult}
                setProofResult={setProofResult}
            />

            <VerificationActions
                handleClaim={handleClaim}
                loading={loading}
                isTEEVerificationRequired={isTEEVerificationRequired}
                setIsTeeVerificationRequired={setIsTeeVerificationRequired}
                validationMethod={validationMethod}
                setValidationMethod={setValidationMethod}
                setValidationMethodString={setValidationMethodString}
            />

            <ValidationArgsInput
                validationMethod={validationMethod}
                validationMethodString={validationMethodString}
                setValidationMethodString={setValidationMethodString}
                setValidationMethod={setValidationMethod}
            />

            <VerificationResultDisplay
                evaluationResult={evaluationResult}
                evaluationError={evaluationError}
            />
        </div>
    );
}

function ClaimProofInput({
    proofResult,
    setProofResult
}: {
    proofResult: string;
    setProofResult: (val: string) => void;
}) {
    return (
        <div className="input-group">
            <label>Claim Proof</label>
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
    handleClaim,
    loading,
    isTEEVerificationRequired,
    setIsTeeVerificationRequired,
    validationMethod,
    setValidationMethod,
    setValidationMethodString
}: {
    handleClaim: () => void;
    loading: boolean;
    isTEEVerificationRequired: boolean;
    setIsTeeVerificationRequired: (val: boolean) => void;
    validationMethod: ValidationMethodType;
    setValidationMethod: (val: ValidationMethodType) => void;
    setValidationMethodString: (val: string) => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <button className="plg-button" onClick={handleClaim} disabled={loading}>
                {loading ? "Processing..." : "Test Proof"}
            </button>
            <button
                className={`plg-button outlined ${isTEEVerificationRequired ? "" : "inactive"}`}
                onClick={() => setIsTeeVerificationRequired(!isTEEVerificationRequired)}
            >
                Check TEE
                {isTEEVerificationRequired ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 0 24 24"
                        width="24px"
                        fill="currentColor"
                    >
                        <path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 0 24 24"
                        width="24px"
                        fill="grey"
                    >
                        <path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                    </svg>
                )}
            </button>
            <select
                value={validationMethod?.type || "none"}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === "none") {
                        setValidationMethod(undefined);
                        setValidationMethodString("");
                    } else if (val === "provider") {
                        const defaultProviderArgs: Extract<ValidationMethodType, { type: 'provider' }>['args'] = {
                            providerId: 'example',
                            providerVersion: '3.0.0',
                            allowedTags: [],
                        };
                        setValidationMethod({ type: "provider", args: defaultProviderArgs });
                        setValidationMethodString(JSON.stringify(defaultProviderArgs, null, 2));
                    } else if (val === "hash") {
                        const defaultHashArgs: Extract<ValidationMethodType, { type: 'hash' }>['args'] = {
                            hashes: [{ value: "0x...", required: true, multiple: true }]
                        };
                        setValidationMethod({ type: "hash", args: defaultHashArgs });
                        setValidationMethodString(JSON.stringify(defaultHashArgs, null, 2));
                    }
                }}
            >
                <option id="no-validation" value="none">No Validation</option>
                <option id="provider-validation" value="provider">Provider Validation</option>
                <option id="hash-validation" value="hash">Hash Validation</option>
            </select>
        </div>
    );
}

function ValidationArgsInput({
    validationMethod,
    validationMethodString,
    setValidationMethodString,
    setValidationMethod
}: {
    validationMethod: ValidationMethodType;
    validationMethodString: string;
    setValidationMethodString: (val: string) => void;
    setValidationMethod: (val: ValidationMethodType) => void;
}) {
    if (!validationMethod) return null;

    return (
        <div className="input-group" style={{ marginTop: '1rem' }}>
            <label>Validation Args (JSON)</label>
            <textarea
                value={validationMethodString}
                onChange={(e) => {
                    setValidationMethodString(e.target.value);
                    try {
                        const parsed = JSON.parse(e.target.value);
                        setValidationMethod({ type: validationMethod.type, args: parsed } as any);
                    } catch (err) {
                        // Ignore parse errors while typing
                    }
                }}
                placeholder="Enter validation args as JSON"
                rows={6}
                style={{ width: '100%', padding: '8px', fontFamily: 'monospace' }}
            />
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

