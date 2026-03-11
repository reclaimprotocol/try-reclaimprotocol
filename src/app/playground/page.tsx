import "./index.css";
import { EvaluatorSection } from "./components/EvaluatorSection";
import { ClaimRequestSection } from "./components/ClaimRequestSection";
import { useEffect } from "react";
import { installReclaimStrings } from "../../utils/reclaim_strings";
import { showSnackbar } from "../../components/Snackbar";
import { VerifyProofSection } from "./components/VerifyProofSection";

// Playground page for testing claim evaluation
function Page() {
  useEffect(() => {
    // deferred loading of window.ReclaimStrings
    installReclaimStrings();

    const checkReady = setTimeout(() => {
      if (!("reclaimStrings" in window)) {
        showSnackbar("Could not install reclaimStrings");
      }
    }, 1000);

    return () => clearTimeout(checkReady);
  }, []);

  return (
    <>
      <div className="sub-container">
        <h2 className="main-heading">Playground</h2>

        <p className="subheading">
          Try evaluation or claim creation using Reclaim protocol attestor.
        </p>

        <div className="section-container">
          <EvaluatorSection
            title="JSON Path Evaluation"
            evaluate={(path, data) =>
              window.reclaimStrings.evaluateJsonPath(path, data)
            }
          />
          <EvaluatorSection
            title="XML Path Evaluation"
            evaluate={(path, data) =>
              window.reclaimStrings.evaluateXPath(path, data, true)
            }
          />
          <ClaimRequestSection />
          <VerifyProofSection />
        </div>
      </div>
    </>
  );
}

export default Page;
