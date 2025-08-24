import { Routes } from '@angular/router';
import { AddServiceComponent } from './pages/services/add-service/add-service.component';
import { AllServicesComponent } from './pages/services/all-services/all-services.component';
import { LoginComponent } from './pages/users/login/login.component';
import { AddUserComponent } from './pages/users/add-user/add-user.component';
import { AllUsersComponent } from './pages/users/all-users/all-users.component';
import { SingleUserComponent } from './pages/users/single-user/single-user.component';
import { SingleServiceComponent } from './pages/services/single-service/single-service.component';
import { AddClientComponent } from './pages/clients/add-client/add-client.component';
import { AllClientsComponent } from './pages/clients/all-clients/all-clients.component';
import { SingleClientComponent } from './pages/clients/single-client/single-client.component';
import { MyAccountComponent } from './pages/users/my-account/my-account.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AllTasksComponent } from './pages/tasks/all-tasks/all-tasks.component';
import { SingleTaskComponent } from './pages/tasks/single-task/single-task.component';
import { authGuard } from './core/guards/auth.guard';
import { noauthGuard } from './core/guards/noauth.guard';
import { AllInternalTasksComponent } from './pages/internal-tasks/all-internal-tasks/all-internal-tasks.component';
import { AddInternalTaskComponent } from './pages/internal-tasks/add-internal-task/add-internal-task.component';
import { SingleInternalTaskComponent } from './pages/internal-tasks/single-internal-task/single-internal-task.component';

export const routes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [authGuard]
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'users/add',
        component: AddUserComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'users',
        component: AllUsersComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'users/:id',
        component: SingleUserComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'users/my-account/:id',
        component: MyAccountComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'services/add',
        component: AddServiceComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'services',
        component: AllServicesComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'services/:id',
        component: SingleServiceComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'clients/add',
        component: AddClientComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'clients',
        component: AllClientsComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'clients/:id',
        component: SingleClientComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'tasks',
        component: AllTasksComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'tasks/:id',
        component: SingleTaskComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'internal-tasks',
        component: AllInternalTasksComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'internal-tasks/add',
        component: AddInternalTaskComponent,
        canActivate: [noauthGuard]
    },
    {
        path: 'internal-tasks/:id',
        component: SingleInternalTaskComponent,
        canActivate: [noauthGuard]
    }
];
