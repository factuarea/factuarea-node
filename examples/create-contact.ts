/**
 * Create one contact with both customer and supplier roles.
 * Run with your project's TypeScript runner and FACTUAREA_API_KEY configured.
 */
import { Factuarea, type BusinessContact, type CreateBusinessContactV1Request } from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });
const input: CreateBusinessContactV1Request = {
  name: "Contacto Demo SL",
  kind: "company",
  tax_id: "B12345674",
  roles: ["customer", "supplier"],
  address: { line_1: "Calle Mayor 1", city: "Madrid", country_code: "ES" },
};
const { data: contact } = (await factuarea.contacts.create(input)) as { data: BusinessContact };
console.log("Contact:", contact.id, contact.roles);

// Both directions share the same fiscal identity. Directional preferences
// belong to its profiles, not to separate client/supplier records.
await factuarea.contacts.updateCustomerProfile(contact.id, { payment_terms_days: 30 });
await factuarea.contacts.updateSupplierProfile(contact.id, { payment_terms_days: 15 });

const page = await factuarea.contacts.list({ roles: ["customer", "supplier"], search: contact.name });
console.log("Matching contacts:", page.data);
