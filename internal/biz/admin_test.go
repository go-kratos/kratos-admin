package biz

import (
	"context"
	"testing"

	"github.com/go-kratos/kratos/v3/errors"
	"golang.org/x/crypto/bcrypt"
)

// fakeAdminRepo is an in-memory AdminRepo for testing the usecase in
// isolation from the data layer.
type fakeAdminRepo struct {
	byName  map[string]*Admin
	byEmail map[string]*Admin
	created []*Admin
}

func newFakeAdminRepo() *fakeAdminRepo {
	return &fakeAdminRepo{
		byName:  make(map[string]*Admin),
		byEmail: make(map[string]*Admin),
	}
}

func (r *fakeAdminRepo) FindByID(context.Context, int64) (*Admin, error) {
	return nil, ErrAdminNotFound
}

func (r *fakeAdminRepo) FindByName(_ context.Context, name string) (*Admin, error) {
	a, ok := r.byName[name]
	if !ok {
		return nil, ErrAdminNotFound
	}
	return a, nil
}

func (r *fakeAdminRepo) FindByEmail(_ context.Context, email string) (*Admin, error) {
	a, ok := r.byEmail[email]
	if !ok {
		return nil, ErrAdminNotFound
	}
	return a, nil
}

func (r *fakeAdminRepo) ListAdmins(context.Context, ...ListOption) ([]*Admin, error) {
	return nil, nil
}

func (r *fakeAdminRepo) CreateAdmin(_ context.Context, a *Admin) (*Admin, error) {
	r.created = append(r.created, a)
	return a, nil
}

func (r *fakeAdminRepo) UpdateAdmin(_ context.Context, a *Admin) (*Admin, error) {
	return a, nil
}

func (r *fakeAdminRepo) DeleteAdmin(context.Context, int64) error {
	return nil
}

// seedAdmin inserts an admin with a bcrypt-hashed password.
func seedAdmin(t *testing.T, repo *fakeAdminRepo, name, email, password string) *Admin {
	t.Helper()
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	a := &Admin{ID: 1, Name: name, Email: email, Password: string(hashed)}
	repo.byName[name] = a
	repo.byEmail[email] = a
	return a
}

func TestLoginByUsername_Success(t *testing.T) {
	repo := newFakeAdminRepo()
	seedAdmin(t, repo, "admin", "admin@example.com", "admin")
	uc := NewAdminUsecase(repo)

	got, err := uc.LoginByUsername(context.Background(), "admin", "admin")
	if err != nil {
		t.Fatalf("expected login success, got error: %v", err)
	}
	if got.Name != "admin" {
		t.Fatalf("expected admin user, got %q", got.Name)
	}
}

func TestLoginByEmail_Success(t *testing.T) {
	repo := newFakeAdminRepo()
	seedAdmin(t, repo, "admin", "admin@example.com", "admin")
	uc := NewAdminUsecase(repo)

	got, err := uc.LoginByEmail(context.Background(), "admin@example.com", "admin")
	if err != nil {
		t.Fatalf("expected login success, got error: %v", err)
	}
	if got.Email != "admin@example.com" {
		t.Fatalf("expected admin user, got %q", got.Email)
	}
}

func TestLoginByUsername_WrongPassword(t *testing.T) {
	repo := newFakeAdminRepo()
	seedAdmin(t, repo, "admin", "admin@example.com", "admin")
	uc := NewAdminUsecase(repo)

	_, err := uc.LoginByUsername(context.Background(), "admin", "wrong")
	if err == nil {
		t.Fatal("expected error for wrong password, got nil")
	}
	if errors.Code(err) != 401 {
		t.Fatalf("expected 401 unauthorized, got code %d (%v)", errors.Code(err), err)
	}
}

func TestLoginByUsername_UserNotFound(t *testing.T) {
	repo := newFakeAdminRepo()
	uc := NewAdminUsecase(repo)

	_, err := uc.LoginByUsername(context.Background(), "ghost", "admin")
	if err == nil {
		t.Fatal("expected error for unknown user, got nil")
	}
	// Must be the same opaque 401 as a wrong password, to avoid user enumeration.
	if errors.Code(err) != 401 {
		t.Fatalf("expected 401 unauthorized, got code %d (%v)", errors.Code(err), err)
	}
	if errors.Is(err, ErrAdminNotFound) {
		t.Fatal("login must not leak ErrAdminNotFound for unknown users")
	}
}

func TestCreateAdmin_HashesPassword(t *testing.T) {
	repo := newFakeAdminRepo()
	uc := NewAdminUsecase(repo)

	_, err := uc.CreateAdmin(context.Background(), &Admin{Name: "bob", Password: "secret"})
	if err != nil {
		t.Fatalf("create admin: %v", err)
	}
	if len(repo.created) != 1 {
		t.Fatalf("expected 1 created admin, got %d", len(repo.created))
	}
	stored := repo.created[0].Password
	if stored == "secret" {
		t.Fatal("password was stored in plaintext")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(stored), []byte("secret")); err != nil {
		t.Fatalf("stored password is not a valid bcrypt hash of the input: %v", err)
	}
}

func TestUpdateAdmin_EmptyPasswordLeftUnchanged(t *testing.T) {
	repo := newFakeAdminRepo()
	uc := NewAdminUsecase(repo)

	got, err := uc.UpdateAdmin(context.Background(), &Admin{ID: 1, Name: "bob", Password: ""})
	if err != nil {
		t.Fatalf("update admin: %v", err)
	}
	if got.Password != "" {
		t.Fatalf("empty password must be passed through unchanged, got %q", got.Password)
	}
}
