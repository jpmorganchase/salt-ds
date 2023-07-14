const axios = require('axios');

const query = `
  query($endCursor: String) {
    organization(login: "jpmorganchase") {
      repository(name: "salt-ds") {
        projectV2(number: 18) {
          items(first: 100, after: $endCursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              content{
                ...on Issue{
                  url
                }
              }
              
              fieldValues(first: 10) {
                nodes {
                  ...on ProjectV2ItemFieldDateValue {
                    date
                    field {
                      ...on ProjectV2Field {
                        name
                      }
                    }
                  }
                  ...on ProjectV2ItemFieldTextValue {
                    text
                    field {
                      ...on ProjectV2Field {
                        name
                      }
                    }
                  }
                  ...on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field {
                      ...on ProjectV2SingleSelectField {
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
  }
`;

const fetchGraphQLData = async () => {
  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query,
        variables: { endCursor: null },
      },
      {
        headers: {
          Authorization: 'Bearer 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', // Replace with your GitHub access token
        },
      }
    );

    const responseData = response.data;
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { fetchGraphQLData };
