const defaultConfig = {
  source: {
    host: 'https://jira.domain.com/',
    username: 'USERNAME',
    password: 'PASSWORD',
    projectKey: 'DMF',
    fetch: {
      maxNodes: 30,
    },    
  },
  destination: {
    host: 'https://jira.domain.com/',
    username: 'USERNAME',
    password: 'PASSWORD',
    projectKey: 'DMF',
    fetch: {
      maxNodes: 30,
    },
    defaultIssueType: 'Task',
    fields: {
      syncSourceUpdatedAt: 'customfield_10314'
    }
  },
  issueTypes: [{
    source: 'Bug',
    destination: 'Task',
  }],
  status: [{
    source: 'OPEN',
    destination: 'OPEN',
  }],
  fields: [{
    source: 'Custom-field-source',
    destination: 'Custom-field-destination'
  }],
};

export default defaultConfig;
