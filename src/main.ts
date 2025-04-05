import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/components/appcomponent/app.component';
import {provideHttpClient} from '@angular/common/http';

bootstrapApplication(AppComponent,{
  providers:[provideHttpClient()]
} )
