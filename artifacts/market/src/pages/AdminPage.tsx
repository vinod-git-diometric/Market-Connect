import { useState } from "react";
import { useListAdminReservations, useListAdminVendors } from "@workspace/api-client-react";

type Tab = "reservations" | "vendors";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("reservations");

  return (
    <div className="min-h-screen bg-background" data-testid="admin-page">
      <header className="border-b border-border px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground">
              United Main
            </p>
            <h1 className="font-serif text-xl italic text-foreground">Market Admin</h1>
          </div>
          <a
            href="/market"
            className="text-xs font-sans text-primary hover:underline"
          >
            View market page
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6">
        <div className="flex gap-1 border border-border rounded-[4px] p-1 w-fit mb-6">
          {(["reservations", "vendors"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              className={`px-4 py-1.5 text-xs font-sans font-medium rounded-[2px] capitalize transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "reservations" && <ReservationsTab />}
        {tab === "vendors" && <VendorsTab />}
      </div>
    </div>
  );
}

function ReservationsTab() {
  const { data, isLoading, isError } = useListAdminReservations();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load reservations.</p>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-serif italic text-lg text-muted-foreground">No reservations yet.</p>
        <p className="text-xs text-muted-foreground mt-1">They'll appear here once shoppers start reserving.</p>
      </div>
    );
  }

  return (
    <div data-testid="reservations-table" className="overflow-x-auto">
      <table className="w-full text-xs font-sans border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            {["Code", "Date", "Vendor", "Product", "Qty", "Shopper", "Email", "Phone", "Note"].map((h) => (
              <th key={h} className="py-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr
              key={r.id}
              data-testid={`reservation-row-${r.id}`}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <td className="py-2 px-2 font-mono text-[11px] text-primary whitespace-nowrap">{r.reservationCode}</td>
              <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
              </td>
              <td className="py-2 px-2 whitespace-nowrap">{r.vendorName}</td>
              <td className="py-2 px-2 whitespace-nowrap">{r.productName}</td>
              <td className="py-2 px-2 text-center">{r.quantity}</td>
              <td className="py-2 px-2 whitespace-nowrap">{r.shopperName}</td>
              <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">{r.shopperEmail}</td>
              <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">{r.shopperPhone}</td>
              <td className="py-2 px-2 text-muted-foreground max-w-[120px] truncate">{r.note || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground mt-3">{data.length} reservation{data.length !== 1 ? "s" : ""} total</p>
    </div>
  );
}

function VendorsTab() {
  const { data, isLoading, isError } = useListAdminVendors();

  const launchModeLabel: Record<string, string> = {
    profile_only: "Profile only",
    featured_products: "Featured products",
    reserve_for_pickup: "Reserve for pickup",
  };

  const statusDot: Record<string, string> = {
    live: "bg-green-500",
    draft: "bg-muted-foreground",
    public_info_drafted: "bg-amber-400",
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load vendors.</p>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-serif italic text-lg text-muted-foreground">No vendors yet.</p>
      </div>
    );
  }

  return (
    <div data-testid="vendors-table" className="overflow-x-auto">
      <table className="w-full text-xs font-sans border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            {["Status", "Name", "Contact", "Email", "Mode", "Products", "Reservable"].map((h) => (
              <th key={h} className="py-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((v) => (
            <tr
              key={v.id}
              data-testid={`vendor-row-${v.id}`}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <td className="py-2 px-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${statusDot[v.status] ?? "bg-muted-foreground"}`}
                  title={v.status}
                />
              </td>
              <td className="py-2 px-2 font-medium whitespace-nowrap">{v.name}</td>
              <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">{v.contactName || "—"}</td>
              <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">{v.email || "—"}</td>
              <td className="py-2 px-2 whitespace-nowrap">{launchModeLabel[v.launchMode] ?? v.launchMode}</td>
              <td className="py-2 px-2 text-center">{v.productCount}</td>
              <td className="py-2 px-2 text-center">{v.reservableProductCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground mt-3">{data.length} vendor{data.length !== 1 ? "s" : ""} total</p>
    </div>
  );
}
