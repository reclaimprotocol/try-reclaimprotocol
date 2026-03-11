import { useEffect, useState } from "react";
import "./index.css";
import StartVerificationButton from "../StartVerificationButton";

interface Provider {
  httpProviderId: string;
  name: string;
  description: string;
  logoUrl: string;
}

const getProvidersByQuery = async (query: string, abortSignal: AbortSignal) => {
  let isVerifiedQuery = "";
  if (!query.trim()) {
    isVerifiedQuery = "&isVerified=true";
  }
  const res = await fetch(
    `https://api.reclaimprotocol.org/api/providers/active/paginated?pageKey=0&pageSize=20&searchQuery=${encodeURIComponent(query.trim())}${isVerifiedQuery}`,
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

  useEffect(() => {
    const savedProviderInfo = sessionStorage.getItem("savedProviderInfo");
    if (savedProviderInfo) {
      setProviders(JSON.parse(savedProviderInfo));
    }
    const savedProviderId = sessionStorage.getItem("providerId");
    if (savedProviderId) {
      setQuery(savedProviderId);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchProviders = async () => {
      try {
        const providers = await getProvidersByQuery(
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
  }, [query]); // existing dependency

  const handleSelect = (provider: Provider) => {
    setQuery(provider.httpProviderId);
    setSelectedProvider(provider);
    setIsOpen(false);
    sessionStorage.setItem("providerId", provider.httpProviderId);
    sessionStorage.setItem("savedProviderInfo", JSON.stringify(provider));
  };

  const handleClear = () => {
    sessionStorage.removeItem("providerId");
    sessionStorage.removeItem("savedProviderInfo");
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
                    sessionStorage.setItem("providerId", val);
                  } else {
                    sessionStorage.removeItem("providerId");
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
                    href="https://dev.reclaimprotocol.org"
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
