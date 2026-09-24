import { NextResponse } from "next/server";
import { sendQuestionnaireConfirmation } from "@/lib/email";
import { createEspoRecord } from "@/lib/espo";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EID_PATTERN = /^784-(?:19|20)\d{2}-\d{7}-\d$/;

function validDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function futureDate(value: string) {
  if (!validDate(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return date.getTime() > today;
}

function adultDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  const now = new Date();
  const cutoff = new Date(Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()));
  return date <= cutoff;
}

function filterApplicableData(data: QuestionnaireData): QuestionnaireData {
  const filtered = { ...data };
  const isMirror = data.will_type === "mirror";
  for (const key of Object.keys(filtered)) {
    const conditional =
      (key.startsWith("second_testator_") && !isMirror) ||
      (key === "asset_structures_description" && data.asset_structures !== "yes") ||
      (key === "digital_assets_executor_access" && data.digital_assets !== "yes") ||
      (key === "existing_wills_countries" && data.existing_wills !== "yes") ||
      (key === "second_testator_asset_structures_description" && data.second_testator_asset_structures !== "yes") ||
      (key === "second_testator_digital_assets_executor_access" && data.second_testator_digital_assets !== "yes") ||
      (key === "second_testator_existing_wills_countries" && data.second_testator_existing_wills !== "yes") ||
      (key.startsWith("pets_") && data.has_pets !== "yes");
    if (conditional) delete filtered[key];
  }
  for (const group of ["adult_children", "minor_children", "other_parents", "temporary_guardians", "permanent_guardians"]) {
    if ((group === "adult_children" && data.has_adult_children !== "yes") ||
        (group !== "adult_children" && data.has_minor_children !== "yes")) {
      delete filtered[group];
    }
  }
  return filtered;
}

function validateSubmission(input: QuestionnaireData) {
  const data = filterApplicableData(input);
  if (data.will_type !== "single" && data.will_type !== "mirror") return "Kies Single Will of Mirror Will.";
  const email = String(data.testator_email ?? "");
  const phone = String(data.testator_phone ?? "").replace(/[ .()-]/g, "");
  const dob = String(data.testator_dob ?? "");
  if (!String(data.testator_full_name ?? "").trim() || !email || !phone) return "Vul je naam, e-mailadres en telefoonnummer in.";
  if (data.has_adult_children !== "yes" && data.has_adult_children !== "no") return "Beantwoord de vraag over meerderjarige kinderen met Ja of Nee.";
  if (data.has_minor_children !== "yes" && data.has_minor_children !== "no") return "Beantwoord de vraag over minderjarige kinderen met Ja of Nee.";
  if (!EMAIL_PATTERN.test(email)) return "Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.";
  if (!PHONE_PATTERN.test(phone)) return "Vul een geldig internationaal telefoonnummer in, bijvoorbeeld +31612345678.";
  if (!validDate(dob)) return "Vul een bestaande geboortedatum in als yyyy-mm-dd.";
  if (futureDate(dob)) return "Een geboortedatum kan niet in de toekomst liggen.";
  if (!adultDate(dob)) return "Je moet minimaal 18 jaar oud zijn om een testament te registreren.";
  if (data.testator_eid && !EID_PATTERN.test(String(data.testator_eid))) return "Vul het Emirates ID in als 784-YYYY-XXXXXXX-X; het jaar moet met 19 of 20 beginnen.";
  for (const [name, value] of Object.entries(data)) {
    if (name.endsWith("_dob") && name !== "testator_dob" && value && !validDate(String(value))) return "Vul iedere geboortedatum in als yyyy-mm-dd, bijvoorbeeld 1980-06-30.";
    if (name.endsWith("_dob") && value && futureDate(String(value))) return "Een geboortedatum kan niet in de toekomst liggen.";
    if (name.endsWith("_eid") && name !== "testator_eid" && value && !EID_PATTERN.test(String(value))) return "Vul ieder Emirates ID in als 784-YYYY-XXXXXXX-X.";
  }
  for (const group of ["executors", "beneficiaries", "adult_children", "minor_children", "other_parents", "temporary_guardians", "permanent_guardians"]) {
    const people = data[group];
    if (!Array.isArray(people)) continue;
    for (const person of people) {
      if (!person || typeof person !== "object") continue;
      const personData = person as QuestionnaireData;
      if (personData.dob && !validDate(String(personData.dob))) return "Vul iedere geboortedatum in als yyyy-mm-dd, bijvoorbeeld 1980-06-30.";
      if (personData.dob && futureDate(String(personData.dob))) return "Een geboortedatum kan niet in de toekomst liggen.";
      if (group === "adult_children" && personData.dob && !adultDate(String(personData.dob))) return "De geboortedatum van een meerderjarig kind moet bij een leeftijd van 18 jaar of ouder passen.";
      if (group === "minor_children" && personData.dob && adultDate(String(personData.dob))) return "De geboortedatum van een minderjarig kind moet bij een leeftijd onder 18 jaar passen.";
      if (personData.eid && !EID_PATTERN.test(String(personData.eid))) return "Vul ieder Emirates ID in als 784-YYYY-XXXXXXX-X.";
    }
  }
  if (data.will_type === "mirror") {
    const secondName = String(data.second_testator_full_name ?? "").trim();
    const secondEmail = String(data.second_testator_email ?? "");
    const secondPhone = String(data.second_testator_phone ?? "").replace(/[ .()-]/g, "");
    const secondDob = String(data.second_testator_dob ?? "");
    if (!secondName || !secondEmail || !secondPhone || !secondDob) return "Voor een Mirror Will zijn de gegevens van beide testatoren verplicht.";
    if (!EMAIL_PATTERN.test(secondEmail)) return "Vul een geldig e-mailadres in voor de tweede testator.";
    if (!PHONE_PATTERN.test(secondPhone)) return "Vul een geldig internationaal telefoonnummer in voor de tweede testator.";
    if (!validDate(secondDob)) return "Vul een bestaande geboortedatum in voor de tweede testator.";
    if (futureDate(secondDob)) return "De geboortedatum van de tweede testator kan niet in de toekomst liggen.";
    if (!adultDate(secondDob)) return "De tweede testator moet minimaal 18 jaar oud zijn.";
    if (data.second_testator_eid && !EID_PATTERN.test(String(data.second_testator_eid))) return "Vul het Emirates ID van de tweede testator in als 784-YYYY-XXXXXXX-X.";
  }
  return null;
}

