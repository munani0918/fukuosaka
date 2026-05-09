"use client";

import { type ReactNode } from "react";

type PlannerEntryButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  budgetPresetId?: "budget" | "standard" | "premium";
  presetBudget?: number;
  nights?: number;
  packageType?: "flight_hotel_tour" | "flight_hotel";
  nearbyMode?: "light" | "standard" | "comfort";
  cityCode?: "KIX" | "FUK";
  styles?: string[];
  source: string;
};

export function PlannerEntryButton({
  children,
  className,
  href = "/planner-wizard.html",
  budgetPresetId,
  presetBudget,
  nights,
  packageType,
  nearbyMode,
  cityCode,
  styles,
  source,
}: PlannerEntryButtonProps) {
  function handleClick() {
    if (budgetPresetId) {
      window.sessionStorage.setItem("plannerBudgetPreset", budgetPresetId);
      window.sessionStorage.setItem("plannerBudgetInputMode", "preset");
    } else {
      window.sessionStorage.removeItem("plannerBudgetPreset");
      window.sessionStorage.setItem("plannerBudgetInputMode", "custom");
    }

    if (presetBudget) {
      window.sessionStorage.setItem("plannerBudget", String(presetBudget));
    } else {
      window.sessionStorage.removeItem("plannerBudget");
    }

    if (nights) {
      window.sessionStorage.setItem("plannerNights", String(nights));
    } else {
      window.sessionStorage.removeItem("plannerNights");
    }

    if (packageType) {
      window.sessionStorage.setItem("plannerPackageType", packageType);
    } else {
      window.sessionStorage.removeItem("plannerPackageType");
    }

    if (nearbyMode) {
      window.sessionStorage.setItem("plannerNearbyMode", nearbyMode);
    } else {
      window.sessionStorage.removeItem("plannerNearbyMode");
    }

    if (cityCode) {
      window.sessionStorage.setItem("plannerCity", cityCode);
    } else {
      window.sessionStorage.removeItem("plannerCity");
    }

    if (styles?.length) {
      window.sessionStorage.setItem("plannerStyles", styles.join(","));
    } else {
      window.sessionStorage.removeItem("plannerStyles");
    }

    window.sessionStorage.setItem("plannerEntrySource", source);
    const target = new URL(href, window.location.origin);
    if (budgetPresetId) target.searchParams.set("budgetPreset", budgetPresetId);
    if (cityCode) target.searchParams.set("cityCode", cityCode);
    if (nights) target.searchParams.set("nights", String(nights));
    if (packageType) target.searchParams.set("packageType", packageType);
    if (styles?.length) target.searchParams.set("styles", styles.join(","));
    target.searchParams.set("budgetInputMode", budgetPresetId ? "preset" : "custom");
    window.location.assign(`${target.pathname}${target.search}`);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
