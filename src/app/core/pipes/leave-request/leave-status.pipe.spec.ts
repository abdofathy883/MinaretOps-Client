import { LeaveStatusPipe } from './leave-status.pipe';

describe('LeaveStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new LeaveStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
