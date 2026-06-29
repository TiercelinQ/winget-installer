import { spawn, type ChildProcess } from "node:child_process";
import type { PackageInfo, InstalledPackage, UpgradeInfo } from "../../shared/types";
import { WingetError } from "./errors";

const ANSI_RE = /\x1B\[[0-9;]*[a-zA-Z]/g;

function stripAnsi(str: string): string {
  return str.replace(ANSI_RE, "");
}

const SPINNER_CHARS = new Set(["-", "\\", "|", "/"]);

/** True for winget spinner frames and download-progress lines — visual noise in the install log. */
function isInstallNoise(line: string): boolean {
  if ([...line].every((ch) => SPINNER_CHARS.has(ch))) return true; // spinner frames (- \ | /)
  if (/[█▓▒░]/.test(line)) return true; // progress bar blocks
  if (/\d+(?:[.,]\d+)?\s*[KMGT]?B\s*\/\s*\d+(?:[.,]\d+)?\s*[KMGT]?B/.test(line)) return true; // "X MB / Y MB"
  return false;
}

let activeProcess: ChildProcess | null = null;
let cancelRequested = false;

/**
 * Runs a read-only winget command and resolves with its raw stdout.
 * winget has no machine-readable output for search/list/upgrade — it prints a
 * space-aligned text table — so the output is parsed by `parseTable`.
 */
function runTextCommand(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const proc = spawn(
      "winget",
      [...args, "--accept-source-agreements", "--disable-interactivity"],
      { windowsHide: true },
    );

    proc.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    proc.stderr.on("data", () => { /* progress noise discarded */ });

    proc.on("close", () => {
      // Strip BOM; resolve regardless of exit code (winget returns non-zero when a list is empty)
      const output = Buffer.concat(chunks).toString("utf8").replace(/^﻿/, "");
      resolve(output);
    });

    proc.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ENOENT") {
        reject(new WingetError("winget est introuvable. Veuillez l'installer depuis le Microsoft Store."));
      } else {
        reject(new WingetError(`Impossible de lancer winget : ${err.message}`));
      }
    });
  });
}

interface TableRow {
  name: string;
  id: string;
  version: string;
  available: string | null;
  source: string;
}

/**
 * Parses winget's aligned text table. Columns are located by the start position
 * of each header token (separated by 2+ spaces), so values containing spaces
 * (e.g. "VLC media player") are sliced correctly. The header is the line just
 * above the dashed separator; data rows follow until the first blank line.
 */
function parseTable(raw: string): TableRow[] {
  // winget separates the progress spinner from the table with bare \r; normalize
  // CRLF first, then lone CR, so the spinner does not glue onto the header line.
  const lines = stripAnsi(raw).replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  const sepIdx = lines.findIndex((l) => {
    const t = l.trim();
    return t.length >= 5 && /^-+$/.test(t);
  });
  if (sepIdx < 1) return [];

  const header = lines[sepIdx - 1];
  const starts: number[] = [];
  const tokenRe = /(?:^|\s{2,})\S/g;
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(header)) !== null) {
    starts.push(m.index === 0 ? 0 : m.index + m[0].length - 1);
  }
  if (starts.length < 3) return [];

  const rows: TableRow[] = [];
  for (let i = sepIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) break;

    // winget appends free-text summary lines after the table without a blank
    // separator (e.g. "N mises à niveau disponibles."). Real rows are column-
    // aligned, so every column boundary is preceded by padding whitespace; a
    // sentence is not. The first misaligned line marks the end of the table.
    const aligned = starts.every((s) => s === 0 || s - 1 >= line.length || line[s - 1] === " ");
    if (!aligned) break;
    if (line.length < starts[1]) continue;

    const slice = (a: number, b?: number): string => line.slice(a, b).trim();
    const name = slice(starts[0], starts[1]);
    const id = slice(starts[1], starts[2]);
    const version = slice(starts[2], starts[3]);

    // Columns past the version (available + source) are split by whitespace.
    // The source is always the trailing token; an available version, when
    // present, is the token before it.
    const restTokens = starts[3] != null
      ? line.slice(starts[3]).trim().split(/\s+/).filter(Boolean)
      : [];
    const source = restTokens[restTokens.length - 1] ?? "winget";
    const available = restTokens.length >= 2 ? restTokens[0] : null;

    if (!id) continue;
    rows.push({ name: name || id, id, version, available, source });
  }
  return rows;
}

