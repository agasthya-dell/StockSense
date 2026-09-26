import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Boxes, ChevronDown, ChevronUp, Ruler, ShieldCheck, Tags, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Section } from "@/components/page-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — StockSense" }] }),
  component: Page,
});

const SETTINGS_KEY = "stocksense-settings-v1";

type Settings = {
  defaultUnit: string;
  defaultWarehouse: string;
  autoReorder: boolean;
  lowStockAlerts: boolean;
  deliveryAlerts: boolean;
  anomalyAlerts: boolean;
  criticalNotifications: boolean;
  warningNotifications: boolean;
  emailNotifications: boolean;
  reorderBuffer: string;
  categories: string[];
};

const defaultSettings: Settings = {
  defaultUnit: "units",
  defaultWarehouse: "Main Warehouse",
  autoReorder: false,
  lowStockAlerts: true,
  deliveryAlerts: true,
  anomalyAlerts: true,
  criticalNotifications: true,
  warningNotifications: true,
  emailNotifications: false,
  reorderBuffer: "20",
  categories: ["Raw Materials", "Components", "Finished Goods", "Packaging", "Hardware", "Safety"],
};

function Page() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch {}
    }
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    set("categories", [...settings.categories, newCategory.trim()]);
    setNewCategory("");
  };

  const removeCategory = (cat: string) => {
    set("categories", settings.categories.filter((c) => c !== cat));
  };

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  const SettingRow = ({
    id, icon: Icon, title, desc, children,
  }: { id: string; icon: React.ElementType; title: string; desc: string; children: React.ReactNode }) => (
    <div className="border-b last:border-0">
      <button
        type="button"
        className="flex w-full items-center gap-4 p-4 hover:bg-muted/20 transition-colors text-left"
        onClick={() => toggle(id)}
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
          <Icon className="size-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
        </div>
        {expanded === id ? <ChevronUp className="size-4 text-muted-foreground shrink-0" /> : <ChevronDown className="size-4 text-muted-foreground shrink-0" />}
      </button>
      {expanded === id && (
        <div className="border-t bg-muted/10 px-4 pb-4 pt-4 animate-fade-up">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Configure StockSense for your inventory operation."
        actions={
          <Button onClick={save} className={cn(saved && "bg-success hover:bg-success")}>
            {saved ? "Saved ✓" : "Save all changes"}
          </Button>
        }
      />
      <div className="max-w-2xl space-y-5">
        <Section>
          <SettingRow id="warehouse" icon={Warehouse} title="Warehouse settings" desc="Locations, receiving rules and operating defaults">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Default warehouse</label>
                <Select value={settings.defaultWarehouse} onValueChange={(v) => set("defaultWarehouse", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Main Warehouse", "Production Floor", "Dispatch Area", "Warehouse 2"].map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Auto-reorder</div>
                  <div className="text-xs text-muted-foreground">Automatically flag items below reorder point</div>
                </div>
                <Switch checked={settings.autoReorder} onCheckedChange={(v) => set("autoReorder", v)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Safety buffer (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.reorderBuffer}
                  onChange={(e) => set("reorderBuffer", e.target.value)}
                  className="w-32"
                />
                <p className="mt-1 text-xs text-muted-foreground">Reorder triggers when stock drops to {settings.reorderBuffer}% above reorder point</p>
              </div>
            </div>
          </SettingRow>

          <SettingRow id="categories" icon={Tags} title="Categories" desc="Raw materials, components and finished goods">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {settings.categories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 rounded-md border bg-card px-2.5 py-1 text-xs font-medium">
                    {cat}
                    <button type="button" className="ml-1 text-muted-foreground hover:text-danger transition-colors" onClick={() => removeCategory(cat)}>×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <Button type="button" variant="outline" size="sm" onClick={addCategory}>Add</Button>
              </div>
            </div>
          </SettingRow>

          <SettingRow id="reorder" icon={Boxes} title="Reorder rules" desc="Safety buffers, thresholds and lead times">
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Default unit of measure</label>
                <Select value={settings.defaultUnit} onValueChange={(v) => set("defaultUnit", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["units", "kg", "sheets", "packs", "boxes", "m", "litres"].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Low stock alerts</div>
                  <div className="text-xs text-muted-foreground">Alert when stock reaches reorder point</div>
                </div>
                <Switch checked={settings.lowStockAlerts} onCheckedChange={(v) => set("lowStockAlerts", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Delivery alerts</div>
                  <div className="text-xs text-muted-foreground">Alert when deliveries are completed</div>
                </div>
                <Switch checked={settings.deliveryAlerts} onCheckedChange={(v) => set("deliveryAlerts", v)} />
              </div>
            </div>
          </SettingRow>

          <SettingRow id="units" icon={Ruler} title="Units of measure" desc="Units, kilograms, sheets and packs">
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Default unit</label>
                <Select value={settings.defaultUnit} onValueChange={(v) => set("defaultUnit", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["units", "kg", "sheets", "packs", "boxes", "m", "litres"].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Individual products can override this default on their own settings.</p>
            </div>
          </SettingRow>

          <SettingRow id="users" icon={ShieldCheck} title="Users & access" desc="Roles for managers and warehouse staff">
            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Agasthya</div>
                    <div className="text-xs text-muted-foreground">agasthya@stocksense.io · Inventory Manager</div>
                  </div>
                  <span className="text-xs font-medium text-primary">Owner</span>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Admin User</div>
                    <div className="text-xs text-muted-foreground">admin@stocksense.io · Administrator</div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Admin</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">User management is available in the full version.</p>
            </div>
          </SettingRow>

          <SettingRow id="notifications" icon={Bell} title="Notifications" desc="Critical, warning and information preferences">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Critical alerts</div>
                  <div className="text-xs text-muted-foreground">Stock-out risk and critical status</div>
                </div>
                <Switch checked={settings.criticalNotifications} onCheckedChange={(v) => set("criticalNotifications", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Warning alerts</div>
                  <div className="text-xs text-muted-foreground">At-risk products and anomalies</div>
                </div>
                <Switch checked={settings.warningNotifications} onCheckedChange={(v) => set("warningNotifications", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Anomaly detection</div>
                  <div className="text-xs text-muted-foreground">Unusual adjustment patterns</div>
                </div>
                <Switch checked={settings.anomalyAlerts} onCheckedChange={(v) => set("anomalyAlerts", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Email notifications</div>
                  <div className="text-xs text-muted-foreground">Receive alerts by email</div>
                </div>
                <Switch checked={settings.emailNotifications} onCheckedChange={(v) => set("emailNotifications", v)} />
              </div>
            </div>
          </SettingRow>
        </Section>
      </div>
    </>
  );
}
