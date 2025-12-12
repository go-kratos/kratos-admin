package auth

import (
	"os"
	"time"
)

// authSecretFromEnv retrieves the authentication secret from the environment variable.
func authSecretFromEnv(key string) string {
	if secret := os.Getenv(key); secret != "" {
		return secret
	}
	return time.Now().Format("20060102150405")
}

// cookieNameFromEnv retrieves the cookie name from the environment variable.
func cookieNameFromEnv(key string) string {
	if name := os.Getenv(key); name != "" {
		return name
	}
	return "access_token"
}
