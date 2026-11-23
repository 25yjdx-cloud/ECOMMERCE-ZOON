import { spawn } from "node:child_process";

const backendUrl = "http://127.0.0.1:8001";

try {
  const response = await fetch(`${backendUrl}/up`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`استجابة غير ناجحة (${response.status})`);
  }

  const identityResponse = await fetch(`${backendUrl}/api/v1/templates`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!identityResponse.ok) {
    throw new Error(`واجهة CommerceForge غير متاحة (${identityResponse.status})`);
  }
} catch (error) {
  console.error(`[CommerceForge] Cannot start storefront: backend 8001 is unreachable or unhealthy (${error.message}).`);
  process.exit(1);
}

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", "3006"], {
  stdio: "inherit",
  env: {
    ...process.env,
    BACKEND_URL: backendUrl,
    NEXT_PUBLIC_API_URL: backendUrl,
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
