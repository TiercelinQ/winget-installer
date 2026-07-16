/**
 * Curated catalog: static reference data browsed in the Catalog tab.
 * winget exposes no full-catalog enumeration nor categories, so this hand-picked
 * selection groups popular packages by category. Each `id` is a verified winget
 * PackageIdentifier; installation reuses the existing `winget:install` flow.
 * `labelKey` resolves against `i18n/fr.json` → `categories`.
 */

import {
  Globe,
  MessagesSquare,
  Code,
  Film,
  Briefcase,
  Wrench,
  Share2,
  Boxes,
  Coffee,
  ShieldHalf,
  Image,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

export interface CuratedPackage {
  id: string;
  name: string;
}

export interface CatalogCategory {
  /** Matches a key under `categories` in fr.json. */
  labelKey: string;
  /** Lucide icon component for the category chip. */
  icon: LucideIcon;
  packages: CuratedPackage[];
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    labelKey: "browsers",
    icon: Globe,
    packages: [
      { id: "Google.Chrome", name: "Google Chrome" },
      { id: "Mozilla.Firefox", name: "Mozilla Firefox" },
      { id: "Brave.Brave", name: "Brave" },
      { id: "Opera.Opera", name: "Opera" },
      { id: "Vivaldi.Vivaldi", name: "Vivaldi" },
      { id: "TorProject.TorBrowser", name: "Tor Browser" },
      { id: "LibreWolf.LibreWolf", name: "LibreWolf" },
    ],
  },
  {
    labelKey: "communication",
    icon: MessagesSquare,
    packages: [
      { id: "Discord.Discord", name: "Discord" },
      { id: "Zoom.Zoom", name: "Zoom" },
      { id: "Telegram.TelegramDesktop", name: "Telegram" },
      { id: "SlackTechnologies.Slack", name: "Slack" },
      { id: "Microsoft.Teams", name: "Microsoft Teams" },
      { id: "OpenWhisperSystems.Signal", name: "Signal" },
      { id: "Element.Element", name: "Element" },
    ],
  },
  {
    labelKey: "development",
    icon: Code,
    packages: [
      { id: "Microsoft.VisualStudioCode", name: "Visual Studio Code" },
      { id: "Git.Git", name: "Git" },
      { id: "OpenJS.NodeJS", name: "Node.js" },
      { id: "Python.Python.3.12", name: "Python 3.12" },
      { id: "Docker.DockerDesktop", name: "Docker Desktop" },
      { id: "GitHub.GitHubDesktop", name: "GitHub Desktop" },
      { id: "Notepad++.Notepad++", name: "Notepad++" },
      { id: "Microsoft.PowerShell", name: "PowerShell" },
      { id: "Microsoft.WindowsTerminal", name: "Windows Terminal" },
      { id: "Postman.Postman", name: "Postman" },
      { id: "DBeaver.DBeaver.Community", name: "DBeaver Community" },
      { id: "JetBrains.Toolbox", name: "JetBrains Toolbox" },
      { id: "Insomnia.Insomnia", name: "Insomnia" },
    ],
  },
  {
    labelKey: "multimedia",
    icon: Film,
    packages: [
      { id: "VideoLAN.VLC", name: "VLC media player" },
      { id: "OBSProject.OBSStudio", name: "OBS Studio" },
      { id: "Audacity.Audacity", name: "Audacity" },
      { id: "GIMP.GIMP", name: "GIMP" },
      { id: "HandBrake.HandBrake", name: "HandBrake" },
      { id: "Spotify.Spotify", name: "Spotify" },
      { id: "XBMCFoundation.Kodi", name: "Kodi" },
      { id: "clsid2.mpc-hc", name: "MPC-HC" },
      { id: "Stremio.Stremio", name: "Stremio" },
    ],
  },
  {
    labelKey: "office",
    icon: Briefcase,
    packages: [
      { id: "TheDocumentFoundation.LibreOffice", name: "LibreOffice" },
      { id: "Adobe.Acrobat.Reader.64-bit", name: "Adobe Acrobat Reader" },
      { id: "Notion.Notion", name: "Notion" },
      { id: "Obsidian.Obsidian", name: "Obsidian" },
      { id: "Mozilla.Thunderbird", name: "Mozilla Thunderbird" },
      { id: "SumatraPDF.SumatraPDF", name: "SumatraPDF" },
      { id: "ONLYOFFICE.DesktopEditors", name: "ONLYOFFICE" },
      { id: "Joplin.Joplin", name: "Joplin" },
      { id: "DigitalScholar.Zotero", name: "Zotero" },
    ],
  },
  {
    labelKey: "utilities",
    icon: Wrench,
    packages: [
      { id: "7zip.7zip", name: "7-Zip" },
      { id: "Microsoft.PowerToys", name: "Microsoft PowerToys" },
      { id: "voidtools.Everything", name: "Everything" },
      { id: "RARLab.WinRAR", name: "WinRAR" },
      { id: "Greenshot.Greenshot", name: "Greenshot" },
      { id: "CPUID.CPU-Z", name: "CPU-Z" },
      { id: "ShareX.ShareX", name: "ShareX" },
      { id: "Rufus.Rufus", name: "Rufus" },
      { id: "Devolutions.UniGetUI", name: "UniGetUI" },
      { id: "AntibodySoftware.WizTree", name: "WizTree" },
      { id: "AutoHotkey.AutoHotkey", name: "AutoHotkey" },
    ],
  },
  {
    labelKey: "fileSharing",
    icon: Share2,
    packages: [
      { id: "qBittorrent.qBittorrent", name: "qBittorrent" },
      { id: "WinSCP.WinSCP", name: "WinSCP" },
      { id: "Syncthing.Syncthing", name: "Syncthing" },
      { id: "Dropbox.Dropbox", name: "Dropbox" },
      { id: "Nextcloud.NextcloudDesktop", name: "Nextcloud Desktop" },
    ],
  },
  {
    labelKey: "runtimes",
    icon: Boxes,
    packages: [
      { id: "Microsoft.DotNet.SDK.8", name: ".NET SDK 8" },
      { id: "Microsoft.DotNet.DesktopRuntime.8", name: ".NET Desktop Runtime 8" },
      { id: "Microsoft.DotNet.AspNetCore.8", name: "ASP.NET Core Runtime 8" },
      { id: "Microsoft.DotNet.Runtime.8", name: ".NET Runtime 8" },
      { id: "Microsoft.VCRedist.2015+.x64", name: "Visual C++ Redistributable" },
    ],
  },
  {
    labelKey: "java",
    icon: Coffee,
    packages: [
      { id: "EclipseAdoptium.Temurin.21.JDK", name: "Eclipse Temurin 21 (JDK)" },
      { id: "EclipseAdoptium.Temurin.17.JDK", name: "Eclipse Temurin 17 (JDK)" },
      { id: "Oracle.JDK.21", name: "Oracle JDK 21" },
      { id: "Oracle.JavaRuntimeEnvironment", name: "Oracle Java Runtime" },
    ],
  },
  {
    labelKey: "security",
    icon: ShieldHalf,
    packages: [
      { id: "Bitwarden.Bitwarden", name: "Bitwarden" },
      { id: "KeePassXCTeam.KeePassXC", name: "KeePassXC" },
      { id: "Malwarebytes.Malwarebytes", name: "Malwarebytes" },
      { id: "WiresharkFoundation.Wireshark", name: "Wireshark" },
      { id: "IDRIX.VeraCrypt", name: "VeraCrypt" },
    ],
  },
  {
    labelKey: "imaging",
    icon: Image,
    packages: [
      { id: "Inkscape.Inkscape", name: "Inkscape" },
      { id: "BlenderFoundation.Blender", name: "Blender" },
      { id: "KDE.Krita", name: "Krita" },
      { id: "dotPDN.PaintDotNet", name: "Paint.NET" },
      { id: "IrfanSkiljan.IrfanView", name: "IrfanView" },
      { id: "XnSoft.XnViewMP", name: "XnView MP" },
    ],
  },
  {
    labelKey: "gaming",
    icon: Gamepad2,
    packages: [
      { id: "Valve.Steam", name: "Steam" },
      { id: "EpicGames.EpicGamesLauncher", name: "Epic Games Launcher" },
      { id: "GOG.Galaxy", name: "GOG Galaxy" },
      { id: "Playnite.Playnite", name: "Playnite" },
    ],
  },
];
