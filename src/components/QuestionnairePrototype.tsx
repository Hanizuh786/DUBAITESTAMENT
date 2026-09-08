"use client";

import {
  createContext,
  FormEvent,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type YesNo = "" | "yes" | "no";
type Values = Record<string, string>;
type Group =
  | "executors"
  | "beneficiaries"
  | "adult_children"
  | "minor_children"
  | "other_parents"
  | "temporary_guardians"
  | "permanent_guardians";
type Person = Values & { id: string };
type PersonKind =
  | "executor"
  | "beneficiary"
  | "adult_child"
  | "minor_child"
  | "other_parent"
  | "temporary_guardian"
  | "permanent_guardian";
type FieldDef = {
  label: string;
  name: string;
  type?: "text" | "date" | "email" | "textarea" | "yesno" | "select";
  full?: boolean;
  required?: boolean;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  hint?: string;
};

const stepDefinitions = [
  ["person", "1. Jouw gegevens"],
  ["executors", "2. Executeurs"],
  ["beneficiaries", "3. Erfgenamen"],
  ["children", "4. Kinderen"],
  ["other_parents", "5. De andere ouder"],
  ["temporary_guardians", "6. Tijdelijke voogden"],
  ["permanent_guardians", "7. Permanente voogden"],
  [
    "financial_guardian",
    "8. Beheer van het vermogen van minderjarige kinderen",
  ],
  ["pets", "9. Huisdieren"],
  ["organ_donation", "10. Orgaandonatie"],
  ["funeral", "11. Uitvaartwensen"],
  ["practical", "12. Praktische vragen"],
] as const;

const personalFields: FieldDef[] = [
  { label: "Wil je een Single Will of een Mirror Will laten opstellen?", name: "will_type", required: true },
  {
    label: "Volledige naam (zoals in je paspoort)",
    name: "testator_full_name",
    required: true,
  },
  {
    label: "Geboortedatum",
    name: "testator_dob",
    placeholder: "yyyy-mm-dd",
    inputMode: "numeric",
    hint: "Format: yyyy-mm-dd, bijvoorbeeld 1980-06-30",
  },
  { label: "Geboorteplaats", name: "testator_birth_place" },
  { label: "Nationaliteit", name: "testator_nationality" },
  { label: "Paspoortnummer", name: "testator_passport" },
  {
    label: "Emirates ID-nummer (laat leeg als je geen Emirates ID hebt)",
    name: "testator_eid",
  },
  {
    label: "Adres",
    name: "testator_address",
    type: "textarea",
    full: true,
  },
  {
    label: "E-mailadres",
    name: "testator_email",
    type: "email",
    required: true,
    hint: "Bijvoorbeeld: naam@voorbeeld.nl",
  },
  { label: "Telefoonnummer (inclusief landcode)", name: "testator_phone", required: true, placeholder: "+971 ...", inputMode: "tel", hint: "Begin met + en de landcode, bijvoorbeeld +31612345678" },
  {
    label: "Ben je getrouwd, ongehuwd, gescheiden of weduwe/weduwnaar?",
    name: "testator_marital_status",
  },
  { label: "Heb je een partner?", name: "has_partner", type: "yesno" },
  { label: "Heb je kinderen?", name: "has_children", type: "yesno" },
  {
    label:
      "In welk land of welke landen word je voor de belasting als inwoner beschouwd?",
    name: "testator_tax_residency",
    full: true,
  },
  {
    label:
      "In welke landen heb je de afgelopen 20 jaar gewoond? Vermeld per land ongeveer van wanneer tot wanneer.",
    name: "residence_history_20_years",
    type: "textarea",
    full: true,
  },
  { label: "Wat is je beroep?", name: "profession" },
  { label: "Naam van je werkgever of bedrijf", name: "employer_company" },
  {
    label:
      "Heb je geld of andere bezittingen ondergebracht in een vennootschap, holding, trust of foundation?",
    name: "asset_structures",
    type: "yesno",
  },
  {
    label: "In welke landen heb je geld of andere bezittingen?",
    name: "asset_countries",
    full: true,
  },
  {
    label:
      "Wat heb je in die landen? Denk aan woningen, bankrekeningen, beleggingen, aandelen in bedrijven of andere bezittingen.",
    name: "asset_types",
    type: "textarea",
    full: true,
  },
  {
    label: "Heb je cryptovaluta of andere digitale bezittingen?",
    name: "digital_assets",
    type: "yesno",
  },
  {
    label: "Heb je al een testament in een ander land?",
    name: "existing_wills",
    type: "yesno",
  },
  {
    label:
      "Bekleed jij of bekleedt iemand uit je naaste familie een belangrijke politieke of publieke functie? Of was dat kort geleden nog het geval? Denk bijvoorbeeld aan een minister, parlementslid, ambassadeur of hoge rechter.",
    name: "pep",
    type: "yesno",
    full: true,
  },
  {
    label: "In welke landen heb je een bedrijf of doe je zaken?",
    name: "business_countries",
    type: "textarea",
    full: true,
  },
];

const secondTestatorFields: FieldDef[] = [
  { label: "Naam tweede testator (zoals in paspoort)", name: "second_testator_full_name", required: true },
  { label: "Geboortedatum tweede testator (yyyy-mm-dd)", name: "second_testator_dob", placeholder: "yyyy-mm-dd", inputMode: "numeric", required: true },
  { label: "Geboorteplaats", name: "second_testator_birth_place" },
  { label: "Nationaliteit", name: "second_testator_nationality" },
  { label: "Paspoortnummer", name: "second_testator_passport" },
  { label: "Emirates ID-nummer", name: "second_testator_eid", placeholder: "784-____-_______-_" },
  { label: "E-mailadres tweede testator", name: "second_testator_email", type: "email", required: true },
  { label: "Telefoonnummer tweede testator (inclusief landcode)", name: "second_testator_phone", required: true, placeholder: "+971 ...", inputMode: "tel" },
  { label: "Adres", name: "second_testator_address", type: "textarea", full: true },
  { label: "Fiscale woonlanden", name: "second_testator_tax_residency", full: true },
  { label: "Landen waar vermogen aanwezig is", name: "second_testator_asset_countries", full: true },
  { label: "Soorten vermogen", name: "second_testator_asset_types", type: "textarea", full: true },
  { label: "Heb je al een testament in een ander land?", name: "second_testator_existing_wills", type: "yesno" },
  { label: "Gezamenlijke bezittingen en eigendomspercentage", name: "second_testator_joint_assets_ownership", type: "textarea", full: true },
  { label: "Uitvaartwens", name: "second_testator_funeral_type", type: "select" },
];

const groupMap: Record<PersonKind, Group> = {
  executor: "executors",
  beneficiary: "beneficiaries",
  adult_child: "adult_children",
  minor_child: "minor_children",
  other_parent: "other_parents",
  temporary_guardian: "temporary_guardians",
  permanent_guardian: "permanent_guardians",
};
const groupLabels: Record<PersonKind, string> = {
  executor: "Executeur",
  beneficiary: "Erfgenaam",
  adult_child: "Meerderjarig kind",
  minor_child: "Minderjarig kind",
  other_parent: "Andere ouder",
  temporary_guardian: "Tijdelijke voogd",
  permanent_guardian: "Permanente voogd",
};
const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
const emptyPerson = (): Person => ({
  id: makeId(),
  full_name: "",
  dob: "",
  birth_place: "",
  nationality: "",
  passport: "",
  eid: "",
  address: "",
});

const QuestionnaireContext = createContext<{
  values: Values;
  setValue: (name: string, value: string) => void;
} | null>(null);

function Field({ def }: { def: FieldDef }) {
  const context = useContext(QuestionnaireContext);
  if (!context) return null;
  const { values, setValue } = context;
  const id = `wi-${def.name}`;
  const placeholder = def.placeholder ?? (def.type === "textarea" ? "Typ hier je antwoord..." : def.type === "email" ? "naam@voorbeeld.nl" : def.inputMode === "tel" ? "+31612345678" : def.name.includes("eid") ? "784-YYYY-XXXXXXX-X" : def.name.includes("name") ? "Bijvoorbeeld: Jan de Vries" : def.name.includes("nationality") ? "Bijvoorbeeld: Nederlands" : def.name.includes("passport") ? "Bijvoorbeeld: NP1234567" : "Typ hier je antwoord...");
  return (
    <div className={`wi-field${def.full ? " full" : ""}`}>
      <label htmlFor={id}>{def.label}</label>
      {def.hint && <small className="wi-hint">{def.hint}</small>}
      {def.type === "textarea" ? (
        <textarea
          id={id}
          value={values[def.name] ?? ""}
          onChange={(e) => setValue(def.name, e.target.value)}
          required={def.required}
          placeholder={placeholder}
        />
      ) : def.type === "yesno" || def.type === "select" || def.name === "testator_marital_status" ? (
        <select
          id={id}
          value={values[def.name] ?? ""}
          onChange={(e) => setValue(def.name, e.target.value)}
          required={def.required}
        >
          <option value="">Kies een antwoord</option>
          {def.type === "yesno" ? <><option value="yes">Ja</option><option value="no">Nee</option></> : def.name.includes("funeral") ? <><option value="burial">Begraven</option><option value="cremation">Gecremeerd</option><option value="science">Ter beschikking stellen aan de wetenschap</option><option value="alkaline">Bio-crematie / oplossen</option></> : <><option value="married">Getrouwd</option><option value="unmarried">Ongehuwd</option><option value="divorced">Gescheiden</option><option value="widowed">Weduwe/weduwnaar</option></>}
        </select>
      ) : (
        <input
          id={id}
          type={def.type === "email" ? "email" : "text"}
          inputMode={def.inputMode}
          placeholder={placeholder}
          pattern={def.type === "email" ? "[^\\s@]+@[^\\s@]+\\.[^\\s@]+" : undefined}
          value={values[def.name] ?? ""}
          onChange={(e) => setValue(def.name, e.target.value)}
          required={def.required}
        />
      )}
    </div>
  );
}

export default function QuestionnairePrototype() {
  const formTopRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Values>({});
  const [groups, setGroups] = useState<Record<Group, Person[]>>({
    executors: [emptyPerson()],
    beneficiaries: [emptyPerson()],
    adult_children: [emptyPerson()],
    minor_children: [emptyPerson()],
    other_parents: [emptyPerson()],
    temporary_guardians: [emptyPerson()],
    permanent_guardians: [emptyPerson()],
  });
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const visibleSteps = useMemo(
    () =>
      stepDefinitions.filter(
        ([key]) =>
          ![
            "other_parents",
            "temporary_guardians",
            "permanent_guardians",
            "financial_guardian",
          ].includes(key) || values.has_minor_children === "yes",
      ),
    [values.has_minor_children],
  );
  const active = visibleSteps[current] ?? visibleSteps[0];
  const setValue = (name: string, value: string) => {
    if (name.endsWith("eid")) value = formatEid(value);
    if (name === "testator_phone") {
      value = value.replace(/[^+\d]/g, "");
      value = value.startsWith("+") ? "+" + value.slice(1).replace(/\D/g, "") : value.replace(/\D/g, "");
      value = value.slice(0, 16);
    }
    setValues((v) => ({ ...v, [name]: value }));
  };
  const add = (kind: PersonKind) => {
    const group = groupMap[kind];
    setGroups((g) => ({ ...g, [group]: [...g[group], emptyPerson()] }));
  };
  const remove = (kind: PersonKind, id: string) => {
    const group = groupMap[kind];
    setGroups((g) => ({
      ...g,
      [group]:
        g[group].length > 1 ? g[group].filter((p) => p.id !== id) : g[group],
    }));
  };
  const updatePerson = (
    kind: PersonKind,
    id: string,
    field: string,
    value: string,
  ) => {
    if (field === "eid") value = formatEid(value);
    const group = groupMap[kind];
    setGroups((g) => ({
      ...g,
      [group]: g[group].map((p) =>
        p.id === id ? { ...p, [field]: value } : p,
      ),
    }));
  };

  function formatEid(value: string) {
    const digits = value.replace(/\\D/g, "").replace(/^784/, "").slice(0, 15);
    const all = `784${digits}`;
    return [all.slice(0, 3), all.slice(3, 7), all.slice(7, 14), all.slice(14)].filter(Boolean).join("-");
  }
  function validDate(value: string) {
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function adultDate(value: string) {
    const now = new Date();
    const cutoff = new Date(Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()));
    return new Date(`${value}T00:00:00Z`) <= cutoff;
  }
  function validEid(value: string) { return !value || /^784-(?:19|20)\d{2}-\d{7}-\d$/.test(value); }

  function PersonFields({ kind }: { kind: PersonKind }) {
    const group = groupMap[kind];
    return (
      <>
        {groups[group].map((person, index) => (
          <div className="wi-person" key={person.id}>
            <div className="wi-person-head">
              <strong>
                {groupLabels[kind]} {index + 1}
              </strong>
              {index > 0 && (
                <button
                  type="button"
                  className="wi-remove"
                  onClick={() => remove(kind, person.id)}
                >
                  Verwijder
                </button>
              )}
            </div>
            <div className="wi-grid">
              {[
                {
                  label: "Volledige naam (zoals in paspoort)",
                  name: "full_name",
                },
                { label: "Geboortedatum (yyyy-mm-dd)", name: "dob", placeholder: "yyyy-mm-dd", inputMode: "numeric" },
                { label: "Geboorteplaats", name: "birth_place" },
                { label: "Nationaliteit", name: "nationality" },
                { label: "Paspoortnummer", name: "passport" },
                {
                  label:
                    kind === "adult_child" || kind === "minor_child"
                      ? "Emirates ID-nummer (laat leeg als dit kind geen Emirates ID heeft)"
                      : "Emirates ID-nummer (laat leeg als deze persoon geen Emirates ID heeft)",
                  name: "eid",
                },
              ].map((f) => (
                <div className="wi-field" key={f.name}>
                  <label>{f.label}</label>
                  {f.name === "eid" && <small className="wi-hint">Format: 784-YYYY-XXXXXXX-X</small>}
                  {f.name === "dob" && <small className="wi-hint">Format: yyyy-mm-dd, bijvoorbeeld 1980-06-30</small>}
                  <input
                    type="text"
                    placeholder={f.name === "eid" ? "784-YYYY-XXXXXXX-X" : f.name === "dob" ? "yyyy-mm-dd" : f.name === "full_name" ? "Bijvoorbeeld: Jan de Vries" : f.name === "passport" ? "Bijvoorbeeld: NP1234567" : "Typ hier je antwoord..."}
                    inputMode={f.name === "eid" ? "numeric" : (f as FieldDef).inputMode}
                    value={person[f.name] ?? ""}
                    onChange={(e) =>
                      updatePerson(kind, person.id, f.name, e.target.value)
                    }
                  />
                </div>
              ))}
              <div className="wi-field full">
                <label>Adres</label>
                <textarea
                  value={person.address ?? ""}
                  onChange={(e) =>
                    updatePerson(kind, person.id, "address", e.target.value)
                  }
                />
              </div>
              {kind === "executor" && (
                <>
                  <div className="wi-field">
                    <label>
                      Bedrag van de vergoeding voor de executeur (laat leeg als
                      je geen vergoeding wilt geven)
                    </label>
                    <input
                      value={person.compensation ?? ""}
                      onChange={(e) =>
                        updatePerson(
                          kind,
                          person.id,
                          "compensation",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="wi-field">
                    <label>
                      Hoe vaak moet de vergoeding aan de executeur worden
                      betaald? (laat leeg als je geen vergoeding wilt geven)
                    </label>
                    <input
                      value={person.compensation_frequency ?? ""}
                      onChange={(e) =>
                        updatePerson(
                          kind,
                          person.id,
                          "compensation_frequency",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </>
              )}
              {kind === "beneficiary" && (
                <>
                  <div className="wi-field">
                    <label>
                      Welk deel van je nalatenschap moet deze erfgenaam krijgen?
                    </label>
                    <input
                      value={person.share ?? ""}
                      onChange={(e) =>
                        updatePerson(kind, person.id, "share", e.target.value)
                      }
                    />
                  </div>
                  <div className="wi-field full">
                    <label>
                      Wil je dat deze erfgenaam het erfdeel pas op een bepaalde
                      leeftijd of in delen krijgt? Beschrijf hier je wensen.
                    </label>
                    <textarea
                      value={person.distribution_conditions ?? ""}
                      onChange={(e) =>
                        updatePerson(
                          kind,
                          person.id,
                          "distribution_conditions",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  {[
                    [
                      "Wil je dat deze persoon alleen erft als jullie op het moment van jouw overlijden nog een relatie hebben?",
                      "relationship_exists",
                    ],
                    [
                      "Als deze erfgenaam eerder overlijdt dan jij, wil je dan dat zijn of haar kinderen dit erfdeel krijgen?",
                      "to_children_if_predeceased",
                    ],
                  ].map(([label, name]) => (
                    <div className="wi-field full" key={name}>
                      <label>{label}</label>
                      <select
                        value={person[name] ?? ""}
                        onChange={(e) =>
                          updatePerson(kind, person.id, name, e.target.value)
                        }
                      >
                        <option value="">Kies een antwoord</option>
                        <option value="yes">Ja</option>
                        <option value="no">Nee</option>
                      </select>
                    </div>
                  ))}
                  <div className="wi-field full">
                    <label>
                      Is er nog iets dat we over deze erfgenaam moeten weten?
                    </label>
                    <textarea
                      value={person.notes ?? ""}
                      onChange={(e) =>
                        updatePerson(kind, person.id, "notes", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
              {(kind === "adult_child" || kind === "minor_child") && (
                <div className="wi-field full">
                  <label>
                    Is dit kind uit je huidige relatie of uit een eerdere
                    relatie?
                  </label>
                  <select
                    value={person.relationship ?? ""}
                    onChange={(e) =>
                      updatePerson(
                        kind,
                        person.id,
                        "relationship",
                        e.target.value,
                      )
                    }
                  >
                    <option value="">Kies een antwoord</option>
                    <option value="current">Huidige relatie</option>
                    <option value="previous">Eerdere relatie</option>
                  </select>
                  <label>Wie zijn de ouders van dit kind?</label>
                  <input value={person.parents ?? ""} onChange={(e) => updatePerson(kind, person.id, "parents", e.target.value)} placeholder="Bijvoorbeeld: beide testatoren, ik alleen, of naam andere ouder" />
                </div>
              )}
            </div>
          </div>
        ))}
      </>
    );
  }

  function validate() {
    setError("");
    for (const people of Object.values(groups)) {
      for (const person of people) {
        if (person.dob && !validDate(person.dob)) {
          setError("Vul iedere geboortedatum in als yyyy-mm-dd, bijvoorbeeld 1980-06-30.");
          return false;
        }
        if (person.eid && !validEid(person.eid)) {
          setError("Vul ieder Emirates ID in als 784-YYYY-XXXXXXX-X; het jaar moet met 19 of 20 beginnen.");
          return false;
        }
      }
    }
    if (active[0] === "person") {
      const missingField = personalFields.find(
        (field) => field.required && !values[field.name]?.trim(),
      );

      if (missingField) {
        setError(`Vul het verplichte veld in: ${missingField.label}.`);
        return false;
      }
      if (!validDate(values.testator_dob)) { setError("Vul je geboortedatum in als yyyy-mm-dd, bijvoorbeeld 1980-06-30."); return false; }
      if (!adultDate(values.testator_dob)) { setError("Je moet minimaal 18 jaar oud zijn om een testament te registreren."); return false; }
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(values.testator_email)) { setError("Vul een geldig e-mailadres in."); return false; }
      if (!/^\\+[1-9]\\d{7,14}$/.test(values.testator_phone.replace(/[ .()-]/g, ""))) { setError("Vul een geldig internationaal telefoonnummer in, beginnend met +."); return false; }
      if (!validEid(values.testator_eid)) { setError("Vul het Emirates ID in als 784-YYYY-XXXXXXX-X."); return false; }
      if (values.will_type === "mirror") {
        const requiredSecond = secondTestatorFields.find((field) => field.required && !values[field.name]?.trim());
        if (requiredSecond) { setError("Vul het verplichte veld in voor de tweede testator: " + requiredSecond.label + "."); return false; }
        if (!validDate(values.second_testator_dob)) { setError("Vul de geboortedatum van de tweede testator in als yyyy-mm-dd."); return false; }
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(values.second_testator_email)) { setError("Vul een geldig e-mailadres in voor de tweede testator."); return false; }
        if (!/^\\+[1-9]\\d{7,14}$/.test(values.second_testator_phone.replace(/[ .()-]/g, ""))) { setError("Vul een geldig internationaal telefoonnummer in voor de tweede testator."); return false; }
        if (!validEid(values.second_testator_eid)) { setError("Vul het Emirates ID van de tweede testator in als 784-YYYY-XXXXXXX-X."); return false; }
      }
    }
    return true;
  }
  function next() {
    if (!validate()) return;
    setCurrent((c) => Math.min(c + 1, visibleSteps.length - 1));
    requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError("");
    try {
      const submittedGroups = Object.fromEntries(
        Object.entries(groups).map(([group, people]) => [
          group,
          people
            .map(({ id: _id, ...person }) => person)
            .filter((person) =>
              Object.values(person).some((value) => value.trim()),
            ),
        ]),
      );
      const response = await fetch("/api/testament-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...submittedGroups }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(result?.message);
      }
      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error && error.message
          ? error.message
          : "Het formulier kon niet worden verzonden. Probeer het opnieuw.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success)
    return (
      <div className="questionnaire-page">
        <div className="will-intake">
          <div className="wi-success" role="status">
          <h1>Gegevens voor je UAE-testament</h1>
            <p>Bedankt. We hebben je testamentvragenlijst ontvangen. Je ontvangt per e-mail een bevestiging.</p>
          </div>
        </div>
      </div>
    );
  const progress = ((current + 1) / visibleSteps.length) * 100;

  return (
    <QuestionnaireContext.Provider value={{ values, setValue }}>
      <div className="questionnaire-page">
        <div id="will-intake" className="will-intake" ref={formTopRef}>
          <div className="wi-top">
            <div className="wi-brand-masthead" aria-label="Dutch Lawyer in de UAE">
              <img src="/images/dutch-lawyer-tulips.jpg" alt="Dutch Lawyer in de UAE" />
              <div className="wi-brand-lockup">
                <strong>Dubaitestament.nl</strong>
                <span>by&nbsp; Dutch Lawyer in de UAE</span>
              </div>
            </div>
            <h1>Gegevens voor je UAE-testament</h1>
            <p>
              Beantwoord de vragen hieronder. We gebruiken je antwoorden voor
              het opstellen van je UAE-testament.
            </p>
            <div className="wi-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="wi-progress-text">
              Stap {current + 1} van {visibleSteps.length}
            </div>
          </div>
          <form onSubmit={submit} noValidate>
            <section className="wi-step active">
              <h2>{active[1]}</h2>
              {active[0] === "person" && (
                <div className="wi-grid">
                  {personalFields.slice(0, 18).map((def) => (
                    <Field key={def.name} def={def} />
                  ))}
                  {values.will_type === "mirror" && (
                    <>
                      <div className="wi-field full"><h3 className="wi-subheading">Gegevens tweede testator</h3><p className="wi-note">Vul de gegevens van de tweede testator afzonderlijk in. Antwoorden worden niet automatisch overgenomen.</p></div>
                      {secondTestatorFields.map((def) => <Field key={def.name} def={def} />)}
                      {values.second_testator_existing_wills === "yes" && <Field def={{ label: "In welk land of welke landen?", name: "second_testator_existing_wills_countries" }} />}
                    </>
                  )}
                  {values.asset_structures === "yes" && (
                    <Field
                      def={{
                        label:
                          "Noem de vennootschap, holding, trust of foundation en beschrijf welke bezittingen daarin zijn ondergebracht",
                        name: "asset_structures_description",
                        type: "textarea",
                      }}
                    />
                  )}
                  {personalFields.slice(18, 21).map((def) => (
                    <Field key={def.name} def={def} />
                  ))}
                  {values.digital_assets === "yes" && (
                    <Field
                      def={{
                        label:
                          "Heb je geregeld hoe je executeur na je overlijden toegang krijgt tot deze digitale bezittingen?",
                        name: "digital_assets_executor_access",
                        type: "yesno",
                      }}
                    />
                  )}
                  {personalFields.slice(18, 19).map((def) => (
                    <Field key={def.name} def={def} />
                  ))}
                  {values.existing_wills === "yes" && (
                    <Field
                      def={{
                        label: "In welk land of welke landen?",
                        name: "existing_wills_countries",
                      }}
                    />
                  )}
                  {personalFields.slice(19).map((def) => (
                    <Field key={def.name} def={def} />
                  ))}
                </div>
              )}
              {active[0] === "executors" && (
                <>
                  <div className="wi-note">
                    Een executeur is de persoon die na je overlijden je
                    nalatenschap afwikkelt.
                  </div>
                  {PersonFields({ kind: "executor" })}
                  <button
                    type="button"
                    className="wi-add"
                    onClick={() => add("executor")}
                  >
                    Voeg een executeur toe
                  </button>
                </>
              )}
              {active[0] === "beneficiaries" && (
                <>
                  {PersonFields({ kind: "beneficiary" })}
                  <button
                    type="button"
                    className="wi-add"
                    onClick={() => add("beneficiary")}
                  >
                    Voeg een erfgenaam toe
                  </button>
                </>
              )}
              {active[0] === "children" && (
                <>
                  <Field
                    def={{
                      label: "Heb je kinderen van 18 jaar of ouder?",
                      name: "has_adult_children",
                      type: "yesno",
                    }}
                  />
                  {values.has_adult_children === "yes" && (
                    <>
                      {PersonFields({ kind: "adult_child" })}
                      <button
                        type="button"
                        className="wi-add"
                        onClick={() => add("adult_child")}
                      >
                        Voeg een meerderjarig kind toe
                      </button>
                    </>
                  )}
                  <Field
                    def={{
                      label: "Heb je kinderen die jonger zijn dan 18 jaar?",
                      name: "has_minor_children",
                      type: "yesno",
                    }}
                  />
                  {values.has_minor_children === "yes" && (
                    <>
                      {PersonFields({ kind: "minor_child" })}
                      <button
                        type="button"
                        className="wi-add"
                        onClick={() => add("minor_child")}
                      >
                        Voeg een minderjarig kind toe
                      </button>
                    </>
                  )}
                </>
              )}
              {active[0] === "other_parents" && (
                <>
                  <div className="wi-note">
                    De andere ouder van je minderjarige kind wordt eerst als
                    voogd aangewezen. Heb je minderjarige kinderen met
                    verschillende andere ouders, vul dan iedere andere ouder
                    apart in.
                  </div>
                  {PersonFields({ kind: "other_parent" })}
                  <button
                    type="button"
                    className="wi-add"
                    onClick={() => add("other_parent")}
                  >
                    Voeg een andere ouder toe
                  </button>
                </>
              )}
              {active[0] === "temporary_guardians" && (
                <>
                  <div className="wi-note">
                    Een tijdelijke voogd zorgt direct na je overlijden voor je
                    minderjarige kinderen totdat de permanente voogd de zorg kan
                    overnemen.
                  </div>
                  {PersonFields({ kind: "temporary_guardian" })}
                  <button
                    type="button"
                    className="wi-add"
                    onClick={() => add("temporary_guardian")}
                  >
                    Voeg een tijdelijke voogd toe
                  </button>
                </>
              )}
              {active[0] === "permanent_guardians" && (
                <>
                  <div className="wi-note">
                    Vul hier in wie permanente voogd moet worden als de andere
                    ouder die rol niet kan vervullen.
                  </div>
                  {PersonFields({ kind: "permanent_guardian" })}
                  <button
                    type="button"
                    className="wi-add"
                    onClick={() => add("permanent_guardian")}
                  >
                    Voeg een permanente voogd toe
                  </button>
                </>
              )}
              {active[0] === "financial_guardian" && (
                <>
                  <div className="wi-note">
                    De permanente voogd zorgt voor je minderjarige kinderen. De
                    persoon die je hieronder invult, beheert in deze rol het
                    vermogen dat je minderjarige kinderen uit jouw nalatenschap
                    krijgen. Het gaat om twee verschillende rollen.
                  </div>
                  <div className="wi-grid">
                    {[
                      {
                        label: "Volledige naam (zoals in paspoort)",
                        name: "financial_guardian_full_name",
                      },
                      {
                        label: "Geboortedatum",
                        name: "financial_guardian_dob",
                        placeholder: "yyyy-mm-dd",
                        inputMode: "numeric",
                      },
                      {
                        label: "Geboorteplaats",
                        name: "financial_guardian_birth_place",
                      },
                      {
                        label: "Nationaliteit",
                        name: "financial_guardian_nationality",
                      },
                      {
                        label: "Paspoortnummer",
                        name: "financial_guardian_passport",
                      },
                      {
                        label:
                          "Emirates ID-nummer (laat leeg als deze persoon geen Emirates ID heeft)",
                        name: "financial_guardian_eid",
                      },
                      {
                        label: "Adres",
                        name: "financial_guardian_address",
                        type: "textarea",
                        full: true,
                      },
                      {
                        label:
                          "Bedrag van de vergoeding voor deze persoon (laat leeg als je geen vergoeding wilt geven)",
                        name: "financial_guardian_compensation",
                      },
                      {
                        label:
                          "Hoe vaak moet deze vergoeding worden betaald? (laat leeg als je geen vergoeding wilt geven)",
                        name: "financial_guardian_compensation_frequency",
                      },
                    ].map((def) => (
                      <Field key={def.name} def={def as FieldDef} />
                    ))}
                  </div>
                </>
              )}
              {active[0] === "pets" && (
                <>
                  <Field
                    def={{
                      label: "Heb je huisdieren?",
                      name: "has_pets",
                      type: "yesno",
                    }}
                  />
                  {values.has_pets === "yes" && (
                    <div className="wi-grid">
                      {[
                        {
                          label: "Welke huisdieren heb je?",
                          name: "pets_description",
                          type: "textarea",
                          full: true,
                        },
                        {
                          label:
                            "Wie moet direct na je overlijden tijdelijk voor je huisdier(en) zorgen?",
                          name: "pets_temporary_caregiver",
                        },
                        {
                          label:
                            "Wil je dat je huisdier(en) na je overlijden naar een ander land worden gebracht?",
                          name: "pets_repatriate",
                          type: "yesno",
                        },
                        {
                          label:
                            "Mag een dierenarts je huisdier laten inslapen als dat medisch noodzakelijk is?",
                          name: "pets_euthanasia",
                          type: "yesno",
                        },
                        {
                          label:
                            "Welk bedrag mag maximaal worden gebruikt voor de verzorging en het vervoer van je huisdier(en)?",
                          name: "pets_budget",
                        },
                      ].map((def) => (
                        <Field key={def.name} def={def as FieldDef} />
                      ))}
                    </div>
                  )}
                </>
              )}
              {active[0] === "organ_donation" && (
                <Field
                  def={{
                    label: "Wil je orgaandonor zijn?",
                    name: "organ_donor",
                    type: "yesno",
                  }}
                />
              )}
              {active[0] === "funeral" && (
                <div className="wi-grid">
                  {[
                    {
                      label: "Wil je worden begraven of gecremeerd?",
                      name: "funeral_type",
                      type: "select",
                    },
                    {
                      label:
                        "In welk land wil je worden begraven of gecremeerd?",
                      name: "funeral_country",
                    },
                    {
                      label: "Andere wensen voor je uitvaart",
                      name: "funeral_instructions",
                      type: "textarea",
                      full: true,
                    },
                  ].map((def) => (
                    def.name === "funeral_type" ? <div className="wi-field" key={def.name}><label htmlFor="wi-funeral_type">{def.label}</label><select id="wi-funeral_type" value={values.funeral_type ?? ""} onChange={(e) => setValue("funeral_type", e.target.value)}><option value="">Kies een antwoord</option><option value="burial">Begraven</option><option value="cremation">Gecremeerd</option><option value="science">Ter beschikking stellen aan de wetenschap</option><option value="alkaline">Bio-crematie / oplossen</option></select></div> : <Field key={def.name} def={def as FieldDef} />
                  ))}
                </div>
              )}
              {active[0] === "practical" && (
                <>
                  {[
                    {
                      label:
                        "Wie betaalt de factuur van Holland Legal Services?",
                      name: "fees_responsible",
                    },
                    {
                      label: "Waarom wil je een UAE-testament laten opstellen?",
                      name: "main_reason",
                      type: "textarea",
                    },
                    {
                      label:
                        "Is er nog iets dat wij moeten weten voor het opstellen van je testament?",
                      name: "additional_remarks",
                      type: "textarea",
                    },
                  ].map((def) => (
                    <Field key={def.name} def={def as FieldDef} />
                  ))}
                </>
              )}
              {error && (
                <div className="wi-error show" role="alert">
                  {error}
                </div>
              )}
            </section>
            <div className="wi-nav">
              <button
                type="button"
                className="wi-btn"
                disabled={current === 0 || submitting}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              >
                Vorige
              </button>
              {current === visibleSteps.length - 1 ? (
                <button
                  type="submit"
                  className="wi-btn primary"
                  disabled={submitting}
                >
                  {submitting ? "Bezig..." : "Voltooien"}
                </button>
              ) : (
                <button type="button" className="wi-btn primary" onClick={next}>
                  Volgende
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </QuestionnaireContext.Provider>
  );
}