type QuestionnaireData = Record<string, unknown>;

const questionnaireFields = [
  "will_type",
  "testator_full_name",
  "testator_dob",
  "testator_birth_place",
  "testator_nationality",
  "testator_passport",
  "testator_eid",
  "testator_address",
  "testator_email",
  "testator_phone",
  "testator_marital_status",
  "testator_tax_residency",
  "residence_history_20_years",
  "profession",
  "employer_company",
  "asset_structures",
  "asset_structures_description",
  "asset_countries",
  "asset_types",
  "digital_assets",
  "digital_assets_executor_access",
  "existing_wills",
  "existing_wills_countries",
  "pep",
  "business_countries",
  "second_testator_full_name",
  "second_testator_dob",
  "second_testator_birth_place",
  "second_testator_nationality",
  "second_testator_passport",
  "second_testator_eid",
  "second_testator_email",
  "second_testator_phone",
  "second_testator_address",
  "second_testator_marital_status",
  "second_testator_has_partner",
  "second_testator_has_children",
  "second_testator_tax_residency",
  "second_testator_residence_history_20_years",
  "second_testator_profession",
  "second_testator_employer_company",
  "second_testator_asset_structures",
  "second_testator_asset_structures_description",
  "second_testator_asset_countries",
  "second_testator_asset_types",
  "second_testator_digital_assets",
  "second_testator_digital_assets_executor_access",
  "second_testator_existing_wills",
  "second_testator_existing_wills_countries",
  "second_testator_pep",
  "second_testator_business_countries",
  "second_testator_joint_assets_ownership",
  "second_testator_organ_donor",
  "second_testator_funeral_type",
  "second_testator_funeral_country",
  "second_testator_funeral_instructions",
  "has_adult_children",
  "has_minor_children",
  "financial_guardian_full_name",
  "financial_guardian_dob",
  "financial_guardian_birth_place",
  "financial_guardian_nationality",
  "financial_guardian_passport",
  "financial_guardian_eid",
  "financial_guardian_address",
  "financial_guardian_compensation",
  "financial_guardian_compensation_frequency",
  "has_pets",
  "pets_description",
  "pets_temporary_caregiver",
  "pets_repatriate",
  "pets_euthanasia",
  "pets_budget",
  "organ_donor",
  "funeral_type",
  "funeral_country",
  "funeral_instructions",
  "fees_responsible",
  "main_reason",
  "additional_remarks",
] as const;

