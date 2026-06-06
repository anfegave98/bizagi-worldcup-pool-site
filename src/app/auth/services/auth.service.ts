import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthUserDto, LoginRequestDto, LoginResponseDto,
  RegisterUserDto, SessionState
} from '../models/auth.models';
import { EncryptionUtil } from '../../shared/utils/encryption.util';

const SESSION_KEY = 'wcp_session';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly api = `${environment.apiUrl}/auth`;

  // ─── State (Signals) ──────────────────────────────────────────────────────
  private readonly _session = signal<SessionState | null>(this.loadSession());

  readonly currentUser = computed(() => this._session()?.user ?? null);
  readonly isLoggedIn  = computed(() => {
    const s = this._session();
    return !!s && Date.now() < s.expiresAt;
  });
  readonly isAdmin = computed(() =>
    this.currentUser()?.roles?.includes('Admin') ?? false
  );
  readonly token = computed(() => this._session()?.token ?? null);

  constructor(private http: HttpClient) {}

  // ─── API calls ────────────────────────────────────────────────────────────

  /**
   * Registra un nuevo usuario.
   * El body completo viaja cifrado: { data: "<AES Base64>" }
   * El backend (DecryptionMiddleware) lo descifra antes de procesarlo.
   */
  register(dto: RegisterUserDto): Observable<AuthUserDto> {
    return this.http.post<AuthUserDto>(
      `${this.api}/register`,
      EncryptionUtil.encryptBody(dto)   // ← body cifrado completo
    );
  }

  /**
   * Autentica al usuario.
   * El body completo viaja cifrado: { data: "<AES Base64>" }
   * El backend (DecryptionMiddleware) lo descifra antes de procesarlo.
   */
  login(dto: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(
      `${this.api}/login`,
      EncryptionUtil.encryptBody(dto)   // ← body cifrado completo
    ).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this._session.set(null);
  }

  // ─── Session helpers ──────────────────────────────────────────────────────

  private saveSession(res: LoginResponseDto): void {
    const session: SessionState = {
      token:     res.accessToken,
      user:      res.user,
      expiresAt: Date.now() + res.expiresIn * 1000,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this._session.set(session);
  }

  private loadSession(): SessionState | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: SessionState = JSON.parse(raw);
      if (Date.now() >= session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
