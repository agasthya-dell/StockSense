import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Section } from "@/components/page-kit";
import { useAuth } from "@/lib/auth";
import { warehouses } from "@/lib/inventory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — StockSense" }] }),
  component: Page,
});

function Page() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [defaultWarehouse, setDefaultWarehouse] = useState(user?.defaultWarehouse ?? "All warehouses");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, defaultWarehouse });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Personal details and workspace preferences."
      />
      <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
        <Section title="Profile details">
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Role</label>
              <Input value={user?.role ?? "Inventory Manager"} disabled className="opacity-60" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {user?.provider === "google" && (
                <p className="mt-1 text-[11px] text-muted-foreground">Signed in with Google</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Default warehouse</label>
              <Select value={defaultWarehouse} onValueChange={setDefaultWarehouse}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All warehouses">All warehouses</SelectItem>
                  {warehouses.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className={cn("gap-2 transition-colors", saved && "bg-success hover:bg-success")}>
                {saved ? <><Check className="size-4" /> Saved</> : "Save changes"}
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Account information">
          <div className="divide-y">
            <div className="flex justify-between items-center p-4">
              <div>
                <div className="text-sm font-medium">Sign-in method</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {user?.provider === "google" ? "Google OAuth" : "Email and password"}
                </div>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{user?.provider ?? "email"}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <div>
                <div className="text-sm font-medium">User ID</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{user?.id ?? "—"}</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-4">
              <div>
                <div className="text-sm font-medium">Avatar initials</div>
                <div className="text-xs text-muted-foreground mt-0.5">Derived from your name</div>
              </div>
              <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user?.avatarInitials ?? "??"}
              </div>
            </div>
          </div>
        </Section>
      </form>
    </>
  );
}
