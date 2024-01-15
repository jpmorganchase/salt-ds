require("dotenv").config();
import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const org = "jpmorganchase";
    const repo = "salt-ds";

    const query = `
      query($org: String!, $repo: String!, $endCursor: String) {
        organization(login: $org) {
          repository(name: $repo) {
            projectV2(number: 18) {
              items(first: 100, after: $endCursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  content {
                    ...on Issue {
                      url
                    }
                  }
                  fieldValues(first: 20) {
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
                      ... on ProjectV2ItemFieldIterationValue {
                        title
                        startDate
                        duration
                        field {
                          ... on ProjectV2IterationField {
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

    let hasNextPage = true;
    let endCursor = "null";
    const allProjectItems = [];

    while (hasNextPage) {
      const response = await fetch(`${process.env.GRAPH_QL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          query,
          variables: { org, repo, endCursor },
        }),
      });

      const responseData = await response.json();
      const projectItems =
        responseData.data.organization.repository.projectV2.items;

      hasNextPage = projectItems.pageInfo.hasNextPage;
      endCursor = projectItems.pageInfo.endCursor;

      allProjectItems.push(...projectItems.nodes);
    }

    const response = { nodes: allProjectItems };
    console.log("Requested GitHub API", { allProjectItems });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Error fetching data" });
  }
};

export default handler;
