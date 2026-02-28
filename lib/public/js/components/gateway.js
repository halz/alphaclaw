import { h } from "https://esm.sh/preact";
import { useEffect, useState } from "https://esm.sh/preact/hooks";
import htm from "https://esm.sh/htm";
import {
  fetchOpenclawVersion,
  restartGateway,
  updateOpenclaw,
} from "../lib/api.js";
import { showToast } from "./toast.js";
import { UpdateActionButton } from "./update-action-button.js";
const html = htm.bind(h);

function VersionRow({ label, currentVersion, fetchVersion, applyUpdate }) {
  const [checking, setChecking] = useState(false);
  const [version, setVersion] = useState(currentVersion || null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setVersion(currentVersion || null);
  }, [currentVersion]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchVersion(false);
        if (!active) return;
        setVersion(data.currentVersion || currentVersion || null);
        setLatestVersion(data.latestVersion || null);
        setHasUpdate(!!data.hasUpdate);
        setError(data.ok ? "" : data.error || "");
      } catch (err) {
        if (!active) return;
        setError(err.message || "Could not check updates");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleAction = async () => {
    if (checking) return;
    setChecking(true);
    setError("");
    try {
      const data = hasUpdate ? await applyUpdate() : await fetchVersion(true);
      setVersion(data.currentVersion || version);
      setLatestVersion(data.latestVersion || null);
      setHasUpdate(!!data.hasUpdate);
      setError(data.ok ? "" : data.error || "");
      if (hasUpdate) {
        if (!data.ok) {
          showToast(data.error || `${label} update failed`, "error");
        } else if (data.updated || data.restarting) {
          showToast(
            data.restarting
              ? `${label} updated — restarting...`
              : `Updated ${label} to ${data.currentVersion}`,
            "success",
          );
        } else {
          showToast(`Already at latest ${label} version`, "success");
        }
      } else if (data.hasUpdate && data.latestVersion) {
        showToast(
          `${label} update available: ${data.latestVersion}`,
          "warning",
        );
      } else {
        showToast(`${label} is up to date`, "success");
      }
    } catch (err) {
      setError(
        err.message ||
          (hasUpdate ? `Could not update ${label}` : "Could not check updates"),
      );
      showToast(
        hasUpdate ? `Could not update ${label}` : "Could not check updates",
        "error",
      );
    }
    setChecking(false);
  };

  return html`
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs text-gray-300 truncate">
          <span class="text-gray-500">${label}</span>${" "}${version
            ? `${version}`
            : "..."}
        </p>
        ${error && html`<p class="text-xs text-yellow-500 mt-1">${error}</p>`}
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <${UpdateActionButton}
          onClick=${handleAction}
          loading=${checking}
          warning=${hasUpdate}
          idleLabel=${hasUpdate
            ? `Update to ${latestVersion || "latest"}`
            : "Check updates"}
          loadingLabel=${hasUpdate ? "Updating..." : "Checking..."}
        />
      </div>
    </div>
  `;
}

export function Gateway({ status, openclawVersion }) {
  const [restarting, setRestarting] = useState(false);
  const isRunning = status === "running" && !restarting;
  const dotClass = isRunning
    ? "w-2 h-2 rounded-full bg-green-500"
    : "w-2 h-2 rounded-full bg-yellow-500 animate-pulse";

  const handleRestart = async () => {
    if (restarting) return;
    setRestarting(true);
    try {
      await restartGateway();
      showToast("Gateway restarted", "success");
    } catch (err) {
      showToast("Restart failed: " + err.message, "error");
    }
    setRestarting(false);
  };

  return html` <div class="bg-surface border border-border rounded-xl p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class=${dotClass}></span>
          <span class="font-semibold">Gateway:</span>
          <span class="text-gray-400"
            >${restarting ? "restarting..." : status || "checking..."}</span
          >
        </div>
      </div>
      <${UpdateActionButton}
        onClick=${handleRestart}
        disabled=${!status}
        loading=${restarting}
        warning=${false}
        idleLabel="Restart"
        loadingLabel="On it..."
      />
    </div>
    <div class="mt-3 pt-3 border-t border-border">
      <${VersionRow}
        label="OpenClaw"
        currentVersion=${openclawVersion}
        fetchVersion=${fetchOpenclawVersion}
        applyUpdate=${updateOpenclaw}
      />
    </div>
  </div>`;
}