const questionnaireGroups = [
  "executors",
  "beneficiaries",
  "adult_children",
  "minor_children",
  "other_parents",
  "temporary_guardians",
  "permanent_guardians",
] as const;

const personFields = [
  "full_name",
  "dob",
  "birth_place",
  "nationality",
  "passport",
  "eid",
  "address",
  "parents",
] as const;

const groupFields: Record<
  (typeof questionnaireGroups)[number],
  readonly string[]
> = {
  executors: [...personFields, "compensation", "compensation_frequency"],
  beneficiaries: [
    ...personFields,
    "share",
    "distribution_conditions",
    "relationship_exists",
    "to_children_if_predeceased",
    "notes",
  ],
  adult_children: [...personFields, "relationship"],
  minor_children: [...personFields, "relationship"],
  other_parents: personFields,
  temporary_guardians: personFields,
  permanent_guardians: personFields,
};

function cleanValue(value: unknown): unknown {
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    return value.length ? value.map(cleanValue) : null;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        cleanValue(nestedValue),
      ]),
    );
  }
  return value ?? null;
}

function normalizeQuestionnaire(data: QuestionnaireData) {
  const fields = questionnaireFields.map((field) => [
    field,
    cleanValue(data[field]),
  ]);
  const groups = questionnaireGroups.map((group) => {
    const people = data[group];
    if (!Array.isArray(people) || people.length === 0) return [group, null];

    return [
      group,
      people.map((person) =>
        Object.fromEntries(
          groupFields[group].map((field) => [
            field,
            cleanValue(
              person && typeof person === "object"
                ? (person as QuestionnaireData)[field]
                : null,
            ),
          ]),
        ),
      ),
    ];
  });

  return Object.fromEntries([...fields, ...groups]);
}

