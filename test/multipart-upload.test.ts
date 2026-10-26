// A multipart operation (`POST /pdf-templates/assets`: `file` + `kind`) sends the
// caller's FormData untouched, with its own boundary and an auto Idempotency-Key.
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";
import { BaseResource, type RequestConfig } from "../src/core/resource.js";

useMockServer();

class AssetsResource extends BaseResource {
  upload(formData: FormData, config?: RequestConfig): Promise<unknown> {
    return this._sendForm<unknown>("/pdf-templates/assets", formData, config);
  }
}

describe("multipart upload", () => {
  it("sends file and kind as multipart parts, not JSON", async () => {
    let contentType: string | null = null;
    let idempotencyKey: string | null = null;
    let form: FormData | undefined;
    server.use(
      http.post(`${BASE_URL}/pdf-templates/assets`, async ({ request }) => {
        contentType = request.headers.get("Content-Type");
        idempotencyKey = request.headers.get("Idempotency-Key");
        form = await request.formData();
        return HttpResponse.json({ data: { id: "a1" } }, { status: 201 });
      }),
    );

    const body = new FormData();
    body.set("kind", "logo");
    body.set("file", new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" }), "logo.png");
    const assets = new AssetsResource(testClient().http);

    expect(await assets.upload(body)).toEqual({ data: { id: "a1" } });
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(idempotencyKey).toBeTruthy();
    expect(form?.get("kind")).toBe("logo");
    const file = form?.get("file") as File;
    expect(file.name).toBe("logo.png");
    expect(file.type).toBe("image/png");
    expect(file.size).toBe(4);
  });
});
