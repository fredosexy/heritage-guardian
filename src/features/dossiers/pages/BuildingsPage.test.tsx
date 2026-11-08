import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  reload: vi.fn(),
  triggerSync: vi.fn(),
  dossiers: [
    { id: "building-1", type: "batiment", title: "Maison Bonanjo", status: "incomplete", locationName: "Douala, Bonanjo", local: false },
    { id: "building-2", type: "batiment", title: "Boutique Akwa", status: "risk", locationName: "Douala, Akwa", local: false },
    { id: "terrain-1", type: "terrain", title: "Terrain Bonanjo", status: "secure", locationName: "Douala, Bonanjo", local: false },
  ],
}));

vi.mock("react-router-dom", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/features/identity", () => ({ useIdentity: () => ({ isGuest: false }) }));
vi.mock("@/features/offline", () => ({
  usePendingSync: () => 0,
  useTriggerSync: () => mocks.triggerSync,
}));
vi.mock("../hooks/useDossiers", () => ({
  useDossiers: () => ({ dossiers: mocks.dossiers, loading: false, loadError: false, reload: mocks.reload }),
}));
vi.mock("@/features/shell", () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  EmptyState: ({ title, description }: { title: string; description: string }) => <div><h2>{title}</h2><p>{description}</p></div>,
}));
vi.mock("../components/DossierStatusBadge", () => ({
  DossierStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

import BuildingsPage from "./BuildingsPage";

beforeEach(() => { mocks.navigate.mockClear(); });

it("lists only building dossiers and opens the selected property", () => {
  render(<BuildingsPage />);
  expect(screen.getByText("Maison Bonanjo")).toBeTruthy();
  expect(screen.getByText("Boutique Akwa")).toBeTruthy();
  expect(screen.queryByText("Terrain Bonanjo")).toBeNull();
  fireEvent.click(screen.getByText("Maison Bonanjo"));
  expect(mocks.navigate).toHaveBeenCalledWith("/dossiers/building-1");
});

it("searches by locality as well as property name", () => {
  render(<BuildingsPage />);
  fireEvent.change(screen.getByLabelText("buildings.search"), { target: { value: "akwa" } });
  expect(screen.getByText("Boutique Akwa")).toBeTruthy();
  expect(screen.queryByText("Maison Bonanjo")).toBeNull();
});

it("filters properties by status", () => {
  render(<BuildingsPage />);
  fireEvent.click(screen.getByRole("button", { name: /buildings.filters.risk/ }));
  expect(screen.getByText("Boutique Akwa")).toBeTruthy();
  expect(screen.queryByText("Maison Bonanjo")).toBeNull();
});
