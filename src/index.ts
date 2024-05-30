import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

const downloadSecret: string | undefined = Bun.env.HOOK_SECRET;

const PayloadSchema = z.object({
  url: z
    .string()
    .url()
    .trim()
    .transform((v) => new URL(v)),
  location: z.string().optional().default("."),
  secret: z
    .string()
    .optional()
    .refine(
      (v) => {
        if (downloadSecret) return v === downloadSecret;
        return true;
      },
      {
        message: "Internal secret and passed secret don't match",
      },
    ),
});

app
  .get("/", (c) => {
    return c.text("Simple file downloader location");
  })
  .post("/", zValidator("json", PayloadSchema), async (c) => {
    const { url, location } = c.req.valid("json");
    // @ts-expect-error: We're expecting to use this
    const rootDir: string = `${import.meta.dir}/mnt`;
    if (!existsSync(rootDir)) await mkdir(rootDir);
    const fileLoc = `${rootDir}/${location}`;
    if (!fileLoc) {
      return c.json(
        {
          title: "No filesystem location provided",
          detail: "The location provided is invalid.",
          location,
          fileLocation: fileLoc,
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/problem+json",
          },
        },
      );
    }

    if (!existsSync(fileLoc)) {
      await mkdir(fileLoc, {
        recursive: true,
      });
    }

    const fileRes = await fetch(url);
    if (!fileRes.ok) {
      return c.json(
        {
          title: "Error with URL file download",
          detail:
            "The URL file provided is having issues. Check logs for more info.",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/problem+json",
          },
        },
      );
    }
    const fileBuffer = await fileRes.arrayBuffer();
    const fileName = url.pathname.split("/").at(-1);
    Bun.write(`${fileLoc}/${fileName}`, fileBuffer);
    console.info(`Downloaded ${url.href} file to ${fileLoc}`);
    return c.json(
      {
        status: "success",
        result: Bun.pathToFileURL(`${fileLoc}/${fileName}`),
      },
      200,
    );
  });

export default app;
