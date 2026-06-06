/** DTO para registro de usuario */
export interface RegisterUserDto {
  userName: string;
  fullName: string;
  email: string;
  password: string;
}

/** DTO para login */
export interface LoginRequestDto {
  userNameOrEmail: string;
  password: string;
}

/** Información del usuario autenticado */
export interface AuthUserDto {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  dateCreated: string;
}

/** Respuesta completa del login */
export interface LoginResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUserDto;
}

/** Sesión almacenada localmente */
export interface SessionState {
  token: string;
  user: AuthUserDto;
  expiresAt: number; // timestamp UTC ms
}
