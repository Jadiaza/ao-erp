import { assertNonEmpty, type DomainIssue, type DomainResult } from "../shared/primitives";

export type PersonRecord = { id: string; firstName: string; lastName: string; documentType?: string; documentNumber?: string; birthDate?: string; email?: string; phone?: string; status: "active" | "inactive" | "deceased" };
export type FamilyLink = { personId: string; familyId: string; relationship: "head" | "spouse" | "child" | "parent" | "other"; validFrom: string; validTo?: string };
export type ConsentRecord = { personId: string; purpose: "communications" | "pastoral_contact" | "data_processing"; granted: boolean; recordedAt: string; source: string };

export function validatePerson(person: PersonRecord): DomainResult<PersonRecord> {
  const errors: DomainIssue[] = [];
  if (!person.id.trim()) errors.push({ code: "PERSON_ID_REQUIRED", field: "id", message: "La persona debe tener un identificador." });
  if (!person.firstName.trim()) errors.push({ code: "FIRST_NAME_REQUIRED", field: "firstName", message: "Los nombres son obligatorios." });
  if (!person.lastName.trim()) errors.push({ code: "LAST_NAME_REQUIRED", field: "lastName", message: "Los apellidos son obligatorios." });
  if (person.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) errors.push({ code: "EMAIL_INVALID", field: "email", message: "El correo no tiene un formato válido." });
  if (person.birthDate && Number.isNaN(Date.parse(person.birthDate))) errors.push({ code: "BIRTH_DATE_INVALID", field: "birthDate", message: "La fecha de nacimiento no es válida." });
  return errors.length ? { ok: false, errors } : { ok: true, value: person };
}

export function validateFamilyLink(link: FamilyLink, knownPersonIds: ReadonlySet<string>, knownFamilyIds: ReadonlySet<string>): DomainResult<FamilyLink> {
  const errors: DomainIssue[] = [];
  if (!knownPersonIds.has(link.personId)) errors.push({ code: "PERSON_NOT_FOUND", field: "personId", message: "La persona no existe." });
  if (!knownFamilyIds.has(link.familyId)) errors.push({ code: "FAMILY_NOT_FOUND", field: "familyId", message: "La familia no existe." });
  if (link.validTo && link.validTo < link.validFrom) errors.push({ code: "FAMILY_LINK_DATE_RANGE_INVALID", message: "La fecha final no puede ser anterior a la inicial." });
  return errors.length ? { ok: false, errors } : { ok: true, value: link };
}

export function mayContactPerson(consents: readonly ConsentRecord[], personId: string, purpose: ConsentRecord["purpose"]): boolean {
  const latest = consents.filter((item) => item.personId === personId && item.purpose === purpose).sort((a,b) => b.recordedAt.localeCompare(a.recordedAt))[0];
  return latest?.granted === true;
}

export function buildPersonDisplayName(person: PersonRecord): string {
  assertNonEmpty(person.firstName, "firstName");
  assertNonEmpty(person.lastName, "lastName");
  return `${person.firstName.trim()} ${person.lastName.trim()}`;
}
