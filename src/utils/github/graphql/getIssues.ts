const query = `
  query($repoId: ID!, $cursor: String, $increment: Int,) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    node(id: $repoId) {
      ... on Repository {
        issues(first: $increment, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
          totalCount
          edges {
          cursor
            node {
              id
              createdAt
              updatedAt
              closedAt
              databaseId
              number
              url
              title
              body
              state
              author {
                login
                avatarUrl
                url
              }
              repository {
                id
                name
                url
                databaseId
                owner {
                  id
                  login
                  url
                }
              }
              timelineItems(first: 30, itemTypes: [CROSS_REFERENCED_EVENT]) {
                totalCount
                edges {
                  node {
                    ... on CrossReferencedEvent {
                      id
                      createdAt
                      referencedAt
                      resourcePath
                      isCrossRepository
                      url
                      willCloseTarget
                      source {
                        ... on Issue {
                          __typename
                          id
                          number
                          title
                          state
                          url
                        }
                        ... on PullRequest {
                          __typename
                          id
                          number
                          title
                          state
                          url
                        }
                      }
                      target {
                        ... on Issue {
                          __typename
                          id
                          number
                          title
                          state
                          url
                        }
                        ... on PullRequest {
                          __typename
                          id
                          number
                          title
                          state
                          url
                        }
                      }
                    }
                  }
                }
              }
              labels (first: 10) {
                totalCount
                edges {
                  node {
                    id
                    color
                    name
                    description
                  }
                }
              }
              milestone {
                id
                createdAt
                updatedAt
                closedAt
                description
                dueOn
                issues (first: 1) {
                  totalCount
                }
                number
                state
                title
                url
              }
              assignees(first: 10) {
                totalCount
                edges {
                  node {
                    id
                    avatarUrl
                    login
                    name
                    url
                  }
                }
              }
              comments(first: 1) {
                totalCount
              }
              participants(first: 1) {
                totalCount
              }
              projectCards(first: 5) {
                totalCount
                edges {
                  node {
                    id
                    project {
                      id
                      url
                      name
                    }
                    column {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }            
    }
  }
`;
export default query;
