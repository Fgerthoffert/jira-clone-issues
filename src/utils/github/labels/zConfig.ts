// Zencrepes configuration for that entity
const entity = 'githubLabels';
const config = {
  id: entity,
  name: 'Labels',
  platform: 'github',
  active: true,
  facets: [
    {
      facetType: 'date',
      field: 'createdAt',
      name: 'Created',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'date',
      field: 'updatedAt',
      name: 'Updated',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'boolean',
      field: 'isDefault',
      name: 'Default',
      nullValue: 'EMPTY',
      nullFilter: '',
      default: true,
    },
    {
      facetType: 'term',
      field: 'name.keyword',
      name: 'Name',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'color',
      name: 'Color',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repository.name.keyword',
      name: 'Repository',
      nullValue: 'EMPTY',
      default: true,
    },
    {
      facetType: 'term',
      field: 'repository.owner.login',
      name: 'Organization',
      nullValue: 'EMPTY',
      default: true,
    },
  ],
  tableConfig: {
    itemsType: 'Github Labels',
    defaultSortField: 'name.keyword',
    columns: [
      {
        name: 'id',
        field: 'id',
        sortField: 'id',
        sortable: false,
        default: false,
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
        name: 'Repository',
        field: 'repository.name',
        sortField: 'repository.name.keyword',
        linkField: 'repository.url',
        sortable: true,
        default: true,
      },
      {
        name: 'Organization',
        field: 'repository.owner.login',
        sortField: 'repository.owner.login.keyword',
        linkField: 'repository.owner.url',
        sortable: true,
        default: true,
      },
      {
        name: 'Name',
        field: 'name',
        sortField: 'name.keyword',
        linkField: 'url',
        sortable: true,
        default: true,
      },
      {
        name: 'Color',
        field: 'color',
        fieldType: 'color',
        sortField: 'color',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Description',
        field: 'description',
        sortField: 'description.keyword',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Issues Count',
        field: 'issues.totalCount',
        sortField: 'issues.totalCount',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'pullRequests Count',
        field: 'pullRequests.totalCount',
        sortField: 'pullRequests.totalCount',
        linkField: null,
        sortable: true,
        default: true,
      },
      {
        name: 'Url',
        field: 'url',
        sortField: 'url',
        linkField: null,
        sortable: false,
        default: false,
      },
    ],
  },
};

export default config;
