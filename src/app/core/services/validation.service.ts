import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { ValidationResponse, ValidationSample } from '../models/api.models';
import { API_BASE_URL } from '../config/api.config';

@Service()
export class ValidationService {
  private readonly http = inject(HttpClient);

  validate(input: ValidationSample): Observable<ValidationSample> {
    return this.http
      .post<ValidationResponse>(`${API_BASE_URL}/testing/validation`, input)
      .pipe(map((response) => response.data));
  }
}
