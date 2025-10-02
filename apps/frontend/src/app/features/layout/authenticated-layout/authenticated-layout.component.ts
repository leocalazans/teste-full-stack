import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';

[RouterOutlet, NgFor]
@Component({
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.css'
})
export class AuthenticatedLayoutComponent {

}
