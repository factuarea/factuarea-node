---
"@factuarea/sdk": minor
---

Add the tasks and projects resources and re-pin `spec/openapi.json` from the current public contract (457 paths / 564 operations: 81 added, none removed). `src/generated/` and `src/resources/` are regenerated.

New resources on the client (80 operations). Every write sends an `Idempotency-Key`, lists return a `Page` with cursor auto-pagination, and errors use the typed hierarchy.

- `factuarea.projects` (22): `list`, `create`, `show`, `update`, `delete`, `archive`, `unarchive`, `findByKey`; `columns` (`list`, `create`, `update`, `delete`, `reorder`); `customFields` (`list`, `create`, `update`, `delete`); `tasks` (`export`, `import`); `timeSummary.show`; `timeInvoices` (`preview`, `create`). `columns.delete` takes `move_to_column_id` in its query to relocate the column's tasks.
- `factuarea.tasks` (45): `search`, `create`, `show`, `update`, `delete`, `duplicate`, `findByKey`, `linked`, `status`, `move`, `reposition`, `assign`, `unassign`, `bulkStatus`, `bulkUpdate`, `bulkDelete`; `comments` (`list`, `create`, `update`, `delete`); `relations` (`list`, `create`, `delete`); `labels` (`assign`, `unassign`); `customFields.set`; `externalLinks` (`list`, `create`, `delete`); `entityLinks` (`list`, `create`, `delete`); `attachments` (`list`, `show`, `create`, `download`, `delete`); `uploadLinks.create`; `timeEntries` (`list`, `show`, `create`, `update`, `delete`); `timer.start`; `activities.list`. `create` accepts `entity_link` to link the task to a document or contact in the same call, and `custom_fields` is a map from field id to a string, number, boolean, string array or `null`.
- `factuarea.taskLabels` (5): `list`, `create`, `show`, `update`, `delete`.
- `factuarea.taskTimers` (2): `current` (`{ data: null }` when nothing is running) and `stop`.
- `factuarea.users` (2): `me`, `list`.
- `factuarea.notifications` (3): `list`, `read`, `markAllRead`.
- `factuarea.agenda` (1): `list`, a combined agenda of due tasks, document due dates, tax deadlines, absences and holidays.

The request and response types of these resources (`Project`, `ProjectColumn`, `Task`, `TaskComment`, `TaskLabel`, `TaskTimeEntry`, `TaskAttachment`, `AgendaItem`, `CreateTaskV1Request`, `UpdateTaskV1Request`, `LogTaskTimeV1Request` and the rest) are exported from `@factuarea/sdk`.

Also carried by the re-pin, measured against the previous pinned spec:

- New `invoices.issue` (`POST /invoices/{invoice}/issue`).
- `Invoice` gains `issued_at`, `sent_via` and `is_sent`, its `status` is now a typed union, and `invoices.list` accepts an `is_sent` filter.
- Recurring invoices gain `generation_mode` (`draft`, `issue` or `issue_and_send`) on create, update and read.
- 24 new webhook event types, accepted by `webhookEndpoints` subscriptions and test events: `invoice.issued`, `invoice.marked_sent`, `invoice.unsent` and 21 for tasks, comments, time entries and projects.
- New enum values: `issued` in the bulk invoice status change, `issued` in place of `sent` in the invoice Excel export status filter, `issue` in place of `draft` as a scheduled invoice action, and the automation action types `create_task`, `change_task_status`, `assign_task` and `add_task_comment`.
- API key scopes: `projects:read|write|delete`, `tasks:read|write|delete`, `users:read` and `notifications:read|write` are added; the retired `clients:*` and `suppliers:*` scopes leave the enum.
