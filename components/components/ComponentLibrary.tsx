"use client";

import { useMemo, useState } from "react";
import type { ComponentCategory, ComponentDefinition } from "@/src/domain/types";
import { componentCategoryMeta, componentRegistry } from "@/src/components/registry";
import { useMissionStore } from "@/src/state/missionStore";

type ComponentLibraryProps = { missionName: string };

const categoryAccent: Record<ComponentCategory, string> = { structure: "structure", power: "power", communication: "communication", science: "science", propulsion: "propulsion", payload: "science", thermal: "power" };

function formatPower(component: ComponentDefinition) {
  if (component.power.mode === "neutral") return "Passive";
  return `${component.power.mode === "generation" ? "+" : "−"}${component.power.watts} W`;
}

export function ComponentLibrary({ missionName }: ComponentLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>("structure");
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const selectedComponents = useMissionStore((state) => state.selectedComponents);
  const addComponent = useMissionStore((state) => state.addComponent);
  const removeComponent = useMissionStore((state) => state.removeComponent);

  const filteredComponents = useMemo(() => componentRegistry.filter((component) => {
    const matchesCategory = component.category === activeCategory;
    const term = search.trim().toLowerCase();
    return matchesCategory && (!term || `${component.name} ${component.description} ${component.modelReference}`.toLowerCase().includes(term));
  }), [activeCategory, search]);

  const selectedCount = Object.values(selectedComponents).reduce<number>((sum, count) => sum + (count ?? 0), 0);
  const selectedDetail = componentRegistry.find((component) => component.id === detailId) ?? filteredComponents[0];

  function handleAdd(component: ComponentDefinition) {
    setDetailId(component.id);
    addComponent(component.id);
  }

  return <section className="component-library" aria-label="Spacecraft component library">
    <div className="library-header"><div><p className="section-eyebrow">Design bay / component library</p><h1>Assemble the <span>possible.</span></h1><p className="library-lede">{missionName} / Select educational component modules. Every choice changes the mission envelope.</p></div><div className="inventory-counter"><span>SELECTED COMPONENTS</span><strong>{selectedCount.toString().padStart(2, "0")}</strong><small>Inventory persists with this mission</small></div></div>
    <div className="library-toolbar"><nav className="component-categories" aria-label="Component categories">{componentCategoryMeta.map((category) => <button className={activeCategory === category.id ? "category-tab is-active" : "category-tab"} key={category.id} type="button" onClick={() => { setActiveCategory(category.id); setDetailId(null); }}>{category.shortLabel}<span>{componentRegistry.filter((component) => component.category === category.id).length.toString().padStart(2, "0")}</span></button>)}</nav><label className="component-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search components" aria-label="Search components" /></label></div>
    <div className="library-content"><div className="component-grid">{filteredComponents.length === 0 ? <div className="empty-library">No components match your search in this category.</div> : filteredComponents.map((component) => { const count = selectedComponents[component.id] ?? 0; const atLimit = count >= component.availability.inventoryLimit; return <article className={detailId === component.id ? "component-card is-selected" : "component-card"} key={component.id} onClick={() => setDetailId(component.id)}><div className={`component-icon component-icon-${categoryAccent[component.category]}`}><span>{component.category.slice(0, 2).toUpperCase()}</span></div><div className="component-card-copy"><span className="component-id">{component.id}</span><h2>{component.name}</h2><p>{component.description}</p></div><div className="component-card-meta"><span>{component.massKg} kg</span><span>{formatPower(component)}</span><span>{component.costCredits.toLocaleString("en-US")} cr</span></div><div className="component-card-footer"><span>{count > 0 ? `${count} / ${component.availability.inventoryLimit} selected` : `Limit ${component.availability.inventoryLimit}`}</span><button className="add-component-button" type="button" disabled={!component.availability.available || atLimit} onClick={(event) => { event.stopPropagation(); handleAdd(component); }}>{atLimit ? "Limit reached" : "Add to design +"}</button></div></article>; })}</div><aside className="component-detail-panel">{selectedDetail ? <><div className={`detail-hero detail-hero-${categoryAccent[selectedDetail.category]}`}><span>{selectedDetail.modelReference}</span><strong>{selectedDetail.category.toUpperCase()}</strong></div><p className="section-eyebrow">Component detail</p><h2>{selectedDetail.name}</h2><p className="detail-description">{selectedDetail.description}</p><div className="detail-spec-grid"><div><span>Mass</span><strong>{selectedDetail.massKg} kg</strong></div><div><span>Power</span><strong>{formatPower(selectedDetail)}</strong></div><div><span>Cost</span><strong>{selectedDetail.costCredits.toLocaleString("en-US")} cr</strong></div><div><span>Availability</span><strong>{selectedDetail.availability.available ? `${selectedDetail.availability.inventoryLimit} max` : "Unavailable"}</strong></div></div><div className="detail-properties"><span>Component properties</span>{Object.entries(selectedDetail.properties).map(([key, value]) => <p key={key}><b>{key.replace(/([A-Z])/g, " $1")}</b><em>{String(value)}</em></p>)}</div><div className="detail-compatibility"><span>Compatibility</span>{selectedDetail.compatibility.notes.map((note) => <p key={note}>+ {note}</p>)}</div><p className="specification-note">{selectedDetail.specificationNote}</p><button className="button-primary detail-add-button" type="button" disabled={(selectedComponents[selectedDetail.id] ?? 0) >= selectedDetail.availability.inventoryLimit} onClick={() => handleAdd(selectedDetail)}>Add to design <span className="button-arrow">↗</span></button></> : <div className="empty-detail">Select a component to inspect its specifications.</div>}</aside></div>
    <div className="selected-inventory"><span>Design inventory</span>{Object.entries(selectedComponents).filter(([, count]) => count && count > 0).map(([id, count]) => { const component = componentRegistry.find((item) => item.id === id); if (!component) return null; return <div className="selected-inventory-item" key={id}><span>{component.name}</span><strong>{count}</strong><button type="button" aria-label={`Remove ${component.name}`} onClick={() => removeComponent(component.id)}>−</button></div>; })}</div>
  </section>;
}