const reportSections: Array<{
  title: string;
  fields: Array<[string, string]>;
}> = [
  {
    title: "Jouw gegevens",
    fields: [
      ["testator_full_name", "Volledige naam"],
      ["will_type", "Type testament"],
      ["testator_dob", "Geboortedatum"],
      ["testator_birth_place", "Geboorteplaats"],
      ["testator_nationality", "Nationaliteit"],
      ["testator_passport", "Paspoortnummer"],
      ["testator_eid", "Emirates ID-nummer"],
      ["testator_address", "Adres"],
      ["testator_email", "E-mailadres"],
      ["testator_phone", "Telefoonnummer"],
      ["testator_marital_status", "Burgerlijke staat"],
      ["testator_tax_residency", "Fiscale woonlanden"],
      ["residence_history_20_years", "Woonhistorie afgelopen 20 jaar"],
      ["profession", "Beroep"],
      ["employer_company", "Werkgever of bedrijf"],
      ["asset_structures", "Vermogen in vennootschap, trust of foundation"],
      ["asset_structures_description", "Beschrijving vermogensstructuren"],
      ["asset_countries", "Landen waar vermogen aanwezig is"],
      ["asset_types", "Soorten vermogen"],
      ["digital_assets", "Digitale bezittingen"],
      ["digital_assets_executor_access", "Toegang executeur tot digitale bezittingen"],
      ["existing_wills", "Bestaande buitenlandse testamenten"],
      ["existing_wills_countries", "Landen bestaande testamenten"],
      ["pep", "Politiek prominent persoon"],
      ["business_countries", "Landen waarin zaken worden gedaan"],
    ],
  },
  {
    title: "Kinderen en financieel voogd",
    fields: [
      ["has_adult_children", "Kinderen van 18 jaar of ouder"],
      ["has_minor_children", "Kinderen jonger dan 18 jaar"],
      ["financial_guardian_full_name", "Naam financieel voogd"],
      ["financial_guardian_dob", "Geboortedatum financieel voogd"],
      ["financial_guardian_birth_place", "Geboorteplaats financieel voogd"],
      ["financial_guardian_nationality", "Nationaliteit financieel voogd"],
      ["financial_guardian_passport", "Paspoort financieel voogd"],
      ["financial_guardian_eid", "Emirates ID financieel voogd"],
      ["financial_guardian_address", "Adres financieel voogd"],
      ["financial_guardian_compensation", "Vergoeding financieel voogd"],
      ["financial_guardian_compensation_frequency", "Frequentie vergoeding"],
    ],
  },
  {
    title: "Tweede testator",
    fields: [
      ["second_testator_full_name", "Naam tweede testator"],
      ["second_testator_dob", "Geboortedatum tweede testator"],
      ["second_testator_birth_place", "Geboorteplaats tweede testator"],
      ["second_testator_nationality", "Nationaliteit tweede testator"],
      ["second_testator_passport", "Paspoort tweede testator"],
      ["second_testator_eid", "Emirates ID tweede testator"],
      ["second_testator_email", "E-mailadres tweede testator"],
      ["second_testator_phone", "Telefoonnummer tweede testator"],
      ["second_testator_address", "Adres tweede testator"],
      ["second_testator_marital_status", "Burgerlijke staat tweede testator"],
      ["second_testator_has_partner", "Partner tweede testator"],
      ["second_testator_has_children", "Kinderen tweede testator"],
      ["second_testator_tax_residency", "Fiscale woonlanden tweede testator"],
      ["second_testator_residence_history_20_years", "Woonhistorie tweede testator afgelopen 20 jaar"],
      ["second_testator_profession", "Beroep tweede testator"],
      ["second_testator_employer_company", "Werkgever of bedrijf tweede testator"],
      ["second_testator_asset_structures", "Vermogensstructuur tweede testator"],
      ["second_testator_asset_structures_description", "Beschrijving vermogensstructuur tweede testator"],
      ["second_testator_asset_countries", "Landen vermogen tweede testator"],
      ["second_testator_asset_types", "Vermogen tweede testator"],
      ["second_testator_digital_assets", "Digitale bezittingen tweede testator"],
      ["second_testator_digital_assets_executor_access", "Toegang executeur tot digitale bezittingen tweede testator"],
      ["second_testator_existing_wills", "Bestaande testamenten tweede testator"],
      ["second_testator_existing_wills_countries", "Landen bestaande testamenten tweede testator"],
      ["second_testator_pep", "Politiek prominent persoon tweede testator"],
      ["second_testator_business_countries", "Landen waarin tweede testator zaken doet"],
      ["second_testator_joint_assets_ownership", "Eigendomsaandelen gezamenlijke bezittingen"],
      ["second_testator_organ_donor", "Orgaandonor tweede testator"],
      ["second_testator_funeral_type", "Uitvaartwens tweede testator"],
      ["second_testator_funeral_country", "Land van uitvaart tweede testator"],
      ["second_testator_funeral_instructions", "Overige uitvaartwensen tweede testator"],
    ],
  },
  {
    title: "Huisdieren",
    fields: [
      ["has_pets", "Huisdieren"],
      ["pets_description", "Beschrijving huisdieren"],
      ["pets_temporary_caregiver", "Tijdelijke verzorger"],
      ["pets_repatriate", "Huisdieren naar ander land brengen"],
      ["pets_euthanasia", "Inslapen indien medisch noodzakelijk"],
      ["pets_budget", "Budget voor verzorging en vervoer"],
    ],
  },
  {
    title: "Orgaandonatie en uitvaart",
    fields: [
      ["organ_donor", "Orgaandonor"],
      ["funeral_type", "Begraven of cremeren"],
      ["funeral_country", "Land van uitvaart"],
      ["funeral_instructions", "Overige uitvaartwensen"],
    ],
  },
  {
    title: "Praktische gegevens",
    fields: [
      ["fees_responsible", "Verantwoordelijk voor de factuur"],
      ["main_reason", "Reden voor het UAE-testament"],
      ["additional_remarks", "Aanvullende opmerkingen"],
    ],
  },
];

