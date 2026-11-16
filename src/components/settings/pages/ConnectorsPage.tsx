import { PluginsPanel } from "@/components/PluginsPanel";

/** Settings → Connectors: the marketplace and MCP servers, drawing in the page instead of their own sheet. */
export function ConnectorsPage() {
  return <div data-plugins-page="" className="flex flex-col"><PluginsPanel embedded /></div>;
}