/** Spawns a single winget install/upgrade process and streams its output via onLog. */
function spawnWinget(args: string[], onLog: (line: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("winget", args, { windowsHide: true });
    activeProcess = proc;

    const handleData = (chunk: Buffer) => {
      // winget redraws spinner/progress with bare \r; split on both so each frame is
      // isolated, then drop the noise — keep only textual milestones in the log.
      const text = stripAnsi(chunk.toString("utf8"));
      for (const raw of text.split(/[\r\n]+/)) {
        const line = raw.trim();
        if (!line || isInstallNoise(line)) continue;
        onLog(line);
      }
    };

    proc.stdout.on("data", handleData);
    proc.stderr.on("data", handleData);

    proc.on("close", (code) => {
      activeProcess = null;
      // Exit code 0 = success; -1 = killed by cancelInstall
      if (code === 0 || code === null) {
        resolve();
      } else {
        reject(new WingetError(`winget a terminé avec le code ${code}`));
      }
    });

    proc.on("error", (err: NodeJS.ErrnoException) => {
      activeProcess = null;
      if (err.code === "ENOENT") {
        reject(new WingetError("winget est introuvable. Veuillez l'installer depuis le Microsoft Store."));
      } else {
        reject(new WingetError(`Impossible de lancer winget : ${err.message}`));
      }
    });
  });
}

/** Searches the winget catalog. Returns an empty array for blank queries. */
export async function search(query: string): Promise<PackageInfo[]> {
  if (!query.trim()) return [];

  const raw = await runTextCommand(["search", query]);
  return parseTable(raw).map((row) => ({
    id: row.id,
    name: row.name,
    version: row.version,
    publisher: "",
    source: row.source,
  }));
}

/**
 * Installs packages one at a time, streaming log lines via onLog.
 * Aborts the loop when cancelInstall() is called.
 */
export async function install(ids: string[], onLog: (line: string) => void): Promise<void> {
  cancelRequested = false;

  for (let i = 0; i < ids.length; i++) {
    if (cancelRequested) break;

    const id = ids[i];
    onLog(`\n─── Installation ${i + 1}/${ids.length} : ${id} ───`);

    await spawnWinget(
      ["install", "--id", id, "--exact", "--accept-package-agreements", "--accept-source-agreements", "--disable-interactivity"],
      onLog,
    );

    if (cancelRequested) break;
  }
}

/** Cancels an ongoing install or upgrade. */
export function cancelInstall(): void {
  cancelRequested = true;
  if (activeProcess) {
    activeProcess.kill();
    activeProcess = null;
  }
}

/** Returns the list of packages managed by winget. */
export async function list(): Promise<InstalledPackage[]> {
  const raw = await runTextCommand(["list"]);
  return parseTable(raw).map((row) => ({
    id: row.id,
    name: row.name,
    installedVersion: row.version,
    availableVersion: row.available,
  }));
}

/** Returns packages that have an upgrade available. */
export async function upgrades(): Promise<UpgradeInfo[]> {
  const raw = await runTextCommand(["upgrade"]);
  return parseTable(raw)
    .filter((row) => row.available !== null)
    .map((row) => ({
      id: row.id,
      name: row.name,
      installedVersion: row.version,
      availableVersion: row.available as string,
    }));
}

/** Upgrades a single package, streaming log lines via onLog. */
export async function upgradeOne(id: string, onLog: (line: string) => void): Promise<void> {
  cancelRequested = false;
  onLog(`─── Mise à jour : ${id} ───`);
  await spawnWinget(
    ["upgrade", "--id", id, "--exact", "--accept-package-agreements", "--accept-source-agreements", "--disable-interactivity"],
    onLog,
  );
}
