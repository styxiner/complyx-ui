export interface UserDTO {
  id:       string;
  username: string;
  email:    string;
  roles:    string[]; 
}

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