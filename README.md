# Kratos Admin Template

## Install
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

## The generated clients work with any Promise-based HTTP client that returns JSON.
```typescript
import { createAuthClient } from "@/services/kratos/admin/v1/index";
import { request } from "@umijs/max";

type Request = {
  path: string;
  method: string;
  body: string | null;
};

function requestHandler({ path, method, body }: Request) {
  const headers: Record<string, string> = {};
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    headers["Content-Type"] = "application/json";
  }
  return request("/" + path, {
    method: method,
    data: body,
    headers: headers,
  });
}

export function createAuthService() {
  return createAuthClient(requestHandler);
}
```

## Example using the generated client
```typescript
import { createAuthService } from "@/services/index";

const authService = createAuthService();

const handleLogin = async (username: string, password: string) => {
  try {
    const response = await authService.login({
      username: username,
      password: password,
    });
    console.log("Login successful:", response);
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

