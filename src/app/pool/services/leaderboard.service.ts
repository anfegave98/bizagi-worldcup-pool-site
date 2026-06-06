import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaderboardItemDto, UserPredictionHistoryDto } from '../models/pool.models';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly api = `${environment.apiUrl}/leaderboard`;

  constructor(private http: HttpClient) {}

  get(): Observable<LeaderboardItemDto[]> {
    return this.http.get<LeaderboardItemDto[]>(this.api);
  }

  getUserHistory(userId: number): Observable<UserPredictionHistoryDto[]> {
    return this.http.get<UserPredictionHistoryDto[]>(`${this.api}/${userId}/history`);
  }
}
