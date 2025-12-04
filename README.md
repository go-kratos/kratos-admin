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
