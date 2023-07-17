import axios from 'axios';

export default async function handler(req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) {
  try {
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
                  content {
                    ...on Issue {
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

    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query,
        variables: { endCursor: "null" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const responseData = response.data;
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
}
