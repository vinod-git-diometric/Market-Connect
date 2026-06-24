import { useState, useEffect, useCallback } from "react";

const ADMIN_PASSWORD = "farmerstogo";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function adminFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_PASSWORD}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminVendor {
  id: number;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
  location: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  imageUrl: string | null;
  launchMode: string;
  status: string;
  marketDates: string | null;
  pickupInstructions: string | null;
}

interface AdminReservation {
  id: number;
  reservationCode: string;
  vendorName: string;
  productName: string;
  shopperName: string;
  shopperEmail: string;
  shopperPhone: string | null;
  quantity: number;
  note: string | null;
  marketDate: string | null;
  createdAt: string;
}

interface AdminProduct {
  id: number;
  vendorId: number;
  name: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  reservationAllowed: boolean;
  quantityAvailable: number | null;
  maxPerReservation: number | null;
  status: string;
}

type Tab = "reservations" | "vendors";

// ── Input helpers ────────────────────────────────────────────────────────────

function Field({
  label, name, value, onChange, type = "text", textarea = false, required = false,
}: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string; textarea?: boolean; required?: boolean;
}) {
  const cls = "w-full bg-transparent border border-border rounded-[4px] px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} rows={3} className={cls + " resize-y"} />
      ) : (
        <input name={name} type={type} value={value} onChange={onChange} className={cls} />
      )}
    </div>
  );
}

function SelectField({
  label, name, value, onChange, options,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">{label}</label>
      <select
        name={name} value={value} onChange={onChange}
        className="w-full bg-background border border-border rounded-[4px] px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "sm", disabled = false, type = "button" }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "xs"; disabled?: boolean; type?: "button" | "submit";
}) {
  const base = "font-sans font-medium rounded-[4px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", xs: "px-2 py-1 text-[10px]" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "border border-border text-foreground hover:border-primary hover:text-primary",
    ghost: "text-muted-foreground hover:text-foreground",
    danger: "border border-destructive/50 text-destructive hover:bg-destructive hover:text-white",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {children}
    </button>
  );
}

// ── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuthed", "1");
      onAuth();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-xs">
        <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-1 text-center">United Main</p>
        <h1 className="font-serif text-2xl italic text-foreground mb-6 text-center">Market Admin</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className="w-full bg-transparent border border-border rounded-[4px] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
          />
          {error && <p className="text-xs text-destructive">Incorrect password.</p>}
          <button type="submit" className="w-full bg-primary text-primary-foreground font-sans text-sm font-medium rounded-[4px] px-6 py-2.5 hover:opacity-90 transition-opacity">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Vendor Form ──────────────────────────────────────────────────────────────

const EMPTY_VENDOR = {
  name: "", contactName: "", email: "", phone: "", description: "",
  location: "", website: "", instagram: "", facebook: "", imageUrl: "",
  launchMode: "profile_only", status: "draft", marketDates: "", pickupInstructions: "",
};

