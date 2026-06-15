import { useState } from "react";
import { Drawer } from "vaul";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateReservation } from "@workspace/api-client-react";
import type { Product, Vendor } from "@workspace/api-client-react";

const schema = z.object({
  shopperName: z.string().min(1, "Name is required"),
  shopperEmail: z.string().email("Valid email required"),
  shopperPhone: z.string().min(7, "Phone number required"),
  quantity: z.number().min(1).max(10),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  vendor: Vendor | null;
}

export default function ReservationDrawer({ open, onOpenChange, product, vendor }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [reservationCode, setReservationCode] = useState("");

  const maxQty = product?.maxPerReservation ?? 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  });

  const mutation = useCreateReservation({
    mutation: {
      onSuccess: (data) => {
        setReservationCode(data.reservationCode);
        setSubmitted(true);
        reset();
      },
    },
  });

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setReservationCode("");
      reset();
    }, 400);
  }

  function onSubmit(values: FormValues) {
    if (!product) return;
    mutation.mutate({
      data: {
        productId: product.id,
        shopperName: values.shopperName,
        shopperEmail: values.shopperEmail,
        shopperPhone: values.shopperPhone,
        quantity: values.quantity,
        note: values.note || null,
      },
    });
  }

  if (!product) return null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-foreground/20 z-40" />
        <Drawer.Content
          data-testid="reservation-drawer"
          className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-[8px] flex flex-col max-h-[90vh] outline-none"
        >
          <div className="mx-auto w-10 h-1 bg-border rounded-full mt-3 mb-1 flex-shrink-0" />

          <div className="overflow-y-auto flex-1 px-5 pb-8 pt-3">
            <Drawer.Title className="font-serif text-xl italic text-foreground mb-1">
              Reserve for pickup
            </Drawer.Title>
            <p className="text-xs text-muted-foreground mb-5">
              <span className="font-medium text-foreground">{product.name}</span> from {vendor?.name}
              {product.price && <> &mdash; {product.price}</>}
            </p>

            {submitted ? (
              <div data-testid="reservation-success" className="text-center py-6">
                <p className="font-serif text-2xl italic text-foreground mb-2">Reserved.</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  We sent a confirmation to your email. Please show your reservation code at the{" "}
                  <span className="font-medium text-foreground">{vendor?.name}</span> booth during market hours. Payment happens directly with the vendor.
                </p>
                {reservationCode && (
                  <div className="inline-block border border-primary rounded-[4px] px-5 py-3 mb-6">
                    <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-1">
                      Your code
                    </p>
                    <p className="font-serif text-2xl text-primary tracking-widest">{reservationCode}</p>
                  </div>
                )}
                <br />
                <button
                  onClick={handleClose}
                  className="mt-2 text-sm font-sans text-primary hover:underline"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                data-testid="reservation-form"
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-sans font-medium text-foreground mb-1">
                    Your name
                  </label>
                  <input
                    {...register("shopperName")}
                    data-testid="input-name"
                    placeholder="Full name"
                    className="w-full border border-border rounded-[4px] px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {errors.shopperName && (
                    <p className="text-xs text-destructive mt-1">{errors.shopperName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-foreground mb-1">
                    Email
                  </label>
                  <input
                    {...register("shopperEmail")}
                    data-testid="input-email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full border border-border rounded-[4px] px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {errors.shopperEmail && (
                    <p className="text-xs text-destructive mt-1">{errors.shopperEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-foreground mb-1">
                    Phone
                  </label>
                  <input
                    {...register("shopperPhone")}
                    data-testid="input-phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    className="w-full border border-border rounded-[4px] px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {errors.shopperPhone && (
                    <p className="text-xs text-destructive mt-1">{errors.shopperPhone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-foreground mb-1">
                    Quantity
                  </label>
                  <select
                    {...register("quantity", { valueAsNumber: true })}
                    data-testid="input-quantity"
                    className="w-full border border-border rounded-[4px] px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-foreground mb-1">
                    Note <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    {...register("note")}
                    data-testid="input-note"
                    rows={2}
                    placeholder="Any special requests or notes for the vendor"
                    className="w-full border border-border rounded-[4px] px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>

                {mutation.isError && (
                  <p className="text-xs text-destructive">
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  data-testid="submit-reservation"
                  disabled={mutation.isPending}
                  className="w-full bg-primary text-primary-foreground font-sans text-sm font-medium py-3 rounded-[4px] hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {mutation.isPending ? "Sending..." : "Confirm reservation"}
                </button>

                <p className="text-[10px] text-muted-foreground/70 text-center">
                  No payment now. You'll pay directly at the vendor booth.
                </p>
              </form>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
