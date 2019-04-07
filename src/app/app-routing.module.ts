import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { HomeComponent } from './home/home.component';
import { VisualizeComponent } from './visualize/visualize.component'
// import { DimensionReductionComponent } from './dimension-reduction/dimension-reduction.component'
// import { AnimationComponent } from './animation/animation.component'
// import { ContactComponent } from './contact/contact.component'

const routes: Routes = [
  {path: '', redirectTo: '/visualize', pathMatch: 'full'},
  {path: 'visualize', component: VisualizeComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
