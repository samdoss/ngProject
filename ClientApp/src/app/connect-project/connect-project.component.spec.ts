import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatCardModule,
  MatCheckboxModule,
  MatOptionModule,
  MatProgressBarModule,
  MatSelectModule
} from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { defer, of } from 'rxjs';
import { anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { ParatextProject } from '../core/models/paratext-project';
import { SFProject } from '../core/models/sfproject';
import { SFProjectUser } from '../core/models/sfproject-user';
import { SyncJob } from '../core/models/sync-job';
import { ParatextService } from '../core/paratext.service';
import { SFProjectUserService } from '../core/sfproject-user.service';
import { SFProjectService } from '../core/sfproject.service';
import { SFUserService } from '../core/sfuser.service';
import { SyncJobService } from '../core/sync-job.service';
import { ConnectProjectComponent } from './connect-project.component';

class TestEnvironment {
  component: ConnectProjectComponent;
  fixture: ComponentFixture<ConnectProjectComponent>;

  mockedParatextService: ParatextService;
  mockedRouter: Router;
  mockedSyncJobService: SyncJobService;
  mockedSFProjectUserService: SFProjectUserService;
  mockedSFProjectService: SFProjectService;
  mockedSFUserService: SFUserService;

  constructor() {
    this.mockedParatextService = mock(ParatextService);
    this.mockedRouter = mock(Router);
    this.mockedSyncJobService = mock(SyncJobService);
    this.mockedSFProjectUserService = mock(SFProjectUserService);
    this.mockedSFProjectService = mock(SFProjectService);
    this.mockedSFUserService = mock(SFUserService);

    when(this.mockedSyncJobService.start(anyString())).thenResolve('job01');
    const a = new SyncJob({
      id: 'job01',
      percentCompleted: 0,
      state: 'PENDING'
    });
    const b = new SyncJob(a);
    b.state = 'SYNCING';
    const c = new SyncJob(b);
    c.percentCompleted = 0.5;
    const d = new SyncJob(c);
    d.percentCompleted = 1.0;
    d.state = 'IDLE';
    when(this.mockedSyncJobService.listen('job01')).thenReturn(cold('-a-b-c-d|', { a, b, c, d }));
    when(this.mockedSFProjectUserService.onlineCreate(anything(), anything())).thenResolve(
      new SFProjectUser({ id: 'projectuser01' })
    );
    when(this.mockedSFProjectService.onlineCreate(anything())).thenResolve(new SFProject({ id: 'project01' }));
    when(this.mockedSFUserService.currentUserId).thenReturn('user01');

    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatCheckboxModule,
        MatOptionModule,
        MatProgressBarModule,
        MatSelectModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      declarations: [ConnectProjectComponent],
      providers: [
        { provide: ParatextService, useFactory: () => instance(this.mockedParatextService) },
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        { provide: SyncJobService, useFactory: () => instance(this.mockedSyncJobService) },
        { provide: SFProjectUserService, useFactory: () => instance(this.mockedSFProjectUserService) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: SFUserService, useFactory: () => instance(this.mockedSFUserService) }
      ]
    });
    this.fixture = TestBed.createComponent(ConnectProjectComponent);
    this.component = this.fixture.componentInstance;
  }

  get loadingDiv(): DebugElement {
    return this.fixture.debugElement.query(By.css('#loading'));
  }

  get loginButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.login-button'));
  }

  get projectSelect(): DebugElement {
    return this.fixture.debugElement.query(By.css('mat-select[formControlName="project"]'));
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.submit-button'));
  }

  get connectProjectForm(): DebugElement {
    return this.fixture.debugElement.query(By.css('form'));
  }

  get tasksDiv(): DebugElement {
    return this.fixture.debugElement.query(By.css('div[formGroupName="tasks"'));
  }

  get translateCheckbox(): DebugElement {
    return this.tasksDiv.query(By.css('mat-checkbox[formControlName="translate"'));
  }

  get sourceProjectSelect(): DebugElement {
    return this.tasksDiv.query(By.css('mat-select[formControlName="sourceProject"]'));
  }

  changeSelectValue(select: DebugElement, option: number): void {
    select.nativeElement.click();
    this.fixture.detectChanges();
    flush();
    const options = select.queryAll(By.css('mat-option'));
    options[option].nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

  clickCheckbox(checkbox: DebugElement): void {
    checkbox.nativeElement.querySelector('input').click();
    this.fixture.detectChanges();
    flush();
  }

  clickSubmitButton(): void {
    this.clickButton(this.submitButton);
  }

  private clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }
}

