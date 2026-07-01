import { useEffect, useState } from "react";
import "./index.css";
import StartVerificationButton from "../StartVerificationButton";
import { API_ENDPOINTS, LINKS, STORAGE_KEYS } from "../../constants";
import {
  useActiveEnvironment,
  useBackendApiBaseUrl,
} from "../../hooks/useEnvironment";

interface Provider {
  httpProviderId: string;
  name: string;
  description: string;
  logoUrl: string;
}

const getProvidersByQuery = async (
  baseUrl: string,
  query: string,
  abortSignal: AbortSignal,
) => {
  const trimmedQuery = query.trim();
  const res = await fetch(
    API_ENDPOINTS.searchProviders(baseUrl, trimmedQuery, !trimmedQuery),
    {
      signal: abortSignal,
    },
  );
  const data = await res.json();
  if (data.providers) {
    return data.providers as Provider[];
  }
  return null;
};

export default function SelectProviderForVerification() {
  const [query, setQuery] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const baseUrl = useBackendApiBaseUrl();
  const activeEnv = useActiveEnvironment();

  // Provider ids and results are environment-specific: a provider selected on
  // production won't resolve against staging (and vice versa). We stamp the
  // persisted selection with the environment it belongs to, then restore it
  // only while the active environment still matches. When the environment
  // changes (Expert-mode toggle or environment switch) the stale selection is
  // dropped so the search starts clean instead of showing a cross-env mix.
  useEffect(() => {
    const savedEnv = sessionStorage.getItem(STORAGE_KEYS.providerEnv);
    if (savedEnv && savedEnv !== activeEnv) {
      sessionStorage.removeItem(STORAGE_KEYS.providerId);
      sessionStorage.removeItem(STORAGE_KEYS.savedProviderInfo);
      setQuery("");
      setSelectedProvider(null);
      setProviders([]);
    } else {
      const savedProviderInfo = sessionStorage.getItem(
        STORAGE_KEYS.savedProviderInfo,
      );
      if (savedProviderInfo) {
        setProviders(JSON.parse(savedProviderInfo));
      }
      const savedProviderId = sessionStorage.getItem(STORAGE_KEYS.providerId);
      if (savedProviderId) {
        setQuery(savedProviderId);
      }
    }
    sessionStorage.setItem(STORAGE_KEYS.providerEnv, activeEnv);
  }, [activeEnv]);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchProviders = async () => {
      try {
        const providers = await getProvidersByQuery(
          baseUrl,
          query,
          abortController.signal,
        );
        if (providers) {
          setProviders(providers);
          // If we have a query (ID) but no selected provider, check if it matches one of the results
          if (query && !selectedProvider) {
            const match = providers.find((p) => p.httpProviderId === query);
            if (match) {
              setSelectedProvider(match);
            }
          }
        }
      } catch (error) {
        if (abortController.signal.aborted) return;

        console.error("Failed to fetch providers", error);
      }
    };

    const timeoutId = setTimeout(fetchProviders, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query, baseUrl]); // re-query when the query or active environment changes

  const handleSelect = (provider: Provider) => {
    setQuery(provider.httpProviderId);
    setSelectedProvider(provider);
    setIsOpen(false);
    sessionStorage.setItem(STORAGE_KEYS.providerId, provider.httpProviderId);
    sessionStorage.setItem(
      STORAGE_KEYS.savedProviderInfo,
      JSON.stringify(provider),
    );
  };

  const handleClear = () => {
    sessionStorage.removeItem(STORAGE_KEYS.providerId);
    sessionStorage.removeItem(STORAGE_KEYS.savedProviderInfo);
    setQuery("");
    setSelectedProvider(null);
    setIsOpen(true);
  };

  const actionBar = (
    <div className="action-bar">
      <StartVerificationButton providerId={query.trim()} />
    </div>
  );

  return (
    <div className="provider-selector-wrapper">
      <div className={`search-container ${isOpen ? "open" : ""}`}>
        <div className="input-wrapper">
          {selectedProvider && !isOpen ? (
            <div
              className="selected-provider-card"
              onClick={() => setIsOpen(true)}
            >
              <div className="selected-provider-info">
                <img
                  src={selectedProvider.logoUrl}
                  alt={selectedProvider.name}
                  className="selected-provider-icon"
                />
                <span className="selected-provider-name">
                  {selectedProvider.name}
                </span>
              </div>
              <button
                className="clear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ) : (
            <input
              type="text"
              placeholder="Search for a data provider"
              className="input-field"
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (typeof window !== "undefined") {
                  if (val) {
                    sessionStorage.setItem(STORAGE_KEYS.providerId, val);
                  } else {
                    sessionStorage.removeItem(STORAGE_KEYS.providerId);
                  }
                }
                if (selectedProvider) setSelectedProvider(null);
              }}
              onFocus={() => setIsOpen(true)}
              // Delay closing to allow clicking on items
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />
          )}
        </div>

        {isOpen && (
          <div className="dropdown-overlay">
            {providers.length > 0 && (
              <div className="results-list">
                {providers.map((provider) => (
                  <div
                    key={provider.httpProviderId}
                    className="result-item"
                    onClick={() => handleSelect(provider)}
                  >
                    <img
                      src={provider.logoUrl}
                      alt={provider.name}
                      className="result-icon"
                    />
                    <div className="result-info">
                      <div className="result-name">{provider.name}</div>
                      <div className="result-desc">{provider.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.trim() ? (
              <div className="mt-1">
                <p>
                  Can't find what you're looking for? You can build your own
                  provider.{" "}
                  <a
                    href={LINKS.devPortal}
                    className="link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Learn More
                  </a>
                </p>
              </div>
            ) : undefined}

            <div className="action-bar-in-overlay">{actionBar}</div>
          </div>
        )}
      </div>

      {actionBar}
    </div>
  );
}
