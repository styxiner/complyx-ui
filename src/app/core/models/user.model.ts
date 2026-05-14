export interface UserDTO {
  id:       string;
  username: string;
  email:    string;
  roles:    string[];  // ← era "role", el backend envía "roles"
}

// Modelos auxiliares que necesita AuthService
export interface LoginDTO {
  username: string;
  password: string;
}

export interface TokenResponseDTO {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;
}

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface CurrentUser {
  id:       string;
  username: string;
  email:    string;
  roles:    string[];
}