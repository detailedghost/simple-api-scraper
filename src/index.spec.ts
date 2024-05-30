import { describe, expect, it } from "bun:test";
import app from ".";

const dummyFileUrl =
	"https://gist.githubusercontent.com/detailedghost/026400ab01eb2694bf59a3e5e1af8109/raw/4cd5fdd0aadf2f19e0e03fcca073aaafe198a58b/dad_jokes.csv";

describe("GET /", () => {
	it("Should return 200 Response", async () => {
		const req = new Request("http://localhost/");
		const res = await app.fetch(req);
		expect(res.status).toBe(200);
	});
});

describe("POST /", () => {
	const postReq: Request = new Request("http://localhost/", {
		method: "POST",
	});

	it("Should return error with no payload", async () => {
		const res = await app.fetch(postReq.clone());
		expect(res.status).toBe(400);
	});

	it("Should return error if secret is active with no secret", async () => {
		const req = new Request(postReq, {
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: "http://localhost/",
				location: "./",
			}),
		});
		const res = await app.fetch(req);
		if (Bun.env.HOOK_SECRET) {
			expect(res.status).toBe(400);
			return;
		}
		expect(res.status).toBe(200);
	});

	it("Should return error with invalid url", async () => {
		const req = new Request(postReq, {
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: "invalid-url",
				location: ".",
				secret: Bun.env.HOOK_SECRET,
			}),
		});
		const res = await app.fetch(req);
		expect(res.status).toBe(400);
	});

	it("Should return 200 with valid url and no location", async () => {
		const req = new Request(postReq, {
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: dummyFileUrl,
				secret: Bun.env.HOOK_SECRET,
			}),
		});
		const res = await app.fetch(req);
		expect(res.status).toBe(200);
	});

	it("Should return 200 with valid full payload", async () => {
		const req = new Request(postReq, {
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: dummyFileUrl,
				location: ".",
				secret: Bun.env.HOOK_SECRET,
			}),
		});
		const res = await app.fetch(req);
		expect(res.status).toBe(200);
	});

	it("Should return 200 with full payload, unknown location", async () => {
		const req = new Request(postReq, {
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: dummyFileUrl,
				location: "./test",
				secret: Bun.env.HOOK_SECRET,
			}),
		});
		const res = await app.fetch(req);
		expect(res.status).toBe(200);
	});
});
