# Kratos Admin Template

## Prerequisites
```
make init
```

## Generate API files
```
# Download and update dependencies
make init
# Generate API files (include: pb.go, http, grpc, validate, swagger) by proto file
make api
```

## Generate Web Client files
```
# Download and update dependencies
make init
# Generate client files (include: index.ts) by proto file
make web

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

