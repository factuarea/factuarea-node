---
"@factuarea/sdk": minor
---

Add `transportDocuments` for the transport control document (DeCA): list,
statuses, retrieve, create, update and delete drafts, issue, modify, close,
reopen, cancel, supersede, send, the evidence, and the PDF, QR and proof of
issuance downloads. Export `TransportDocument`, its parts and the request type
of each step, and add the `issue-transport-document` example.

`qr` now returns a `BinaryResponse`: the resource generator treats every
`image/*` response as binary, so a PNG QR code keeps its bytes.