function VendorForm({
  initial, onSave, onCancel,
}: {
  initial?: Partial<typeof EMPTY_VENDOR> & { id?: number };
  onSave: (vendor: AdminVendor) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_VENDOR, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial || !(initial as { id?: number }).id;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const id = (initial as { id?: number } | undefined)?.id;
      const vendor = await adminFetch<AdminVendor>(
        isNew ? "POST" : "PUT",
        isNew ? "/admin/vendors" : `/admin/vendors/${id}`,
        form
      );
      onSave(vendor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-[4px] p-4 bg-muted/20 mt-2">
      <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-3">
        {isNew ? "New vendor" : "Edit vendor"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Field label="Business name" name="name" value={form.name} onChange={handleChange} required />
        <Field label="Location" name="location" value={form.location} onChange={handleChange} />
        <Field label="Contact name" name="contactName" value={form.contactName} onChange={handleChange} />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
        <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <Field label="Website" name="website" value={form.website} onChange={handleChange} />
        <Field label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} />
        <Field label="Market dates" name="marketDates" value={form.marketDates} onChange={handleChange} />
        <Field label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        <SelectField
          label="Launch mode" name="launchMode" value={form.launchMode} onChange={handleChange}
          options={[
            { value: "profile_only", label: "Profile only" },
            { value: "featured_products", label: "Featured products" },
            { value: "reserve_for_pickup", label: "Reserve for pickup" },
          ]}
        />
        <SelectField
          label="Status" name="status" value={form.status} onChange={handleChange}
          options={[
            { value: "live", label: "Live" },
            { value: "draft", label: "Draft" },
            { value: "public_info_drafted", label: "Info drafted" },
          ]}
        />
      </div>
      <div className="mb-3">
        <Field label="Description" name="description" value={form.description} onChange={handleChange} textarea />
      </div>
      <div className="mb-3">
        <Field label="Pickup instructions" name="pickupInstructions" value={form.pickupInstructions} onChange={handleChange} textarea />
      </div>
      {error && <p className="text-xs text-destructive mb-2">{error}</p>}
      <div className="flex gap-2">
        <Btn type="submit" disabled={saving}>{saving ? "Saving…" : "Save vendor"}</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </form>
  );
}

// ── Product Form ─────────────────────────────────────────────────────────────

const EMPTY_PRODUCT = {
  name: "", description: "", price: "", imageUrl: "",
  reservationAllowed: "false", quantityAvailable: "", maxPerReservation: "", status: "draft",
};

function ProductForm({
  vendorId, initial, onSave, onCancel,
}: {
  vendorId: number;
  initial?: Partial<typeof EMPTY_PRODUCT & { id?: number }>;
  onSave: (product: AdminProduct) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    ...EMPTY_PRODUCT,
    ...initial,
    reservationAllowed: initial?.reservationAllowed?.toString() ?? "false",
    quantityAvailable: initial?.quantityAvailable?.toString() ?? "",
    maxPerReservation: initial?.maxPerReservation?.toString() ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial?.id;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const product = await adminFetch<AdminProduct>(
        isNew ? "POST" : "PUT",
        isNew ? `/admin/vendors/${vendorId}/products` : `/admin/products/${initial!.id}`,
        form
      );
      onSave(product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border/60 rounded-[4px] p-3 bg-muted/10 mt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
        <Field label="Product name" name="name" value={form.name} onChange={handleChange} required />
        <Field label="Price" name="price" value={form.price} onChange={handleChange} />
        <Field label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        <SelectField
          label="Status" name="status" value={form.status} onChange={handleChange}
          options={[{ value: "live", label: "Live" }, { value: "draft", label: "Draft" }]}
        />
        <SelectField
          label="Reservable" name="reservationAllowed" value={form.reservationAllowed} onChange={handleChange}
          options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
        />
        <Field label="Qty available" name="quantityAvailable" value={form.quantityAvailable} onChange={handleChange} type="number" />
        <Field label="Max per reservation" name="maxPerReservation" value={form.maxPerReservation} onChange={handleChange} type="number" />
      </div>
      <div className="mb-2.5">
        <Field label="Description" name="description" value={form.description} onChange={handleChange} textarea />
      </div>
      {error && <p className="text-xs text-destructive mb-2">{error}</p>}
      <div className="flex gap-2">
        <Btn type="submit" size="xs" disabled={saving}>{saving ? "Saving…" : isNew ? "Add product" : "Update product"}</Btn>
        <Btn variant="ghost" size="xs" onClick={onCancel}>Cancel</Btn>
      </div>
    </form>
  );
}

// ── Products Panel ───────────────────────────────────────────────────────────

function ProductsPanel({ vendorId }: { vendorId: number }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminProduct[]>("GET", `/admin/vendors/${vendorId}/products`);
      setProducts(data);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function handleDelete(productId: number) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await adminFetch("DELETE", `/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      alert("Failed to delete product.");
    }
  }

  const statusDot: Record<string, string> = { live: "text-green-500", draft: "text-muted-foreground" };

  if (loading) return <div className="py-3 text-xs text-muted-foreground animate-pulse">Loading products…</div>;
  if (error) return <div className="py-3 text-xs text-destructive">{error}</div>;

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
          Products ({products.length})
        </p>
        {!addingProduct && (
          <Btn size="xs" variant="secondary" onClick={() => setAddingProduct(true)}>+ Add product</Btn>
        )}
      </div>

      {products.length === 0 && !addingProduct && (
        <p className="text-xs text-muted-foreground/60 italic py-1">No products yet.</p>
      )}

      <div className="flex flex-col gap-1.5">
        {products.map((p) => (
          <div key={p.id}>
            {editingProductId === p.id ? (
              <ProductForm
                vendorId={vendorId}
                initial={{
                  id: p.id,
                  name: p.name,
                  description: p.description ?? "",
                  price: p.price ?? "",
                  imageUrl: p.imageUrl ?? "",
                  reservationAllowed: p.reservationAllowed.toString(),
                  quantityAvailable: p.quantityAvailable?.toString() ?? "",
                  maxPerReservation: p.maxPerReservation?.toString() ?? "",
                  status: p.status,
                }}
                onSave={(updated) => {
                  setProducts((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                  setEditingProductId(null);
                }}
                onCancel={() => setEditingProductId(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-2 border border-border/40 rounded-[4px] px-2.5 py-2 bg-muted/10 group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] ${statusDot[p.status] ?? "text-muted-foreground"}`}>●</span>
                    <span className="text-xs font-medium text-foreground">{p.name}</span>
                    {p.price && <span className="text-[10px] text-primary">{p.price}</span>}
                    {p.reservationAllowed && (
                      <span className="text-[9px] border border-primary/30 text-primary rounded px-1">Reservable</span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Btn size="xs" variant="ghost" onClick={() => setEditingProductId(p.id)}>Edit</Btn>
                  <Btn size="xs" variant="danger" onClick={() => handleDelete(p.id)}>Remove</Btn>
                </div>
              </div>
            )}
          </div>
        ))}

        {addingProduct && (
          <ProductForm
            vendorId={vendorId}
            onSave={(created) => {
              setProducts((prev) => [...prev, created]);
              setAddingProduct(false);
            }}
            onCancel={() => setAddingProduct(false)}
          />
        )}
      </div>
    </div>
  );
}

