export const APP_ROUTES = {
  home: 'Home',
  login: 'Login',
  register: 'Register',
  forgotPassword: 'ForgotPassword',
  resetPassword: 'ResetPassword',
  dashboard: 'Dashboard',
  chats: 'Chats',
  chatRoom: 'ChatRoom',
  calls: 'Calls',
  callRoom: 'CallRoom',
  tasks: 'Tasks',
  calendar: 'Calendar',
  users: 'Users',
  groups: 'Groups',
  groupDetail: 'GroupDetail',
  contacts: 'Contacts',
  requests: 'Requests',
  profile: 'Profile',
  unauthorized: 'Unauthorized',
}

export const buildGroupDetailPath = (groupId) => `GroupDetail?groupId=${groupId}`
