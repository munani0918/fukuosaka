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
  templateTitle?: string;
  routeStyle?: string;
  planType?: string;
  recommendedExtras?: string;
  nearbyTrip?: string;
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
  templateTitle,
  routeStyle,
  planType,
  recommendedExtras,
  nearbyTrip,
  source,
}: PlannerEntryButtonProps) {
  function handleClick() {
    // A new home entry always starts from the 1-person baseline.
    window.sessionStorage.removeItem("plannerConditions");

    if (budgetPresetId) {
      window.sessionStorage.setItem("plannerBudgetPreset", budgetPresetId);
      window.sessionStorage.setItem("plannerBudgetInputMode", "preset");
    } else {
      window.sessionStorage.removeItem("plannerBudgetPreset");
      window.sessionStorage.setItem("plannerBudgetInputMode", "custom");
      [
        "plannerBudget",
        "plannerNights",
        "plannerPackageType",
        "plannerNearbyMode",
        "plannerCity",
        "plannerStyles",
        "plannerTemplateTitle",
        "plannerRouteStyle",
        "plannerPlanType",
        "plannerRecommendedExtras",
        "plannerNearbyTrip",
        "plannerConditions",
      ].forEach((key) => window.sessionStorage.removeItem(key));
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

    const sampleMeta = {
      templateTitle,
      routeStyle,
      planType,
      recommendedExtras,
      nearbyTrip,
    };
    Object.entries(sampleMeta).forEach(([key, value]) => {
      const storageKey = `planner${key[0].toUpperCase()}${key.slice(1)}`;
      if (value) window.sessionStorage.setItem(storageKey, value);
      else window.sessionStorage.removeItem(storageKey);
    });

    window.sessionStorage.setItem("plannerEntrySource", source);
    const target = new URL(href, window.location.origin);
    if (budgetPresetId) target.searchParams.set("budgetPreset", budgetPresetId);
    if (cityCode) target.searchParams.set("cityCode", cityCode);
    if (nights) target.searchParams.set("nights", String(nights));
    if (packageType) target.searchParams.set("packageType", packageType);
    if (styles?.length) target.searchParams.set("styles", styles.join(","));
    if (routeStyle) target.searchParams.set("routeStyle", routeStyle);
    if (templateTitle) target.searchParams.set("templateTitle", templateTitle);
    if (recommendedExtras) target.searchParams.set("recommendedExtras", recommendedExtras);
    target.searchParams.set("budgetInputMode", budgetPresetId ? "preset" : "custom");
    window.location.assign(`${target.pathname}${target.search}`);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