// ── Vendor Row ───────────────────────────────────────────────────────────────

function VendorRow({
  vendor, onUpdated,
}: {
  vendor: { id: number; name: string; contactName: string | null; email: string | null; launchMode: string; status: string; productCount: number };
  onUpdated: (v: AdminVendor) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullVendor, setFullVendor] = useState<AdminVendor | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);

  const statusDot: Record<string, string> = {
    live: "bg-green-500", draft: "bg-muted-foreground", public_info_drafted: "bg-amber-400",
  };
  const launchModeLabel: Record<string, string> = {
    profile_only: "Profile only", featured_products: "Featured", reserve_for_pickup: "Reserve",
  };

  async function handleExpand() {
    if (!expanded && !fullVendor) {
      setLoadingFull(true);
      try {
        const data = await adminFetch<AdminVendor>("GET", `/admin/vendors/${vendor.id}`);
        setFullVendor(data);
      } catch {
        // continue without full data
      } finally {
        setLoadingFull(false);
      }
    }
    setExpanded((v) => !v);
    setEditing(false);
  }

  return (
    <div className="border-b border-border/50">
      <div
        className="flex items-center gap-2 py-2.5 px-2 hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={handleExpand}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[vendor.status] ?? "bg-muted-foreground"}`} title={vendor.status} />
        <span className="text-xs font-medium flex-1 min-w-0 truncate">{vendor.name}</span>
        <span className="text-[10px] text-muted-foreground hidden sm:block">{vendor.contactName || "—"}</span>
        <span className="text-[10px] text-muted-foreground hidden md:block">{launchModeLabel[vendor.launchMode] ?? vendor.launchMode}</span>
        <span className="text-[10px] text-muted-foreground">{vendor.productCount} products</span>
        <span className="text-[10px] text-muted-foreground ml-1">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="px-3 pb-4">
          {loadingFull && <p className="text-xs text-muted-foreground animate-pulse py-2">Loading…</p>}

          {!loadingFull && !editing && fullVendor && (
            <div className="flex flex-col gap-1 py-2 text-xs text-muted-foreground">
              {fullVendor.description && <p className="text-foreground leading-relaxed">{fullVendor.description}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                {fullVendor.location && <span><strong className="text-foreground">Location:</strong> {fullVendor.location}</span>}
                {fullVendor.marketDates && <span><strong className="text-foreground">Market dates:</strong> {fullVendor.marketDates}</span>}
                {fullVendor.website && <a href={fullVendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{fullVendor.website}</a>}
                {fullVendor.instagram && <span>{fullVendor.instagram}</span>}
              </div>
              <div className="mt-2">
                <Btn size="xs" variant="secondary" onClick={() => setEditing(true)}>Edit vendor</Btn>
              </div>
            </div>
          )}

          {!loadingFull && editing && fullVendor && (
            <VendorForm
              initial={{
                id: fullVendor.id,
                name: fullVendor.name,
                contactName: fullVendor.contactName ?? "",
                email: fullVendor.email ?? "",
                phone: fullVendor.phone ?? "",
                description: fullVendor.description ?? "",
                location: fullVendor.location ?? "",
                website: fullVendor.website ?? "",
                instagram: fullVendor.instagram ?? "",
                facebook: fullVendor.facebook ?? "",
                imageUrl: fullVendor.imageUrl ?? "",
                launchMode: fullVendor.launchMode,
                status: fullVendor.status,
                marketDates: fullVendor.marketDates ?? "",
                pickupInstructions: fullVendor.pickupInstructions ?? "",
              }}
              onSave={(updated) => {
                setFullVendor(updated);
                onUpdated(updated);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          )}

          <ProductsPanel vendorId={vendor.id} />
        </div>
      )}
    </div>
  );
}

// ── Vendors Tab ──────────────────────────────────────────────────────────────

function VendorsTab() {
  const [vendors, setVendors] = useState<{
    id: number; name: string; contactName: string | null; email: string | null;
    launchMode: string; status: string; productCount: number; reservableProductCount: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [addingVendor, setAddingVendor] = useState(false);

  const loadVendors = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await adminFetch<typeof vendors>("GET", "/admin/vendors");
      setVendors(data);
    } catch {
      setFetchError("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadVendors(); }, [loadVendors]);

  function handleVendorUpdated(updated: AdminVendor) {
    setVendors((prev) => prev.map((v) => v.id === updated.id
      ? { ...v, name: updated.name, contactName: updated.contactName, email: updated.email, launchMode: updated.launchMode, status: updated.status }
      : v
    ));
  }

  function handleVendorCreated(vendor: AdminVendor) {
    setVendors((prev) => [...prev, { ...vendor, productCount: 0, reservableProductCount: 0 }]);
    setAddingVendor(false);
  }

  if (loading) return <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>;
  if (fetchError) return <p className="text-sm text-destructive">{fetchError}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{vendors.length} vendor{vendors.length !== 1 ? "s" : ""}</p>
        {!addingVendor && (
          <Btn variant="secondary" onClick={() => setAddingVendor(true)}>+ Add vendor</Btn>
        )}
      </div>

      {addingVendor && (
        <div className="mb-4">
          <VendorForm onSave={handleVendorCreated} onCancel={() => setAddingVendor(false)} />
        </div>
      )}

      <div data-testid="vendors-table" className="border border-border rounded-[4px] overflow-hidden">
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border bg-muted/40">
          <span className="w-2 shrink-0" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex-1">Name</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block w-32">Contact</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden md:block w-24">Mode</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-16 text-right">Products</span>
        </div>
        {vendors.map((v) => (
          <VendorRow key={v.id} vendor={v} onUpdated={handleVendorUpdated} />
        ))}
        {vendors.length === 0 && (
          <div className="py-10 text-center">
            <p className="font-serif italic text-lg text-muted-foreground">No vendors yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reservations Tab ─────────────────────────────────────────────────────────

function ReservationsTab() {
  const [data, setData] = useState<AdminReservation[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    adminFetch<AdminReservation[]>("GET", "/admin/reservations")
      .then((d) => setData(d))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>;
  if (isError) return <p className="text-sm text-destructive">Failed to load reservations.</p>;
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
            {["Code", "Market Date", "Reserved On", "Vendor", "Product", "Qty", "Shopper", "Email", "Phone", "Note"].map((h) => (
              <th key={h} className="py-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} data-testid={`reservation-row-${r.id}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-2 px-2 font-mono text-[11px] text-primary whitespace-nowrap">{r.reservationCode}</td>
              <td className="py-2 px-2 whitespace-nowrap">{r.marketDate || "—"}</td>
              <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
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

// ── Root ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("adminAuthed") === "1");
  const [tab, setTab] = useState<Tab>("vendors");

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-background" data-testid="admin-page">
      <header className="border-b border-border px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground">United Main</p>
            <h1 className="font-serif text-xl italic text-foreground">Market Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/market" className="text-xs font-sans text-primary hover:underline">View market page</a>
            <button
              onClick={() => { sessionStorage.removeItem("adminAuthed"); setAuthed(false); }}
              className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6">
        <div className="flex gap-1 border border-border rounded-[4px] p-1 w-fit mb-6">
          {(["vendors", "reservations"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              className={`px-4 py-1.5 text-xs font-sans font-medium rounded-[2px] capitalize transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "vendors" && <VendorsTab />}
        {tab === "reservations" && <ReservationsTab />}
      </div>
    </div>
  );
}
