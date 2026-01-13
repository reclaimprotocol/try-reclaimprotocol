import "./index.css";
import { useExpertContext } from "../../contexts/ExpertContext";
import { showSnackbar } from "../../components/Snackbar";
import { useNavigate } from "react-router";

function Page() {
  const { settings, updateSettings, saveSettings, resetSettings } =
    useExpertContext();

  const navigate = useNavigate();

  const handleSave = () => {
    // Validate JSON fields
    try {
      if (settings.parameters) JSON.parse(settings.parameters);
    } catch (_) {
      showSnackbar("Invalid JSON in Parameters field.");
      return;
    }

    try {
      if (settings.context) JSON.parse(settings.context);
    } catch (_) {
      showSnackbar("Invalid JSON in Context field.");
      return;
    }

    try {
      if (settings.metadata) JSON.parse(settings.metadata);
    } catch (_) {
      showSnackbar("Invalid JSON in Metadata field.");
      return;
    }

    saveSettings();
    showSnackbar("Settings saved!");
    navigate("/");
  };

  const handleReset = () => {
    resetSettings();
    showSnackbar("Settings reset!");
  };

  return (
    <div className="sub-container">
      <h2 className="main-heading">Expert options</h2>

      <p className="subheading">Configure advanced options for verification.</p>

      <div className="settings-card">
        <div className="setting-header">
          <div>
            <div className="setting-title">Expert Mode</div>
            <div className="setting-desc">
              Enable advanced configuration options.
            </div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.isExpertModeEnabled}
              onChange={(e) =>
                updateSettings({ isExpertModeEnabled: e.target.checked })
              }
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Auto Trigger Flow</div>
        <div className="setting-desc">
          Starts the flow automatically when the verify page loads (applies to
          this demo only).
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.autoTriggerFlow}
            disabled={!settings.isExpertModeEnabled}
            onChange={(e) =>
              updateSettings({ autoTriggerFlow: e.target.checked })
            }
          />
          <span className="slider"></span>
        </label>
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Can Auto Submit</div>
        <div className="setting-desc">
          Whether the verification client should automatically submit necessary
          proofs once they are generated. If set to false, the user must
          manually click a button to submit.
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.canAutoSubmit}
            disabled={!settings.isExpertModeEnabled}
            onChange={(e) =>
              updateSettings({ canAutoSubmit: e.target.checked })
            }
          />
          <span className="slider"></span>
        </label>
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Use deferred deep links flow</div>
        <div className="setting-desc">
          Use deferred deep links flow for verification when doing verifications
          on phone.
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.useDeferredDeepLinksFlow}
            disabled={!settings.isExpertModeEnabled}
            onChange={(e) =>
              updateSettings({ useDeferredDeepLinksFlow: e.target.checked })
            }
          />
          <span className="slider"></span>
        </label>
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Parameters</div>
        <div className="setting-desc">
          JSON string of parameters to override.
        </div>
        <textarea
          className="input-tile"
          placeholder='{"key": "value"}'
          value={settings.parameters}
          onChange={(e) => updateSettings({ parameters: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Provider Version</div>
        <div className="setting-desc">
          Specific provider version to use. Leaving this blank will use the
          latest version.
        </div>
        <input
          type="text"
          className="input-tile"
          placeholder="v1.0.0"
          value={settings.providerVersion}
          onChange={(e) => updateSettings({ providerVersion: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Callback URL</div>
        <div className="setting-desc">URL to receive proof callbacks.</div>
        <input
          type="text"
          className="input-tile"
          placeholder="https://example.com/callback"
          value={settings.callbackUrl}
          onChange={(e) => updateSettings({ callbackUrl: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Context</div>
        <div className="setting-desc">JSON string for additional context.</div>
        <textarea
          className="input-tile"
          placeholder='{"contextId": "123"}'
          value={settings.context}
          onChange={(e) => updateSettings({ context: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Redirect URL</div>
        <div className="setting-desc">URL to redirect after verification.</div>
        <input
          type="text"
          className="input-tile"
          placeholder="https://example.com/success"
          value={settings.redirectUrl}
          onChange={(e) => updateSettings({ redirectUrl: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Share Page URL</div>
        <div className="setting-desc">
          URL to the page which decides where verification should happen.
        </div>
        <input
          type="text"
          className="input-tile"
          placeholder="Enter Share Page URL"
          value={settings.sharePageUrl}
          onChange={(e) => updateSettings({ sharePageUrl: e.target.value })}
        />
      </div>
      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Use App Clip</div>
        <div className="setting-desc">
          Whether to use App Clip for verification.
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.useAppClip}
            disabled={!settings.isExpertModeEnabled}
            onChange={(e) =>
              updateSettings({ useAppClip: e.target.checked })
            }
          />
          <span className="slider"></span>
        </label>
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Custom App Clip URL</div>
        <div className="setting-desc">
          URL for the custom App Clip.
        </div>
        <input
          type="text"
          className="input-tile"
          placeholder="Enter Custom App Clip URL"
          value={settings.customAppClipUrl}
          onChange={(e) => updateSettings({ customAppClipUrl: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Extension ID</div>
        <div className="setting-desc">
          The ID of the browser extension.
        </div>
        <input
          type="text"
          className="input-tile"
          placeholder="Enter Extension ID"
          value={settings.extensionID}
          onChange={(e) => updateSettings({ extensionID: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Use Browser Extension</div>
        <div className="setting-desc">
          Whether to use the browser extension for verification.
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.useBrowserExtension}
            disabled={!settings.isExpertModeEnabled}
            onChange={(e) =>
              updateSettings({ useBrowserExtension: e.target.checked })
            }
          />
          <span className="slider"></span>
        </label>
      </div>


      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Metadata</div>
        <div className="setting-desc">
          Additional metadata to pass to the verification client. JSON string of
          metadata.
        </div>
        <textarea
          className="input-tile"
          placeholder='{"key": "value"}'
          value={settings.metadata}
          onChange={(e) => updateSettings({ metadata: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Env URL</div>
        <div className="setting-desc">
          Environment URL.
        </div>
        <input
          type="text"
          className="input-tile"
          placeholder="Enter Env URL"
          value={settings.envUrl || ""}
          onChange={(e) => updateSettings({ envUrl: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">App ID</div>
        <div className="setting-desc">Your Reclaim App ID.</div>
        <input
          type="text"
          className="input-tile"
          placeholder="Enter App ID"
          value={settings.appId}
          onChange={(e) => updateSettings({ appId: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">App Secret</div>
        <div className="setting-desc">Your Reclaim App Secret.</div>
        <input
          type="password"
          className="input-tile"
          placeholder="Enter App Secret"
          value={settings.appSecret}
          onChange={(e) => updateSettings({ appSecret: e.target.value })}
        />
      </div>

      <div className="mb-10"></div>

      <div className="save-btn-container">
        <button className="btn-secondary me-2" onClick={handleReset}>
          Reset Settings
        </button>
        <button className="btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Page;