const groupReportDefinitions: Array<{
  key: (typeof questionnaireGroups)[number];
  title: string;
  personLabel: string;
  fields: Array<[string, string]>;
}> = [
  {
    key: "executors",
    title: "Executeurs",
    personLabel: "Executeur",
    fields: [
      ["full_name", "Volledige naam"],
      ["dob", "Geboortedatum"],
      ["birth_place", "Geboorteplaats"],
      ["nationality", "Nationaliteit"],
      ["passport", "Paspoortnummer"],
      ["eid", "Emirates ID-nummer"],
      ["address", "Adres"],
      ["compensation", "Vergoeding"],
      ["compensation_frequency", "Frequentie vergoeding"],
    ],
  },
  {
    key: "beneficiaries",
    title: "Erfgenamen",
    personLabel: "Erfgenaam",
    fields: [
      ["full_name", "Volledige naam"],
      ["dob", "Geboortedatum"],
      ["birth_place", "Geboorteplaats"],
      ["nationality", "Nationaliteit"],
      ["passport", "Paspoortnummer"],
      ["eid", "Emirates ID-nummer"],
      ["address", "Adres"],
      ["share", "Aandeel in nalatenschap"],
      ["distribution_conditions", "Voorwaarden voor uitkering"],
      ["relationship_exists", "Alleen erven zolang relatie bestaat"],
      ["to_children_if_predeceased", "Erfdeel naar kinderen bij vooroverlijden"],
      ["notes", "Opmerkingen"],
    ],
  },
  {
    key: "adult_children",
    title: "Meerderjarige kinderen",
    personLabel: "Kind",
    fields: [...personFields.map((field) => [field, personFieldLabel(field)] as [string, string]), ["relationship", "Huidige of eerdere relatie"]],
  },
  {
    key: "minor_children",
    title: "Minderjarige kinderen",
    personLabel: "Kind",
    fields: [...personFields.map((field) => [field, personFieldLabel(field)] as [string, string]), ["relationship", "Huidige of eerdere relatie"]],
  },
  {
    key: "other_parents",
    title: "Andere ouders",
    personLabel: "Andere ouder",
    fields: personFields.map((field) => [field, personFieldLabel(field)]),
  },
  {
    key: "temporary_guardians",
    title: "Tijdelijke voogden",
    personLabel: "Tijdelijke voogd",
    fields: personFields.map((field) => [field, personFieldLabel(field)]),
  },
  {
    key: "permanent_guardians",
    title: "Permanente voogden",
    personLabel: "Permanente voogd",
    fields: personFields.map((field) => [field, personFieldLabel(field)]),
  },
];

function personFieldLabel(field: string) {
  return {
    full_name: "Volledige naam",
    dob: "Geboortedatum",
    birth_place: "Geboorteplaats",
    nationality: "Nationaliteit",
    passport: "Paspoortnummer",
    eid: "Emirates ID-nummer",
    address: "Adres",
  }[field] ?? field;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Niet ingevuld";
  }
  if (value === "yes") return "Ja";
  if (value === "no") return "Nee";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.split("-").reverse().join("-");
  }
  return String(value);
}

function formatQuestionnaireReport(questionnaire: QuestionnaireData) {
  const lines: string[] = [];

  for (const section of reportSections) {
    lines.push(section.title.toUpperCase());
    for (const [field, label] of section.fields) {
      lines.push(`${label}: ${displayValue(questionnaire[field])}`);
    }
    lines.push("");
  }

  for (const group of groupReportDefinitions) {
    lines.push(group.title.toUpperCase());
    const people = questionnaire[group.key];
    if (!Array.isArray(people) || people.length === 0) {
      lines.push("Niet ingevuld", "");
      continue;
    }

    people.forEach((person, index) => {
      lines.push(`${group.personLabel} ${index + 1}`);
      for (const [field, label] of group.fields) {
        const value =
          person && typeof person === "object"
            ? (person as QuestionnaireData)[field]
            : null;
        lines.push(`- ${label}: ${displayValue(value)}`);
      }
      lines.push("");
    });
  }

  return lines.join("\n").trim();
}

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

// EspoCRM rejects null for boolean and enum fields. Unanswered values remain
// null in cQuestionnaireData, while incompatible dedicated fields are omitted.
const yesNo = (value: unknown) =>
  value === "yes" ? true : value === "no" ? false : undefined;

const enumValue = (
  value: unknown,
  options: Record<string, string>,
) => {
  const normalized = text(value)?.toLocaleLowerCase("nl-NL");
  return normalized ? options[normalized] : undefined;
};

const currency = (value: unknown) => {
  const normalized = text(value)?.replace(",", ".");
  return normalized && /^\d+(?:\.\d{1,2})?$/.test(normalized)
    ? Number(normalized)
    : null;
};

const espoDateTime = (date: Date) =>
  date.toISOString().slice(0, 19).replace("T", " ");

