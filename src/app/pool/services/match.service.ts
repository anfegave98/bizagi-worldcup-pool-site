import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatchDto } from '../models/pool.models';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly api = `${environment.apiUrl}/matches`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(this.api);
  }
}
