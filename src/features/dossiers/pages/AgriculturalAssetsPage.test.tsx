import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  create: vi.fn(),
  dossiers: [
    { id: "farm-1", type: "agricole", title: "Exploitation familiale", status: "incomplete", locationName: "Centre", metadata: { agriculturalRural: { family: "exploitation" } }, local: false },
    { id: "plant-1", type: "agricole", title: "Plantation cacao", status: "secure", description: "",
    locationName: "Littoral", metadata: { agriculturalRural: { family: "plantation" } }, local: false },
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

beforeEach(() => { mocks.navigate.mockClear(); mocks.create.mockClear(); });

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
  fireEvent.click(screen.getByRole("button", { name: "agricultural.createSteps.next" }));
  fireEvent.change(screen.getByLabelText("agricultural.fields.plantation.cropType"), { target: { value: "Cacao" } });
  fireEvent.change(screen.getByLabelText("agricultural.fields.plantation.declaredArea"), { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText("agricultural.specificsLabel"), { target: { value: "Plantation familiale" } });
  fireEvent.click(screen.getByRole("button", { name: "agricultural.createSteps.next" }));
  fireEvent.change(screen.getByLabelText("agricultural.location"), { target: { value: "Littoral" } });
  fireEvent.click(screen.getByRole("button", { name: "agricultural.save" }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
    type: "agricole",
    title: "Plantation cacao",
    location_name: "Littoral",
    metadata: { agriculturalRural: { version: 1, family: "plantation", declaredDetails: "Plantation familiale", familyDetails: { cropType: "Cacao", declaredArea: 2 }, declarationStatus: "declare", source: "declarant" } },
  })));
  expect(mocks.navigate).toHaveBeenCalledWith("/dossiers/new-farm");
});

it("offers contextual next actions while the declaration is incomplete", () => {
  render(<AgriculturalAssetsPage />);
  fireEvent.click(screen.getByRole("button", { name: /agricultural.create/ }));
  fireEvent.click(screen.getByRole("button", { name: "agricultural.createSteps.next" }));
  expect(screen.getByText("agricultural.assistant.title")).toBeTruthy();
  expect(screen.getByText("agricultural.assistant.nextStep")).toBeTruthy();
  expect(screen.getByRole("button", { name: "agricultural.fields.exploitation.activities" })).toBeTruthy();
});

it("captures GPS only after explicit action and stores the declared point with accuracy and date", async () => {
  const getCurrentPosition = vi.fn((success: (position: GeolocationPosition) => void) => {
    success({
      coords: { latitude: 4.0511, longitude: 9.7679, accuracy: 8, altitude: null, altitudeAccuracy: null, heading: null, speed: null, toJSON: () => ({}) },
      timestamp: 1794153600000,
      toJSON: () => ({}),
    } as GeolocationPosition);
  });
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  mocks.create.mockResolvedValue({ mode: "online", id: "gps-farm", journeyStatus: "ready" });
  render(<AgriculturalAssetsPage />);
  fireEvent.click(screen.getByRole("button", { name: /agricultural.create/ }));
  fireEvent.change(screen.getByLabelText("agricultural.designation"), { target: { value: "Plantation GPS" } });
  expect(getCurrentPosition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "agricultural.createSteps.next" }));
  fireEvent.click(screen.getByRole("button", { name: "agricultural.createSteps.next" }));
  fireEvent.click(screen.getByRole("button", { name: "agricultural.captureGps" }));
  await waitFor(() => expect(getCurrentPosition).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: "agricultural.save" }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
    latitude: 4.0511,
    longitude: 9.7679,
    metadata: expect.objectContaining({
      agriculturalRural: expect.objectContaining({
        geospatial: { point: expect.objectContaining({ latitude: 4.0511, longitude: 9.7679, accuracyMeters: 8, source: "gps" }) },
      }),
    }),
  })));
});

it("shows large asset cards and a contextual action for the first record to enrich", () => {
  render(<AgriculturalAssetsPage />);
  expect(screen.getByRole("region", { name: "agricultural.results" })).toBeTruthy();
  expect(screen.getByText("agricultural.cardInfoProgress")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "agricultural.summary.continue" }));
  expect(mocks.navigate).toHaveBeenCalledWith("/dossiers/farm-1/edit");
});
