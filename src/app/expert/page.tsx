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
        <div className="setting-title">
          Launch Method
          <DocLink href="https://docs.reclaimprotocol.org/js-sdk/generating-proof#trigger-the-proof-generation-flow-with-the-user" />
        </div>
        <div className="setting-desc">
          Change how the flow starts. `js-sdk` will use `.triggerReclaimFlow`
          function from Reclaim SDK to start the flow. `windowopen` will open
          the flow in a new window. `none` will not start the flow
          automatically. (applies to this demo only).
        </div>
        <select
          className="input-tile"
          value={settings.launchMethod}
          disabled={!settings.isExpertModeEnabled}
          onChange={(e) =>
            updateSettings({
              launchMethod: e.target.value as "none" | "js-sdk.portal" | "js-sdk.app" | "windowopen",
            })
          }
        >
          <option value="none">None</option>
          <option value="js-sdk.portal">JS SDK Portal</option>
          <option value="js-sdk.app">JS SDK App</option>
          <option value="windowopen">Window Open</option>
        </select>
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
        <div className="setting-title">
          Parameters
          <DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#set-parameters" />
        </div>
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
        <div className="setting-title">
          Callback URL
          <DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#success-callback" />
        </div>
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
        <div className="setting-title">
          Cancel Callback URL
          <DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#cancel-callback" />
        </div>
        <div className="setting-desc">URL to receive cancel callbacks. Happens after verification is aborted by provider or cancelled by user.</div>
        <input
          type="text"
          className="input-tile"
          placeholder="https://example.com/cancel-callback"
          value={settings.cancelCallbackUrl}
          onChange={(e) => updateSettings({ cancelCallbackUrl: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">
          Context
          <DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#set-context" />
        </div>
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
        <div className="setting-title">Redirect URL<DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#success-redirect-url" /></div>
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
        <div className="setting-title">
          Redirect Method
          <DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#success-redirect-url" />
        </div>
        <div className="setting-desc">
          The method used to redirect after verification. Supported only on In-Browser SDK.
        </div>
        <select
          className="input-tile"
          value={settings.redirectRequestMethod}
          disabled={!settings.isExpertModeEnabled}
          onChange={(e) =>
            updateSettings({
              redirectRequestMethod: e.target.value as "GET" | "POST",
            })
          }
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Redirect Request Body<DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#success-redirect-url" /></div>
        <div className="setting-desc">
          The request body sent on redirect after verification.
          This must be an array of objects with string name and value.
        </div>
        <textarea
          className="input-tile"
          placeholder='[{"name": "string", "value": "string"}]'
          value={settings.redirectRequestBody}
          onChange={(e) => updateSettings({ redirectRequestBody: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Cancel Redirect URL<DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#cancel-redirect-url" /></div>
        <div className="setting-desc">URL to redirect after verification is aborted by provider or cancelled by user.</div>
        <input
          type="text"
          className="input-tile"
          placeholder="https://example.com/failure"
          value={settings.cancelRedirectUrl}
          onChange={(e) => updateSettings({ cancelRedirectUrl: e.target.value })}
        />
      </div>
      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">
          Cancel Redirect Method
          <DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#cancel-redirect-url" />
        </div>
        <div className="setting-desc">
          The method used to redirect after verification. Supported only on In-Browser SDK.
        </div>
        <select
          className="input-tile"
          value={settings.cancelRedirectRequestMethod}
          disabled={!settings.isExpertModeEnabled}
          onChange={(e) =>
            updateSettings({
              cancelRedirectRequestMethod: e.target.value as "GET" | "POST",
            })
          }
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Cancel Redirect Request Body<DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#cancel-redirect-url" /></div>
        <div className="setting-desc">
          The request body sent on redirect after verification.
          This must be an array of objects with string name and value.
        </div>
        <textarea
          className="input-tile"
          placeholder='[{"name": "string", "value": "string"}]'
          value={settings.cancelRedirectRequestBody}
          onChange={(e) => updateSettings({ cancelRedirectRequestBody: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Preferred Locale<DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#set-preferred-locale-for-verification-client" /></div>
        <div className="setting-desc">Preferred locale for the verification UI shown to users.</div>
        <input
          type="text"
          className="input-tile"
          placeholder="en"
          value={settings.preferredLocale}
          onChange={(e) => updateSettings({ preferredLocale: e.target.value })}
        />
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">
          Share Page URL
          <DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#using-the-in-browser-sdk" />
        </div>
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
            onChange={(e) => updateSettings({ useAppClip: e.target.checked })}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div
        className={`settings-card ${!settings.isExpertModeEnabled ? "disabled" : ""}`}
      >
        <div className="setting-title">Custom App Clip URL</div>
        <div className="setting-desc">URL for the custom App Clip.</div>
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
        <div className="setting-title">
          Extension ID
          <DocLink href="https://docs.reclaimprotocol.org/browser-extension#overview" />
        </div>
        <div className="setting-desc">The ID of the browser extension.</div>
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
        <div className="setting-title">
          Use Browser Extension
          <DocLink href="https://docs.reclaimprotocol.org/browser-extension#overview" />
        </div>
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
        <div className="setting-title">Metadata<DocLink href="https://docs.reclaimprotocol.org/js-sdk/preparing-request#add-additional-metadata-for-verification-client" /></div>
        <div className="setting-desc">
          Additional metadata to pass as JSON string to the verification client.
          This can be used to customize the client experience, such as
          customizing themes or UI by passing context-specific information. The
          keys and values must be strings. For most clients, this is not
          required and goes unused.
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
          URL of HTTP service that will be used from js sdk for reclaim sdk
          operations like initializing a verification session.
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
        <div className="setting-title">
          App ID
          <DocLink href="https://docs.reclaimprotocol.org/api-key#copy-your-application-id-and-secret" />
        </div>
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
        <div className="setting-title">
          App Secret
          <DocLink href="https://docs.reclaimprotocol.org/api-key#copy-your-application-id-and-secret" />
        </div>
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
        <button className="btn-secondary" onClick={handleReset}>
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

const DocLink = ({ href }: { href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center ms-2 text-xs text-gray-400 hover:text-blue-500 transition-colors align-text-center"
    onClick={(e) => e.stopPropagation()}
    title="View Documentation"
  >
    <span className="me-1">View Documentation</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  </a>
);
