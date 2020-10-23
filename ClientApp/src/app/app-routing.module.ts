import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@xforge-common/auth.guard';
import { ChangePasswordComponent } from '@xforge-common/change-password/change-password.component';
import { ProjectsComponent } from '@xforge-common/projects/projects.component';
import { SystemAdminGuard } from '@xforge-common/system-administration.guard';
import { SystemAdministrationComponent } from '@xforge-common/system-administration/system-administration.component';
import { ConnectProjectComponent } from './connect-project/connect-project.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { HomeComponent } from './home/home.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { RealtimeComponent } from './realtime/realtime.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'counter', component: CounterComponent, canActivate: [AuthGuard] },
  { path: 'fetch-data', component: FetchDataComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'connect-project', component: ConnectProjectComponent, canActivate: [AuthGuard] },
  { path: 'my-account', component: MyAccountComponent, canActivate: [AuthGuard] },
  { path: 'realtime', component: RealtimeComponent, canActivate: [AuthGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'system-administration', component: SystemAdministrationComponent, canActivate: [SystemAdminGuard] },
  { path: 'identity', loadChildren: '../identity/identity.module#IdentityModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
