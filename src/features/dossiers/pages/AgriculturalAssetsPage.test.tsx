import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  create: vi.fn(),
  dossiers: [
    { id: "farm-1", type: "agricole", title: "Exploitation familiale", status: "incomplete", locationName: "Centre", metadata: { agriculturalRural: { family: "exploitation" } }, local: false },
    { id: "plant-1", type: "agricole", title: "Plantation cacao", status: "secure", locationName: "Littoral", metadata: { agriculturalRural: { family: "plantation" } }, local: false },
    { id: "land-1", type: "terrain", title: "Terrain", status: "secure", locationName: "Centre", metadata: {}, local: false },
  ],
}));

vi.mock("react-router-dom", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/features/identity", () => ({ useIdentity: () => ({ isGuest: false }) }));
vi.mock("../hooks/useDossiers", () => ({ useDossiers: () => ({ dossiers: mocks.dossiers, loading: false, loadError: false, reload: vi.fn() }) }));
vi.mock("../hooks/useCreateDossier", () => ({ useCreateDossier: () => ({ create: mocks.create, saving: false }) }));
vi.mock("@/features/shell", () => ({
  AppLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  PageHeader: ({ title, right }: { title: string; right?: ReactNode }) => <header><h1>{title}</h1>{right}</header>,
  EmptyState: ({ title }: { title: string }) => <h2>{title}</h2>,
}));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));
vi.mock("@/components/ui/input", () => ({ Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} /> }));
vi.mock("@/components/ui/label", () => ({ Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props}>{children}</label> }));
vi.mock("@/components/ui/textarea", () => ({ Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} /> }));
vi.mock("../components/DossierStatusBadge", () => ({ DossierStatusBadge: ({ status }: { status: string }) => <span>{status}</span> }));

import AgriculturalAssetsPage from "./AgriculturalAssetsPage";

beforeEach(() => mocks.navigate.mockClear());

it("shows only agricultural assets and filters by family", () => {
  render(<AgriculturalAssetsPage />);
  expect(screen.getByText("Exploitation familiale")).toBeTruthy();
  expect(screen.getByText("Plantation cacao")).toBeTruthy();
  expect(screen.queryByText("Terrain")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "agricultural.families.plantation" }));
  expect(screen.getByText("Plantation cacao")).toBeTruthy();
  expect(screen.queryByText("Exploitation familiale")).toBeNull();
});

it("creates an agricultural declaration with its selected family and declared details", async () => {
  mocks.create.mockResolvedValue({ mode: "online", id: "new-farm", journeyStatus: "procedure_unavailable" });
  render(<AgriculturalAssetsPage />);
  fireEvent.click(screen.getByRole("button", { name: /agricultural.create/ }));
  fireEvent.change(screen.getByLabelText("agricultural.family"), { target: { value: "plantation" } });
  fireEvent.change(screen.getByLabelText("agricultural.designation"), { target: { value: "Plantation cacao" } });
  fireEvent.change(screen.getByLabelText("agricultural.specificsLabel"), { target: { value: "Cacao, 2 hectares déclarés" } });
  fireEvent.change(screen.getByLabelText("agricultural.location"), { target: { value: "Littoral" } });
  fireEvent.click(screen.getByRole("button", { name: "agricultural.save" }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
    type: "agricole",
    title: "Plantation cacao",
    locationName: "Littoral",
    metadata: { agriculturalRural: expect.objectContaining({ family: "plantation", declaredDetails: "Cacao, 2 hectares déclarés", source: "declarant" }) },
  })));
  expect(mocks.navigate).toHaveBeenCalledWith("/dossiers/new-farm");
});
