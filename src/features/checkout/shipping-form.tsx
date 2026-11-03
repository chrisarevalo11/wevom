"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { TEXT_LINK_CLASS } from "@/components/ui/text-link";
import { COLOMBIA_DEPARTMENTS } from "@/config/colombia-departments";
import { prefersReducedMotion } from "@/lib/gsap";
import { type ShippingDetails, setShippingDetailsAction } from "@/lib/shopify/actions";
import { cn } from "@/lib/utils/cn";

const FIELD =
  "w-full border-b border-border bg-transparent py-2 font-sans text-sm text-text outline-none transition placeholder:text-text-muted/60 focus:border-text";
const LABEL = "block font-sans text-[10px] uppercase tracking-[0.24em] text-text-muted";

/** What the form holds: one name field, split into Shopify's first/last name on submit */
type FormValues = Omit<ShippingDetails, "firstName" | "lastName"> & {
  fullName: string;
};

const EMPTY: FormValues = {
  email: "",
  phone: "",
  fullName: "",
  address1: "",
  address2: "",
  city: "",
  provinceCode: "",
  zip: "",
};

type FieldName = keyof FormValues;

/** Lets the summary's big button submit this form from outside it */
/** How long the page takes to fade out before the browser leaves for Shopify */
const HANDOFF_FADE_MS = 450;

export const SHIPPING_FORM_ID = "shipping-form";

/**
 * Contact and delivery address, saved onto the Shopify cart and then handed to Shopify's
 * checkout, which opens with everything filled in and only asks for the shipping rate and
 * the payment.
 */
/**
 * Shopify's address wants a first and a last name. The first word is the given name and the
 * rest the surname(s): the usual shape of a Colombian name, and checkout lets the buyer fix
 * it when it is not.
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

export function ShippingForm({
  onBusyChange,
}: {
  /** Reports the pending/redirecting state so the external submit button can lock */
  onBusyChange: (busy: boolean) => void;
}) {
  const t = useTranslations("summary.shipping");
  const [details, setDetails] = useState<FormValues>(EMPTY);
  const [leaving, setLeaving] = useState(false);
  const id = useId();

  const submit = useMutation({
    mutationFn: async ({ fullName, ...values }: FormValues) => {
      const result = await setShippingDetailsAction({
        ...values,
        ...splitName(fullName),
      });
      if (result.error || !result.checkoutUrl) {
        throw new Error(result.error ?? t("error"));
      }
      return result.checkoutUrl;
    },
    // A full navigation: checkout lives on Shopify's domain. The page fades to its own
    // colour first, so the swap to Shopify's checkout is not a white flash mid-form.
    onSuccess: (checkoutUrl) => {
      setLeaving(true);
      window.setTimeout(
        () => window.location.assign(checkoutUrl),
        prefersReducedMotion() ? 0 : HANDOFF_FADE_MS,
      );
    },
  });

  const set =
    (name: FieldName) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDetails((current) => ({ ...current, [name]: event.target.value }));

  const field = (
    name: FieldName,
    props: Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "name" | "id" | "value" | "onChange"
    > = {},
  ) => (
    <div>
      <label htmlFor={`${id}-${name}`} className={LABEL}>
        {t(`fields.${name}`)}
      </label>
      <input
        id={`${id}-${name}`}
        name={name}
        value={details[name]}
        onChange={set(name)}
        className={FIELD}
        {...props}
      />
    </div>
  );

  // The handoff keeps the pending state until Shopify's page replaces this one
  const busy = submit.isPending || submit.isSuccess;
  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);

  return (
    <>
      <HandoffCover active={leaving} />
      <form
        id={SHIPPING_FORM_ID}
        onSubmit={(event) => {
          event.preventDefault();
          submit.mutate(details);
        }}
        className="space-y-8"
      >
        <fieldset className="space-y-5">
          <legend className={cn(TEXT_LINK_CLASS, "mb-5 text-text")}>
            {t("contact")}
          </legend>
          {field("fullName", { autoComplete: "name", required: true })}
          {field("email", { type: "email", autoComplete: "email", required: true })}
          {field("phone", {
            type: "tel",
            autoComplete: "tel",
            placeholder: "+57 300 000 0000",
          })}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className={cn(TEXT_LINK_CLASS, "mb-5 text-text")}>
            {t("address")}
          </legend>
          {field("address1", { autoComplete: "address-line1", required: true })}
          {field("address2", { autoComplete: "address-line2" })}
          <div className="grid gap-5 sm:grid-cols-2">
            {field("city", { autoComplete: "address-level2", required: true })}
            <div>
              <label htmlFor={`${id}-provinceCode`} className={LABEL}>
                {t("fields.provinceCode")}
              </label>
              <select
                id={`${id}-provinceCode`}
                name="provinceCode"
                value={details.provinceCode}
                onChange={set("provinceCode")}
                required
                className={cn(FIELD, "cursor-pointer appearance-none rounded-none")}
              >
                <option value="" disabled>
                  {t("selectDepartment")}
                </option>
                {COLOMBIA_DEPARTMENTS.map((department) => (
                  <option key={department.code} value={department.code}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("zip", { autoComplete: "postal-code", inputMode: "numeric" })}
            <div>
              <span className={LABEL}>{t("fields.country")}</span>
              <p className="py-2 font-sans text-sm text-text">Colombia</p>
            </div>
          </div>
        </fieldset>

        {submit.isError ? (
          <p className="font-sans text-xs tracking-wide text-text" role="alert">
            {submit.error.message}
          </p>
        ) : null}
      </form>
    </>
  );
}

/**
 * A sheet in the page's colour that fades up over everything once the checkout URL is in
 * hand. Above the header and the dialogs: nothing on the page is useful during the hand-off.
 */
function HandoffCover({ active }: { active: boolean }) {
  if (!active) return null;
  return createPortal(
    <div
      aria-hidden
      className="fixed inset-0 z-[90] animate-[fade-in_0.45s_ease-out_forwards] bg-surface"
    />,
    document.body,
  );
}
