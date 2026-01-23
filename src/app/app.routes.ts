import { AddTaskComponent } from './pages/tasks/add-task/add-task.component';
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
import { DashboardComponent } from './pages/reports/dashboard/dashboard.component';
import { AllTasksComponent } from './pages/tasks/all-tasks/all-tasks.component';
import { SingleTaskComponent } from './pages/tasks/single-task/single-task.component';
import { authGuard } from './core/guards/auth.guard';
import { noauthGuard } from './core/guards/noauth.guard';
import { AllInternalTasksComponent } from './pages/internal-tasks/all-internal-tasks/all-internal-tasks.component';
import { AddInternalTaskComponent } from './pages/internal-tasks/add-internal-task/add-internal-task.component';
import { SingleInternalTaskComponent } from './pages/internal-tasks/single-internal-task/single-internal-task.component';
import { AllAttendenceComponent } from './pages/all-attendence/all-attendence.component';
import { AllAnnouncementsComponent } from './pages/announcements/all-announcements/all-announcements.component';
import { AddAnnouncementComponent } from './pages/announcements/add-announcement/add-announcement.component';
import { AllLeaveRequestsComponent } from './pages/leave-requests/all-leave-requests/all-leave-requests.component';
import { AllComplaintsComponent } from './pages/complaints/all-complaints/all-complaints.component';
import { AddComplaintComponent } from './pages/complaints/add-complaint/add-complaint.component';
import { KpisManagementComponent } from './pages/kpis/kpis-management/kpis-management.component';
import { roleGuard } from './core/guards/role.guard';
import { AccessDeniedComponent } from './shared/access-denied/access-denied.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { ResetPasswordComponent } from './pages/users/reset-password/reset-password.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { SubmitLeaveRequestComponent } from './pages/leave-requests/submit-leave-request/submit-leave-request.component';
import { MyKpisManagementComponent } from './pages/kpis/my-kpis-management/my-kpis-management.component';
import { ArchiveComponent } from './pages/tasks/archive/archive.component';
import { InternalArchiveComponent } from './pages/internal-tasks/internal-archive/internal-archive.component';
import { AllJdsComponent } from './pages/jds/all-jds/all-jds.component';
import { AddJdComponent } from './pages/jds/add-jd/add-jd.component';
import { SingleJdComponent } from './pages/jds/single-jd/single-jd.component';
import { UpdateProfileComponent } from './pages/users/update-profile/update-profile.component';
import { TaskDashboardComponent } from './pages/reports/task-dashboard/task-dashboard.component';
import { JdForEmpComponent } from './pages/jds/jd-for-emp/jd-for-emp.component';
import { TaskEmpReportComponent } from './pages/reports/task-emp-report/task-emp-report.component';
import { CreateInvitationComponent } from './pages/emp-invitations/create-invitation/create-invitation.component';
import { PendingInvitationsComponent } from './pages/emp-invitations/pending-invitations/pending-invitations.component';
import { CompleteInvitationComponent } from './pages/emp-invitations/complete-invitation/complete-invitation.component';
import { AttendanceReportComponent } from './pages/reports/attendance-report/attendance-report.component';
import { AllSalaryPeriodsComponent } from './pages/payroll/all-salary-periods/all-salary-periods.component';
import { AddSalaryPeriodComponent } from './pages/payroll/add-salary-period/add-salary-period.component';
import { SingleSalaryPeriodComponent } from './pages/payroll/single-salary-period/single-salary-period.component';
import { AllCurrenciesComponent } from './pages/currencies/all-currencies/all-currencies.component';
import { SingleCurrencyComponent } from './pages/currencies/single-currency/single-currency.component';
import { AllContractsComponent } from './pages/contract/all-contracts/all-contracts.component';
import { AddContractComponent } from './pages/contract/add-contract/add-contract.component';
import { single } from 'rxjs';
import { SingleContractComponent } from './pages/contract/single-contract/single-contract.component';
import { AllBranchesComponent } from './pages/branches/all-branches/all-branches.component';
import { AddBranchComponent } from './pages/branches/add-branch/add-branch.component';
import { SingleBranchComponent } from './pages/branches/single-branch/single-branch.component';
import { AllVaultsComponent } from './pages/vaults/all-vaults/all-vaults.component';
import { SingleVaultComponent } from './pages/vaults/single-vault/single-vault.component';
import { UnifiedVaultComponent } from './pages/vaults/unified-vault/unified-vault.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'users/add',
    component: AddUserComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin', 'AccountManager'] },
  },
  {
    path: 'users',
    component: AllUsersComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'users/:id',
    component: SingleUserComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'users/my-account/:id',
    component: MyAccountComponent,
    canActivate: [noauthGuard],
    children: [
      { path: 'attendance/:userId', component: AttendanceComponent },
      {
        path: 'leave-requests/:userId',
        component: SubmitLeaveRequestComponent,
      },
      { path: 'my-kpis/:userId', component: MyKpisManagementComponent },
      { path: 'profile/:userId', component: UpdateProfileComponent },
      { path: 'jd/:userId', component: JdForEmpComponent },
    ],
  },
  {
    path: 'services/add',
    component: AddServiceComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin', 'AccountManager'] },
  },
  {
    path: 'services',
    component: AllServicesComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'services/:id',
    component: SingleServiceComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'clients/add',
    component: AddClientComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin', 'AccountManager'] },
  },
  {
    path: 'clients',
    component: AllClientsComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'clients/:id',
    component: SingleClientComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'tasks',
    component: AllTasksComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'tasks/archive',
    component: ArchiveComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'tasks/add',
    component: AddTaskComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'tasks/:id',
    component: SingleTaskComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'internal-tasks',
    component: AllInternalTasksComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'internal-tasks/archive',
    component: InternalArchiveComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'internal-tasks/add',
    component: AddInternalTaskComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin', 'AccountManager'] },
  },
  {
    path: 'internal-tasks/:id',
    component: SingleInternalTaskComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'attendance',
    component: AllAttendenceComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'announcements',
    component: AllAnnouncementsComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'announcements/add',
    component: AddAnnouncementComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin', 'AccountManager'] },
  },
  {
    path: 'leave-requests',
    component: AllLeaveRequestsComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'complaints',
    component: AllComplaintsComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'complaints/add',
    component: AddComplaintComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'kpis-management',
    component: KpisManagementComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [noauthGuard],
    children: [
      // { path: 'task-report', component: TaskDashboardComponent },
      { path: 'task-emp-report', component: TaskEmpReportComponent },
      { path: 'attendance-report', component: AttendanceReportComponent },
    ],
  },
  {
    path: 'job-descriptions',
    component: AllJdsComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'job-descriptions/add',
    component: AddJdComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'job-descriptions/:id',
    component: SingleJdComponent,
    canActivate: [noauthGuard],
  },
  {
    path: 'employee-invitations/create',
    component: CreateInvitationComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'employee-invitations',
    component: PendingInvitationsComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'complete-invitation',
    component: CompleteInvitationComponent,
  },
  {
    path: 'payroll/periods',
    component: AllSalaryPeriodsComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] },
  },
  {
    path: 'payroll/periods/add',
    component: AddSalaryPeriodComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'payroll/periods/:id',
    component: SingleSalaryPeriodComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'currency',
    component: AllCurrenciesComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] },
  },
  {
    path: 'currency/:id',
    component: SingleCurrencyComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] },
  },
  {
    path: 'contracts',
    component: AllContractsComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'contracts/add',
    component: AddContractComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'contracts/:id',
    component: SingleContractComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'branches',
    component: AllBranchesComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'branches/add',
    component: AddBranchComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'branches/:id',
    component: SingleBranchComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'vaults',
    component: AllVaultsComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'vaults/:id',
    component: SingleVaultComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: 'vaults/unified/:currencyId',
    component: UnifiedVaultComponent,
    canActivate: [noauthGuard, roleGuard],
    data: { roles: ['Finance'] }
  },
  {
    path: '**',
    component: NotFoundComponent,
    canActivate: [noauthGuard],
  },
];