export async function POST(request: Request) {
  try {
    const rawData = (await request.json()) as QuestionnaireData;
    const validationError = validateSubmission(rawData);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }
    const data = filterApplicableData(rawData);
    const fullName = text(data.testator_full_name);
    const email = text(data.testator_email);
    const phone = text(data.testator_phone);

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Naam, e-mailadres en telefoonnummer zijn verplicht.",
        },
        { status: 400 },
      );
    }

    const questionnaire = normalizeQuestionnaire(data);
    const recordName = `UAE-testament - ${fullName}`;
    const rawPayload = {
      name: recordName,
      cName: recordName,
      cQuestionnaireSource: "Website",
      cQuestionnaireStatus: "Submitted",
      cQuestionnaireSubmittedAt: espoDateTime(new Date()),
      cQuestionnaireData: formatQuestionnaireReport(questionnaire),
      cTestatorFullName: fullName,
      cTestatorDob: text(data.testator_dob),
      cTestatorBirthPlace: text(data.testator_birth_place),
      cTestatorNationality: text(data.testator_nationality),
      cTestatorPassport: text(data.testator_passport),
      cTestatorEid: text(data.testator_eid),
      cTestatorAddress: text(data.testator_address),
      cTestatorEmail: email,
      cTestatorPhone: phone,
      cTestatorMaritalStatus: enumValue(data.testator_marital_status, {
        married: "Married",
        getrouwd: "Married",
        single: "Single",
        ongehuwd: "Single",
        divorced: "Divorced",
        gescheiden: "Divorced",
        widowed: "Widowed",
        weduwe: "Widowed",
        weduwnaar: "Widowed",
      }),
      cTestatorTaxResidency: text(data.testator_tax_residency),
      cResidenceHistory20Years: text(data.residence_history_20_years),
      cProfession: text(data.profession),
      cEmployerCompany: text(data.employer_company),
      cAssetStructures: yesNo(data.asset_structures),
      cAssetStructuresDescription: text(data.asset_structures_description),
      cAssetCountries: text(data.asset_countries),
      cAssetTypes: text(data.asset_types),
      cDigitalAssets: yesNo(data.digital_assets),
      cDigitalAssetsExecutorAccess: yesNo(
        data.digital_assets_executor_access,
      ),
      cExistingWills: yesNo(data.existing_wills),
      cExistingWillsCountries: text(data.existing_wills_countries),
      cPep: yesNo(data.pep),
      cBusinessCountries: text(data.business_countries),
      cHasAdultChildren: yesNo(data.has_adult_children),
      cHasMinorChildren: yesNo(data.has_minor_children),
      cFinancialGuardianFullName: text(data.financial_guardian_full_name),
      cFinancialGuardianDob: text(data.financial_guardian_dob),
      cfinancialGuardianBirthPlace: text(
        data.financial_guardian_birth_place,
      ),
      cFinancialGuardianNationality: text(
        data.financial_guardian_nationality,
      ),
      cFinancialGuardianPassport: text(data.financial_guardian_passport),
      cFinancialGuardianEid: text(data.financial_guardian_eid),
      cFinancialGuardianAddress: text(data.financial_guardian_address),
      cFinancialGuardianCompensation: currency(
        data.financial_guardian_compensation,
      ),
      cFinancialGuardianCompensationFrequency: text(
        data.financial_guardian_compensation_frequency,
      ),
      cHasPets: yesNo(data.has_pets),
      cPetsDescription: text(data.pets_description),
      cPetsTemporaryCaregiver: text(data.pets_temporary_caregiver),
      cPetsRepatriate: yesNo(data.pets_repatriate),
      cPetsEuthanasia: yesNo(data.pets_euthanasia),
      cPetsBudget: currency(data.pets_budget),
      cOrganDonor: yesNo(data.organ_donor),
      cFuneralType: enumValue(data.funeral_type, {
        buried: "Buried",
        begraven: "Buried",
        cremated: "Cremated",
        gecremeerd: "Cremated",
      }),
      cFuneralCountry: text(data.funeral_country),
      cFuneralInstructions: text(data.funeral_instructions),
      cFeesResponsible: text(data.fees_responsible),
      cMainReason: text(data.main_reason),
      cAdditionalRemarks: text(data.additional_remarks),
    };
    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, value]) => value !== null && value !== undefined),
    );

    const result = await createEspoRecord(payload);

    try {
      await sendQuestionnaireConfirmation({
        fullName,
        email,
        willType: String(data.will_type),
        additionalEmails: [text(data.second_testator_email)],
        notificationEmail: text(process.env.QUESTIONNAIRE_NOTIFICATION_EMAIL),
      });
    } catch (emailError) {
      console.error("Questionnaire confirmation email failed", emailError);
      return NextResponse.json(
        {
          success: false,
          id: result.id,
          message:
            "Je gegevens zijn opgeslagen, maar de bevestigingsmail kon niet worden verzonden. Neem contact met ons op als je geen e-mail ontvangt.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: result.id,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error("Questionnaire submission failed", error);

    return NextResponse.json(
      {
        success: false,
        message: "Het formulier kon niet worden verwerkt.",
      },
      {
        status: 500,
      },
    );
  }
}
