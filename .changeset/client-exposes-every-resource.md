---
"@factuarea/sdk": minor
---

Every generated resource is a property of the client. The client listed its resources by hand, so 36 of the 69 resources the SDK generates were unreachable, among them the `packs`, `promotions` and `additionalNifSeats` announced in `0.13.0`. They are all reachable now, and a resource that a later spec sync adds is exposed as soon as it is generated:

`absenceBalances`, `absenceCalendar`, `absencePolicies`, `absenceRequests`, `absenceTypes`, `additionalNifSeats`, `automations`, `developers`, `emails`, `employeeBatches`, `employeeInvitations`, `employeeSeatOfferRedemptions`, `employeeSeats`, `employees`, `gestoria`, `gestoriaSeatOfferRedemptions`, `holidays`, `integrations`, `monthlyTimeRecordCloses`, `packs`, `paymentMethods`, `payouts`, `payrollExportFormats`, `presence`, `priceLists`, `promotions`, `shopify`, `stores`, `stripeAutoinvoicing`, `taxCatalog`, `timeBalances`, `timeCorrections`, `timeEntries`, `timeTrackingSettings`, `woocommerce` and `workSchedules`.

```ts
await factuarea.packs.list(company);
await factuarea.employees.list(company);
```
