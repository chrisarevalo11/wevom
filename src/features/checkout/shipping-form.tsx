"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  TEXT_LINK_ACTIVE,
  TEXT_LINK_CLASS,
  TEXT_LINK_INACTIVE,
} from "@/components/ui/text-link";
import { COLOMBIA_DEPARTMENTS } from "@/config/colombia-departments";
import { type ShippingDetails, setShippingDetailsAction } from "@/lib/shopify/actions";
import { cn } from "@/lib/utils/cn";

const FIELD =
  "w-full border-b border-border bg-transparent py-2 font-sans text-sm text-text outline-none transition placeholder:text-text-muted/60 focus:border-text";
const LABEL = "block font-sans text-[10px] uppercase tracking-[0.24em] text-text-muted";

const EMPTY: ShippingDetails = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  provinceCode: "",
  zip: "",
};

type FieldName = keyof ShippingDetails;

/**
 * Contact and delivery address, saved onto the Shopify cart and then handed to Shopify's
 * checkout, which opens with everything filled in and only asks for the shipping rate and
 * the payment.
 */
export function ShippingForm({ onBack }: { onBack: () => void }) {
  const t = useTranslations("summary.shipping");
  const [details, setDetails] = useState<ShippingDetails>(EMPTY);
  const id = useId();

  const submit = useMutation({
    mutationFn: async (values: ShippingDetails) => {
      const result = await setShippingDetailsAction(values);
      if (result.error || !result.checkoutUrl) {
        throw new Error(result.error ?? t("error"));
      }
      return result.checkoutUrl;
    },
    // A full navigation: checkout lives on Shopify's domain
    onSuccess: (checkoutUrl) => window.location.assign(checkoutUrl),
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

  return (
    <form
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
        <div className="grid gap-5 sm:grid-cols-2">
          {field("firstName", { autoComplete: "given-name", required: true })}
          {field("lastName", { autoComplete: "family-name", required: true })}
        </div>
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

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className={cn(
            TEXT_LINK_CLASS,
            TEXT_LINK_INACTIVE,
            "cursor-pointer disabled:opacity-40",
          )}
        >
          {t("back")}
        </button>
        <button
          type="submit"
          disabled={busy}
          className={cn(
            TEXT_LINK_CLASS,
            TEXT_LINK_ACTIVE,
            "cursor-pointer hover:opacity-60 disabled:cursor-default disabled:opacity-40",
          )}
        >
          {busy ? t("redirecting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