describe('ConnectProjectComponent', () => {
  it('should display login button when PT projects is null', () => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(of(null));
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('login');
    expect(env.loginButton).not.toBeNull();
  });

  it('should display form when PT projects is empty', () => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(of([]));
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('input');
    expect(env.connectProjectForm).not.toBeNull();
  });

  it('should do nothing when form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(of([]));
    env.fixture.detectChanges();

    env.clickSubmitButton();

    verify(env.mockedSFProjectService.onlineCreate(anything())).never();
    verify(env.mockedSFProjectUserService.onlineCreate(anything(), anything())).never();
    verify(env.mockedRouter.navigate(deepEqual(['/home']))).never();
    expect().nothing();
  }));

  it('should display loading when getting PT projects', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(defer(() => Promise.resolve([])));
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('loading');
    expect(env.loadingDiv).not.toBeNull();

    flush();
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('input');
    expect(env.connectProjectForm).not.toBeNull();
  }));

  it('should join when existing project is selected', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(
      of<ParatextProject[]>([
        {
          paratextId: 'pt01',
          name: 'Target',
          languageTag: 'en',
          languageName: 'English',
          projectId: 'project01',
          isConnectable: true
        }
      ])
    );
    env.fixture.detectChanges();
    expect(env.component.state).toEqual('input');

    env.changeSelectValue(env.projectSelect, 0);

    expect(env.tasksDiv).toBeNull();

    env.clickSubmitButton();

    verify(env.mockedSFProjectUserService.onlineCreate('project01', 'user01')).once();

    verify(env.mockedRouter.navigate(deepEqual(['/home']))).once();
  }));

  it('should create when non-existent project is selected', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(
      of<ParatextProject[]>([
        {
          paratextId: 'pt01',
          name: 'Target',
          languageTag: 'en',
          languageName: 'English',
          isConnectable: true
        },
        {
          paratextId: 'pt02',
          name: 'Source',
          languageTag: 'es',
          languageName: 'Spanish',
          isConnectable: false
        }
      ])
    );
    env.fixture.detectChanges();
    expect(env.component.state).toEqual('input');

    env.changeSelectValue(env.projectSelect, 0);
    env.clickCheckbox(env.translateCheckbox);
    env.changeSelectValue(env.sourceProjectSelect, 0);

    env.clickSubmitButton();
    getTestScheduler().flush();

    expect(env.component.state).toEqual('connecting');

    const project = new SFProject({
      projectName: 'Target',
      paratextId: 'pt01',
      inputSystem: {
        tag: 'en',
        languageName: 'English',
        abbreviation: 'en',
        isRightToLeft: false
      },
      checkingConfig: {
        enabled: true
      },
      translateConfig: {
        enabled: true,
        sourceParatextId: 'pt02',
        sourceInputSystem: {
          languageName: 'Spanish',
          tag: 'es',
          isRightToLeft: false,
          abbreviation: 'es'
        }
      }
    });
    verify(env.mockedSFProjectService.onlineCreate(deepEqual(project))).once();

    verify(env.mockedSFProjectUserService.onlineCreate('project01', 'user01')).once();

    verify(env.mockedRouter.navigate(deepEqual(['/home']))).once();
  }));
});
