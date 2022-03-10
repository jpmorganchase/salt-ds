import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text, H1, H2, H3, H4, P, Span, Div } from "@brandname/lab";
import "./WholePage.css";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

const WholePageComponent: ComponentStory<typeof Text> = (props) => {
  return (
    <>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8%",
          padding: 20,
        }}
      >
        {/* Extra Bold */}
        <section>
          <section id="overview">
            <H1>
              H1 Master Detail (bold){" "}
              <span className="extra-bold">(extra bold)</span>
            </H1>
            <P>
              When a user selects an item from a master list in the first pane,
              the details populate in the second pane.
            </P>
            <P>The master-detail pattern works well when:</P>
            <ul>
              <li>
                <Span>
                  The user needs to see more details about each item in a list,
                  e.g., email, contacts or messaging applications.
                </Span>
              </li>
              <li>
                <Span>
                  A large list of items with many attributes needs to be
                  displayed in a grid format and you need to expose additional
                  information that can't be displayed in the grid, e.g., a list
                  of trades, transactions, events or errors that have occurred
                  in the application.
                </Span>
              </li>
              <li>
                <Span>
                  Users need to switch between a number of items while
                  maintaining a view of the complete list while they do so,
                  e.g., email applications or news articles.
                </Span>
              </li>
            </ul>
          </section>
          <section>
            <H2>
              H2 Structure (semi-bold)-{" "}
              <span className="extra-bold">(extra bold)</span>
            </H2>
            <P>
              The master-detail pattern can be orientated vertically or
              horizontally.
            </P>
            <div>
              <div>
                <H3>
                  H3 Vertical (compact) (semi-bold) -{" "}
                  <span className="extra-bold">(extra bold)</span>
                </H3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      The side panel contains a <strong>list of items</strong>.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Text or summary information is displayed in tile-like
                      containers.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The narrow master pane format lends itself to summary
                      information.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The user does not need to manipulate the list of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for contacts, email, messaging and newsreader
                      applications.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div>
                <H4>
                  H4 Vertical (wide) (semi-bold) -{" "}
                  <span className="extra-bold">(extra bold)</span>
                </H4>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      This is useful for a <strong>grid</strong> of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The master pane utilizes most of the real estate.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The wider format allows users to view columns that can be
                      sorted, rearranged and otherwise manipulated while viewing
                      additional detail in the side panel.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for trade- and event-monitoring applications,
                      and data analysis.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </section>
        {/* Regular */}
        <section>
          <section id="overview">
            <H1>
              H1 Master Detail - <span className="medium">(medium)</span>
            </H1>
            <P>
              When a user selects an item from a master list in the first pane,
              the details populate in the second pane.
            </P>
            <P>The master-detail pattern works well when:</P>
            <ul>
              <li>
                <Span>
                  The user needs to see more details about each item in a list,
                  e.g., email, contacts or messaging applications.
                </Span>
              </li>
              <li>
                <Span>
                  A large list of items with many attributes needs to be
                  displayed in a grid format and you need to expose additional
                  information that can't be displayed in the grid, e.g., a list
                  of trades, transactions, events or errors that have occurred
                  in the application.
                </Span>
              </li>
              <li>
                <Span>
                  Users need to switch between a number of items while
                  maintaining a view of the complete list while they do so,
                  e.g., email applications or news articles.
                </Span>
              </li>
            </ul>
          </section>
          <section>
            <H2>
              H2 Structure - <span className="regular">(regular)</span>
            </H2>
            <P>
              The master-detail pattern can be orientated vertically or
              horizontally.
            </P>
            <div>
              <div>
                <H3>
                  H3 Vertical (compact) -{" "}
                  <span className="regular">(regular)</span>
                </H3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      The side panel contains a <strong>list of items</strong>.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Text or summary information is displayed in tile-like
                      containers.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The narrow master pane format lends itself to summary
                      information.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The user does not need to manipulate the list of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for contacts, email, messaging and newsreader
                      applications.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div>
                <H4>
                  H4 Vertical (wide) -{" "}
                  <span className="regular">(regular)</span>
                </H4>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      This is useful for a <strong>grid</strong> of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The master pane utilizes most of the real estate.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The wider format allows users to view columns that can be
                      sorted, rearranged and otherwise manipulated while viewing
                      additional detail in the side panel.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for trade- and event-monitoring applications,
                      and data analysis.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </section>

        {/* Bold */}
        <section>
          <section id="overview">
            <H1>
              H1 Master Detail -{" "}
              <span className="extra-bold">(extra bold)</span>
            </H1>
            <P>
              When a user selects an item from a master list in the first pane,
              the details populate in the second pane.
            </P>
            <P>The master-detail pattern works well when:</P>
            <ul>
              <li>
                <Span>
                  The user needs to see more details about each item in a list,
                  e.g., email, contacts or messaging applications.
                </Span>
              </li>
              <li>
                <Span>
                  A large list of items with many attributes needs to be
                  displayed in a grid format and you need to expose additional
                  information that can't be displayed in the grid, e.g., a list
                  of trades, transactions, events or errors that have occurred
                  in the application.
                </Span>
              </li>
              <li>
                <Span>
                  Users need to switch between a number of items while
                  maintaining a view of the complete list while they do so,
                  e.g., email applications or news articles.
                </Span>
              </li>
            </ul>
          </section>
          <section>
            <H2>
              H2 Structure (semi-bold) - <span className="bold">(bold)</span>
            </H2>
            <P>
              The master-detail pattern can be orientated vertically or
              horizontally.
            </P>
            <div>
              <div>
                <H3>
                  H3 Vertical (compact) (semi-bold) -{" "}
                  <span className="bold">(bold)</span>
                </H3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      The side panel contains a <strong>list of items</strong>.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Text or summary information is displayed in tile-like
                      containers.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The narrow master pane format lends itself to summary
                      information.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The user does not need to manipulate the list of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for contacts, email, messaging and newsreader
                      applications.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div>
                <H4>
                  H4 Vertical (wide) (semi-bold) -{" "}
                  <span className="bold">(bold)</span>
                </H4>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      This is useful for a <strong>grid</strong> of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The master pane utilizes most of the real estate.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The wider format allows users to view columns that can be
                      sorted, rearranged and otherwise manipulated while viewing
                      additional detail in the side panel.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for trade- and event-monitoring applications,
                      and data analysis.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </section>
        {/* Medium */}
        <section>
          <section id="overview">
            <H1>
              H1 Master Detail - <span className="semi-bold">(semi bold)</span>
            </H1>
            <P>
              When a user selects an item from a master list in the first pane,
              the details populate in the second pane.
            </P>
            <P>The master-detail pattern works well when:</P>
            <ul>
              <li>
                <Span>
                  The user needs to see more details about each item in a list,
                  e.g., email, contacts or messaging applications.
                </Span>
              </li>
              <li>
                <Span>
                  A large list of items with many attributes needs to be
                  displayed in a grid format and you need to expose additional
                  information that can't be displayed in the grid, e.g., a list
                  of trades, transactions, events or errors that have occurred
                  in the application.
                </Span>
              </li>
              <li>
                <Span>
                  Users need to switch between a number of items while
                  maintaining a view of the complete list while they do so,
                  e.g., email applications or news articles.
                </Span>
              </li>
            </ul>
          </section>
          <section>
            <H2>
              H2 Structure - <span className="medium">(medium)</span>
            </H2>
            <P>
              The master-detail pattern can be orientated vertically or
              horizontally.
            </P>
            <div>
              <div>
                <H3>
                  H3 Vertical (compact) -{" "}
                  <span className="medium">(medium)</span>
                </H3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      The side panel contains a <strong>list of items</strong>.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Text or summary information is displayed in tile-like
                      containers.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The narrow master pane format lends itself to summary
                      information.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The user does not need to manipulate the list of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for contacts, email, messaging and newsreader
                      applications.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div>
                <H4>
                  H4 Vertical (wide) - <span className="medium">(medium)</span>
                </H4>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      This is useful for a <strong>grid</strong> of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The master pane utilizes most of the real estate.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The wider format allows users to view columns that can be
                      sorted, rearranged and otherwise manipulated while viewing
                      additional detail in the side panel.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for trade- and event-monitoring applications,
                      and data analysis.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </section>

        {/* Extra Bold */}
        <section>
          <section id="overview">
            <H1>
              H1 Master Detail (bold){" "}
              <span className="extra-bold">(extra bold)</span>
            </H1>
            <P>
              When a user selects an item from a master list in the first pane,
              the details populate in the second pane.
            </P>
            <P>The master-detail pattern works well when:</P>
            <ul>
              <li>
                <Span>
                  The user needs to see more details about each item in a list,
                  e.g., email, contacts or messaging applications.
                </Span>
              </li>
              <li>
                <Span>
                  A large list of items with many attributes needs to be
                  displayed in a grid format and you need to expose additional
                  information that can't be displayed in the grid, e.g., a list
                  of trades, transactions, events or errors that have occurred
                  in the application.
                </Span>
              </li>
              <li>
                <Span>
                  Users need to switch between a number of items while
                  maintaining a view of the complete list while they do so,
                  e.g., email applications or news articles.
                </Span>
              </li>
            </ul>
          </section>
          <section>
            <H2>
              H2 Structure (semi-bold)-{" "}
              <span className="extra-bold">(extra bold)</span>
            </H2>
            <P>
              The master-detail pattern can be orientated vertically or
              horizontally.
            </P>
            <div>
              <div>
                <H3>
                  H3 Vertical (compact) (semi-bold) -{" "}
                  <span className="extra-bold">(extra bold)</span>
                </H3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      The side panel contains a <strong>list of items</strong>.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Text or summary information is displayed in tile-like
                      containers.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The narrow master pane format lends itself to summary
                      information.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The user does not need to manipulate the list of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for contacts, email, messaging and newsreader
                      applications.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div>
                <H4>
                  H4 Vertical (wide) (semi-bold) -{" "}
                  <span className="extra-bold">(extra bold)</span>
                </H4>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      This is useful for a <strong>grid</strong> of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The master pane utilizes most of the real estate.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The wider format allows users to view columns that can be
                      sorted, rearranged and otherwise manipulated while viewing
                      additional detail in the side panel.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for trade- and event-monitoring applications,
                      and data analysis.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </section>
        {/* Light */}
        <section>
          <section id="overview">
            <H1>
              H1 Master Detail - <span className="medium">(medium)</span>
            </H1>
            <P>
              When a user selects an item from a master list in the first pane,
              the details populate in the second pane.
            </P>
            <P>The master-detail pattern works well when:</P>
            <ul>
              <li>
                <Span>
                  The user needs to see more details about each item in a list,
                  e.g., email, contacts or messaging applications.
                </Span>
              </li>
              <li>
                <Span>
                  A large list of items with many attributes needs to be
                  displayed in a grid format and you need to expose additional
                  information that can't be displayed in the grid, e.g., a list
                  of trades, transactions, events or errors that have occurred
                  in the application.
                </Span>
              </li>
              <li>
                <Span>
                  Users need to switch between a number of items while
                  maintaining a view of the complete list while they do so,
                  e.g., email applications or news articles.
                </Span>
              </li>
            </ul>
          </section>
          <section>
            <H2>
              H2 Structure - <span className="light">(light)</span>
            </H2>
            <P>
              The master-detail pattern can be orientated vertically or
              horizontally.
            </P>
            <div>
              <div>
                <H3>
                  H3 Vertical (compact) - <span className="light">(light)</span>
                </H3>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      The side panel contains a <strong>list of items</strong>.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Text or summary information is displayed in tile-like
                      containers.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The narrow master pane format lends itself to summary
                      information.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The user does not need to manipulate the list of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for contacts, email, messaging and newsreader
                      applications.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div>
                <H4>
                  H4 Vertical (wide) - <span className="light">(light)</span>
                </H4>
                <ul style={{ marginTop: 0 }}>
                  <li>
                    <Span>
                      This is useful for a <strong>grid</strong> of items.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The master pane utilizes most of the real estate.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      The wider format allows users to view columns that can be
                      sorted, rearranged and otherwise manipulated while viewing
                      additional detail in the side panel.
                    </Span>
                  </li>
                  <li>
                    <Span>
                      Often used for trade- and event-monitoring applications,
                      and data analysis.
                    </Span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </section>
      </section>
    </>
  );
};
export const WholePageExample = WholePageComponent.bind({});
WholePageExample.parameters = {
  docs: { source: { type: "dynamic" } },
  controls: {
    exclude: [
      "elementType",
      "maxRows",
      "showTooltip",
      "tooltipProps",
      "truncate",
      "expanded",
      "style",
      "onOverflow",
    ],
  },
};
