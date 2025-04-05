import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import {NgIf} from '@angular/common';
import { NgFor } from '@angular/common';
import {Item} from '../item/item';
import {ItemService} from '../../item.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  allItems: Item[] = [];

  title = 'HandMadeShop';

  showPopup = false;
  itemName = '';
  itemDescription = '';


  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  submit() {
    const newItem : Item = {
      id: this.allItems.length + 1,
      title: this.itemName,
      description: this.itemDescription,
      availableUnits: 1
    }

    this.allItems.push(newItem)
    console.log("Item added with title: " , this.itemName)

    this.itemName = "";
    this.itemDescription = "";
    this.closePopup();
  }


}
