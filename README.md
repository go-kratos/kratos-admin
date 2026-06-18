# Kratos Admin Template

## Best Practice
Google AIP(https://google.aip.dev/general):
1. Resource-oriented design
2. Filtering
3. Pagination
4. Field masks
5. Field behavior

## Generate API files
Proto generation is driven by [buf](https://buf.build). Dependencies such as
googleapis are resolved from the Buf Schema Registry (`buf.build/googleapis/googleapis`),
so there is no vendored `third_party/` directory.
```shell
# Install tooling (buf + wire)
make init
# Generate API files (pb.go, grpc, kratos http, openapi.yaml, web TS clients) from api/*.proto
make api
# Generate internal config (internal/conf/conf.pb.go) from internal/*.proto
make config
```

## Run Web Application
```shell
# Enter web directory, install dependencies and start development server
cd web
npm install
npm run dev
```

The generated clients work with any Promise-based HTTP client that returns JSON.  
Services are defined and re-exported from this file: `web/src/services/index.ts`.  
```typescript
import { createAdminServiceClient } from "@/services/kratos/admin/v1/index";

type Request = {
  path: string;
  method: string;
  body: string | null;
};

function requestHandler({ path, method, body }: Request) { ... }

export function createAdminService() {
  return createAdminServiceClient(requestHandler);
}
```

Example using the generated client:
```typescript
import { createAdminService } from "@/services/index";

const adminService = createAdminService();

const handleLogin = async (username: string, password: string) => {
  try {
    const response = await adminService.Login({
      username: username,
      password: password,
    });
    console.log("Login successful:", response);
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```
