import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from './components/item/item'; // adjust path if needed
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private apiUrl = 'http://localhost:3000/items'; // your backend URL

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  addItem(item: Item): Observable<any> {
    return this.http.post(this.apiUrl, item);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
