// Zencrepes configuration for that entity
const entity = 'githubWatchers';
const config = {
  id: entity,
  name: 'Watchers',
  platform: 'github',
  active: true,
  facets: [
    {
      facetType: 'date',
      field: 'lastStarredAt',
      name: 'Last Starred',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'date',
      field: 'createdAt',
      name: 'Created',
      nullValue: 'EMPTY',
      default: false,
    },
    {
      facetType: 'term',
      field: 'login',
      name: 'User',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'dataType',
      name: 'Data Type',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repository.name.keyword',
      name: 'Watched Repository',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repository.owner.login',
      name: 'Watched Organization',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'organizations.edges.node.login',
      name: 'User Organization',
      nullValue: 'NO Organization',
      // Null Filter is a stringified object to be used when the user clicks on an _EMPTY_ bucket
      nullFilter:
        '{"op":"<=","content":{"field":"organizations.totalCount","value":0}}',
      default: true,
    },
    {
      facetType: 'term',
      field: 'company.keyword',
      name: 'User Company',
      nullValue: 'NOT DETAILED',
      nullFilter:
        '{"op":"in","content":{"field":"company.keyword","value":["__missing__"]}}',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isEmployee',
      name: 'GitHub Staff',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isHireable',
      name: 'Hireable',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isDeveloperProgramMember',
      name: 'Dev. Program',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isCampusExpert',
      name: 'Campus Exp.',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isBountyHunter',
      name: 'Bounty Hunter',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
  ],
  tableConfig: {
    itemsType: 'Github Watchers',
    defaultSortField: 'createdAt',
    columns: [
      {
        name: 'id',
        field: 'id',
        fieldType: 'string',
        sortField: 'id',
        sortable: false,
        default: false,
      },
      {
        name: 'Watched Org',
        field: 'repository.owner.login',
        fieldType: 'string',
        sortField: 'repository.owner.login.keyword',
        linkField: 'repository.owner.login.url',
        sortable: true,
        default: true,
      },
      {
        name: 'Watched Repo',
        field: 'repository.name',
        fieldType: 'string',
        sortField: 'repository.name.keyword',
        linkField: 'repository.url',
        sortable: true,
        default: true,
      },
      {
        name: 'Data Type',
        field: 'dataType',
        fieldType: 'string',
        sortField: 'dataType',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Created At',
        field: 'createdAt',
        fieldType: 'date',
        sortField: 'createdAt',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Last Starred At',
        field: 'lastStarredAt',
        fieldType: 'date',
        sortField: 'lastStarredAt',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'User Login',
        field: 'login',
        fieldType: 'string',
        sortField: 'login',
        linkField: 'url',
        sortable: true,
        default: true,
      },
      {
        name: 'User Company',
        field: 'company',
        fieldType: 'string',
        sortField: 'company.keyword',
        linkField: null,
        sortable: true,
        default: true,
      },

      {
        name: 'Url',
        field: 'repository.url',
        fieldType: 'link',
        sortField: null,
        linkField: null,
        sortable: false,
        default: false,
      },
    ],
  },
};

export default config;
