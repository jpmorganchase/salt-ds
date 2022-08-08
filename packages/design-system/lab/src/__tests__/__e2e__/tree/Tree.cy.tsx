import { useEffect, useReducer } from "react";
import { Tree } from "@jpmorganchase/uitk-lab";

function createNodes(count: number, factory: (index: number) => any) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push(factory(i));
  }
  return nodes;
}

function createSampleTreeData(autoExpanded = true, wideLeafNodeParentId = "") {
  return [
    {
      id: "a",
      label: "1",
      description: "description",
      expanded: autoExpanded,
      childNodes: [
        {
          id: "b",
          label: "2",
          expanded: autoExpanded,
          childNodes: [
            {
              id: "c",
              label: "3",
              expanded: autoExpanded,
              childNodes: [
                {
                  id: wideLeafNodeParentId || "d",
                  label: "4",
                  description: "description",
                  expanded: autoExpanded,
                  childNodes: [
                    {
                      id: `${wideLeafNodeParentId || "e"}-1`,
                      label: "5",
                      description: "description",
                    },
                  ].concat(
                    wideLeafNodeParentId
                      ? [
                          {
                            id: `${wideLeafNodeParentId || "e"}-2`,
                            label: "6",
                            description: "description",
                          },
                          {
                            id: `${wideLeafNodeParentId || "e"}-3`,
                            label: "7",
                            description: "description",
                          },
                        ]
                      : []
                  ),
                },
              ],
            },
            {
              id: "f",
              name: "8",
              expanded: autoExpanded,
              childNodes: [
                {
                  id: "h",
                  name: "9",
                  description: "description",
                  expanded: autoExpanded,
                  childNodes: [
                    {
                      id: "e",
                      name: "10",
                      description: "description",
                    },
                    {
                      id: "z",
                      name: "11",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

const noop = () => {
  // noop
};

describe("GIVEN a Tree", () => {
  describe("AND when the component renders with empty root childNodes", () => {
    beforeEach(() => {
      cy.mount(<Tree source={[{ id: "a", label: "name", childNodes: [] }]} />);
    });

    it("THEN should render an expander", () => {
      cy.get(".uitkTree-toggle").should("have.length", 1);
    });

    it("THEN should render 1 node", () => {
      cy.get(".uitkTreeNode-item").should("have.length", 1);
    });
  });

  describe("AND when the component renders with no data", () => {
    it("THEN should render with an empty tree", () => {
      cy.mount(<Tree />);
      cy.get(".uitkTreeNode-item").should("have.length", 0);
    });

    describe("AND when the component re-renders with a valid source", () => {
      it("THEN should respect the source when it is defined", () => {
        function ChangingTree() {
          const [isFirstRender, forceUpdate] = useReducer(() => false, true);
          useEffect(() => forceUpdate());
          return (
            <Tree
              source={
                isFirstRender
                  ? undefined
                  : [{ id: "delayed-data", name: "name", childNodes: null }]
              }
            />
          );
        }
        cy.mount(<ChangingTree />);
        cy.get(".uitkTreeNode-item").should("have.length", 1);
      });
    });
  });

  describe("AND when the component renders with `null` root childNodes", () => {
    beforeEach(() => {
      cy.mount(<Tree source={[{ id: "a", name: "name", childNodes: null }]} />);
    });

    it("THEN should render no expanders", () => {
      cy.get(".uitkTree-toggle").should("have.length", 0);
    });

    it("THEN should render 1 node", () => {
      cy.get(".uitkTreeNode-item").should("have.length", 1);
    });
  });

  describe("AND when the component re-renders with a different source", () => {
    function ChangingTree() {
      const [isFirstRender, forceUpdate] = useReducer(() => false, true);
      useEffect(() => forceUpdate());
      return (
        <Tree
          source={
            isFirstRender
              ? [
                  {
                    id: "a",
                    name: "1",
                    description: "description",
                    childNodes: [],
                  },
                ]
              : createSampleTreeData()
          }
        />
      );
    }

    it("THEN should respect the second source", () => {
      cy.mount(<ChangingTree />);
      cy.get(".uitkTreeNode-item").should("have.length", 9);
    });
  });

  describe.skip("AND when the component re-renders with a different initialSource", () => {
    function ChangingTree() {
      const [isFirstRender, forceUpdate] = useReducer(() => false, true);
      useEffect(() => forceUpdate());
      return (
        <Tree
          source={
            isFirstRender
              ? [
                  {
                    id: "a",
                    name: "1",
                    description: "description",
                    childNodes: [],
                  },
                  {
                    id: "b",
                    name: "2",
                    description: "description",
                    childNodes: [],
                  },
                ]
              : createSampleTreeData()
          }
        />
      );
    }

    it("THEN should ignore the second initialSource", () => {
      cy.mount(<ChangingTree />);
      cy.get(".uitkTreeNode-item").should("have.length", 2);
    });
  });

  describe('AND when `selectionStrategy` is set to "default"', () => {
    it("THEN should select 1 node", () => {
      cy.mount(
        <Tree source={createSampleTreeData()} selectionStrategy="default" />
      );
      cy.findByText("1").realClick();
      cy.findByText("2").realClick();
      cy.get('.uitkTreeNode-item[aria-selected="true"]').should(
        "have.length",
        1
      );
    });
  });

  describe('AND when `selectionStrategy` is set to "default"', () => {
    let onSelectionChange;
    let onToggle;

    beforeEach(() => {
      onSelectionChange = cy.stub().as("selectionChangeHandler");
      onToggle = cy.stub().as("toggleHandler");

      cy.mount(
        <Tree
          source={createSampleTreeData()}
          onToggle={onToggle}
          onSelectionChange={onSelectionChange}
          selectionStrategy="default"
        />
      );
    });

    it("THEN should render the `Tree` without checkboxes", () => {
      cy.get(".uitkCheckbox").should("have.length", 0);
    });

    describe("AND when a node is clicked", () => {
      it("THEN should invoke onSelectionChange callback", () => {
        cy.findByText("1").realClick();
        cy.get("@selectionChangeHandler").should("have.been.called");
      });

      it("THEN should not invoke onToggle callback", () => {
        cy.findByText("1").realClick();
        cy.get("@toggleHandler").should("not.have.been.called");
      });
    });
  });

  // describe("AND when nodes have an icon prop", () => {
  //   let wrapper;

  //   beforeAll(() => {
  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "collapsed-node-1",
  //               name: "2019",
  //               description: "Node with children",
  //               icon: "document",
  //               childNodes: [
  //                 {
  //                   id: "child1",
  //                   name: "2019",
  //                   icon: "folder",
  //                 },
  //               ],
  //             },
  //           ]}
  //         />
  //       );
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("should render the relevant icon for the root node", () => {
  //     expect(
  //       wrapper
  //         .update()
  //         .find({
  //           id: "collapsed-node-1",
  //         })
  //         .find(".jpmuitk-icon-document")
  //     ).toHaveLength(1);
  //   });

  //   it("should render the relevant icon for child nodes", () => {
  //     act(() => {
  //       wrapper
  //         .find(Expander)
  //         .at(0)
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });

  //     expect(
  //       wrapper
  //         .update()
  //         .find({
  //           id: "child1",
  //         })
  //         .find(".jpmuitk-icon-folder")
  //     ).toHaveLength(1);
  //   });
  // });

  describe("AND when multi expand is enabled", () => {
    beforeEach(() => {
      cy.mount(
        <Tree
          source={[
            {
              id: "collapsed-node-1",
              label: "2019",
              description: "Node with children",
              childNodes: [
                {
                  id: "child1",
                  name: "2019",
                },
              ],
            },
            {
              id: "collapsed-node-2",
              label: "latest selection",
              description: "Node with children",
              childNodes: [
                {
                  id: "child2",
                  name: "child",
                },
              ],
            },
          ]}
          selectionStrategy="default"
        />
      );
    });

    describe("AND 2 nodes are expanded", () => {
      it("THEN should expand 2 nodes", () => {
        cy.get(".uitkTreeNode-toggle").eq(0).realClick();
        cy.get(".uitkTreeNode-toggle").eq(1).realClick();
        cy.get('.uitkTreeNode[aria-expanded="true"]').should("have.length", 2);
      });
    });
  });

  describe("AND some nodes are pre-selected", () => {
    beforeEach(() => {
      const source = [
        {
          id: "expanded-node-1",
          description: "Node with children",
          expanded: true,
          childNodes: [
            {
              selected: true,
              id: "selected-node-1",
              name: "child",
            },
            {
              selected: true,
              id: "selected-node-2",
              name: "child",
            },
          ],
        },
      ];
      cy.mount(<Tree source={source} selectionStrategy="default" />);
    });

    describe("AND a new node is clicked", () => {
      it("THEN the last selected node alone should remain selected", () => {
        cy.get(".uitkTreeNode-item").eq(2).realClick();
        cy.get('.uitkTreeNode-item[aria-selected="true"]').should(
          "have.length",
          1
        );
        cy.get(".uitkTreeNode-item")
          .eq(2)
          .should("have.attr", "aria-selected", "true");
      });
    });
  });

  // describe("AND when a deeply nested tree has initial expansions", () => {
  //   let wrapper;

  //   beforeEach(() => {
  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "collapsed-node-1",
  //               name: "2019",
  //               description: "Node with children",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child1",
  //                   name: "child",
  //                 },
  //               ],
  //             },
  //             {
  //               id: "collapsed-node-2",
  //               name: "latest selection",
  //               description: "Node with children",
  //               childNodes: [
  //                 {
  //                   id: "child2",
  //                   name: "child",
  //                 },
  //               ],
  //             },
  //             {
  //               id: "collapsed-node-3",
  //               name: "latest selection",
  //               description: "Node with children",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child3",
  //                   name: "selection",
  //                   expanded: true,
  //                   description: "Node with children",
  //                   childNodes: [
  //                     {
  //                       id: "child4",
  //                       name: "selection",
  //                       description: "Node with children",
  //                       childNodes: [
  //                         {
  //                           id: "child5",
  //                           name: "selection",
  //                           description: "Node with no children",
  //                           childNodes: [],
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ]}
  //           variant="default"
  //         />
  //       );
  //     });
  //   });

  //   afterEach(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN only 3 nodes should be expanded", () => {
  //     expect(
  //       wrapper.update().find(Expander).filter({ expanded: true }).length
  //     ).toEqual(3);
  //   });
  // });

  // describe("AND when multi expand is disabled on a deeply nested tree with initial state", () => {
  //   let wrapper;

  //   beforeEach(() => {
  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "expanded-node-1",
  //               name: "2019",
  //               description: "Node with children",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child1",
  //                   name: "child",
  //                   expanded: true,
  //                   childNodes: [
  //                     {
  //                       id: "child-of-child-1",
  //                       name: "child-of-child",
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //             {
  //               id: "collapsed-node-1",
  //               name: "latest selection",
  //               description: "Node with children",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child2",
  //                   name: "child",
  //                   expanded: true,
  //                 },
  //               ],
  //             },
  //             {
  //               id: "collapsed-node-2",
  //               name: "latest selection",
  //               description: "Node with children",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child3",
  //                   name: "selection",
  //                   expanded: true,
  //                   description: "Node with children",
  //                   childNodes: [
  //                     {
  //                       id: "child4",
  //                       name: "selection",
  //                       description: "Node with children",
  //                       expanded: true,
  //                       childNodes: [
  //                         {
  //                           id: "child5",
  //                           name: "selection",
  //                           description: "Node with no children",
  //                           childNodes: [],
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ]}
  //           singleExpand
  //           variant="default"
  //         />
  //       );
  //     });
  //   });

  //   afterEach(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN only 2 nodes should be expanded", () => {
  //     expect(
  //       wrapper.update().find(Expander).filter({ expanded: true }).length
  //     ).toEqual(2);
  //     expect(
  //       wrapper
  //         .update()
  //         .find(TreeListItem)
  //         .filter({ expanded: true })
  //         .at(1)
  //         .prop("id")
  //     ).toEqual("child1");
  //   });
  // });

  // describe("AND when multi expand is disabled on a deeply nested tree", () => {
  //   let wrapper;

  //   beforeEach(() => {
  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "collapsed-node-1",
  //               name: "2019",
  //               description: "Node with children",
  //               childNodes: [
  //                 {
  //                   id: "child1",
  //                   name: "child",
  //                 },
  //               ],
  //             },
  //             {
  //               id: "collapsed-node-2",
  //               name: "latest selection",
  //               description: "Node with children",
  //               childNodes: [
  //                 {
  //                   id: "child2",
  //                   name: "child",
  //                 },
  //               ],
  //             },
  //             {
  //               id: "collapsed-node-3",
  //               name: "latest selection",
  //               description: "Node with children",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child3",
  //                   name: "selection",
  //                   expanded: true,
  //                   description: "Node with children",
  //                   childNodes: [
  //                     {
  //                       id: "child4",
  //                       name: "selection",
  //                       description: "Node with children",
  //                       childNodes: [
  //                         {
  //                           id: "child5",
  //                           name: "selection",
  //                           description: "Node with no children",
  //                           childNodes: [],
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ]}
  //           singleExpand
  //           variant="default"
  //         />
  //       );
  //     });
  //   });

  //   afterEach(() => {
  //     wrapper.unmount();
  //   });

  //   describe("AND 2 nested nodes are expanded", () => {
  //     beforeEach(() => {
  //       act(() => {
  //         wrapper
  //           .update()
  //           .find({ id: "child4" })
  //           .find(Expander)
  //           .props()
  //           .onClick({ preventDefault: noop, stopPropagation: noop });
  //       });
  //     });

  //     afterAll(() => {
  //       wrapper.unmount();
  //     });

  //     describe("AND a nested node is collapsed", () => {
  //       beforeEach(() => {
  //         act(() => {
  //           wrapper
  //             .update()
  //             .find({ id: "child4" })
  //             .find(Expander)
  //             .props()
  //             .onClick({ preventDefault: noop, stopPropagation: noop });
  //         });
  //       });

  //       it("THEN should expand 2 nodes", () => {
  //         expect(
  //           wrapper.update().find(Expander).filter({ expanded: true }).length
  //         ).toEqual(2);
  //       });
  //     });

  //     it("THEN should expand 3 nodes", () => {
  //       expect(
  //         wrapper.update().find(Expander).filter({ expanded: true }).length
  //       ).toEqual(3);
  //     });
  //   });
  // });

  // describe("AND some nodes are pre-selected with multiSelect", () => {
  //   let wrapper;

  //   beforeEach(() => {
  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "expanded-node-1",
  //               description: "Node with children",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   selected: true,
  //                   id: "selected-node-1",
  //                   name: "child",
  //                 },
  //                 {
  //                   selected: true,
  //                   id: "selected-node-2",
  //                   name: "child",
  //                 },
  //               ],
  //             },
  //           ]}
  //           multiSelect
  //           variant="default"
  //         />
  //       );
  //     });
  //   });

  //   afterEach(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should make the selected nodes appear as selected", () => {
  //     expect(
  //       wrapper.update().find(TreeListItem).filter({ selected: true }).length
  //     ).toEqual(2);
  //   });
  // });

  // describe("AND when multi select is enabled", () => {
  //   let wrapper;

  //   beforeAll(() => {
  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={createSampleTreeData()}
  //           multiSelect
  //           variant="default"
  //         />
  //       );
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   describe("AND 2 nodes are clicked", () => {
  //     beforeAll(() => {
  //       act(() => {
  //         wrapper
  //           .find(TreeListItem)
  //           .at(1)
  //           .props()
  //           .onClick({ preventDefault: noop, stopPropagation: noop });

  //         wrapper
  //           .find(TreeListItem)
  //           .at(2)
  //           .props()
  //           .onClick({ preventDefault: noop, stopPropagation: noop });
  //       });
  //     });

  //     afterAll(() => {
  //       wrapper.unmount();
  //     });

  //     it("THEN should select 2 nodes", () => {
  //       expect(
  //         wrapper.update().find(TreeListItem).filter({ selected: true }).length
  //       ).toEqual(2);
  //     });
  //   });
  // });

  // describe('AND when `variant` is set to "checkbox"', () => {
  //   describe("AND the data structure is 1-1-1-1-1", () => {
  //     let wrapper;
  //     let onItemClickSpy;
  //     let onCheckToggleSpy;

  //     beforeAll(() => {
  //       const sourceWithDeepChildNodes = createSampleTreeData();
  //       onCheckToggleSpy = jest.fn();
  //       onItemClickSpy = jest.fn();

  //       act(() => {
  //         wrapper = mountWithTheme(
  //           <Tree
  //             initialSource={sourceWithDeepChildNodes}
  //             onCheckToggle={onCheckToggleSpy}
  //             onItemClick={onItemClickSpy}
  //             variant="checkbox"
  //           />
  //         );
  //       });
  //     });

  //     afterAll(() => {
  //       wrapper.unmount();
  //     });

  //     describe("WHEN the deepest checkbox is clicked", () => {
  //       beforeAll(() => {
  //         act(() => {
  //           wrapper
  //             .find(TreeListItem)
  //             .first()
  //             .find(CheckboxBase)
  //             .last()
  //             .props()
  //             .onChange({ preventDefault: noop, stopPropagation: noop });
  //         });
  //       });

  //       it("THEN the parents should not be indeterminate", () => {
  //         expect(
  //           wrapper.update().find(CheckboxBase).filter({ indeterminate: true })
  //             .length
  //         ).toBe(0);
  //       });

  //       it("THEN should check all parents", () => {
  //         expect(
  //           wrapper.update().find(CheckboxBase).filter({ checked: true }).length
  //         ).toBe(9);
  //       });
  //     });
  //   });

  //   describe("AND the data structure is 1-1-1-1-3", () => {
  //     let wrapper;
  //     let onItemClickSpy;
  //     let onCheckToggleSpy;

  //     beforeEach(() => {
  //       const sourceWithDeepChildNodes = createSampleTreeData(
  //         true,
  //         "3-child-parent" /* wideLeafNodeParentId */
  //       );

  //       onCheckToggleSpy = jest.fn();
  //       onItemClickSpy = jest.fn();

  //       act(() => {
  //         wrapper = mountWithTheme(
  //           <Tree
  //             initialSource={sourceWithDeepChildNodes}
  //             onCheckToggle={onCheckToggleSpy}
  //             onItemClick={onItemClickSpy}
  //             variant="checkbox"
  //           />
  //         );
  //       });
  //     });

  //     afterEach(() => {
  //       wrapper.unmount();
  //     });

  //     describe("WHEN the deepest checkbox is checked", () => {
  //       beforeEach(() => {
  //         act(() => {
  //           wrapper
  //             .find({ id: "3-child-parent-3" })
  //             .find(CheckboxBase)
  //             .last()
  //             .props()
  //             .onChange({ preventDefault: noop, stopPropagation: noop });
  //         });
  //       });

  //       it("THEN the parents up the tree should be indeterminate", () => {
  //         expect(
  //           wrapper.update().find(CheckboxBase).filter({ indeterminate: true })
  //             .length
  //         ).toBe(4);
  //       });

  //       it("THEN should only check the single node", () => {
  //         expect(
  //           wrapper.update().find(CheckboxBase).filter({ checked: true }).length
  //         ).toBe(1);
  //       });
  //     });
  //   });

  //   describe("AND the tree is disabled", () => {
  //     let wrapper;
  //     let onItemClickSpy;
  //     let onCheckToggleSpy;

  //     beforeAll(() => {
  //       onCheckToggleSpy = jest.fn();
  //       onItemClickSpy = jest.fn();

  //       act(() => {
  //         wrapper = mountWithTheme(
  //           <Tree
  //             disabled
  //             initialSource={createSampleTreeData()}
  //             onCheckToggle={onCheckToggleSpy}
  //             onItemClick={onItemClickSpy}
  //             variant="checkbox"
  //           />
  //         );
  //       });
  //     });

  //     afterAll(() => {
  //       wrapper.unmount();
  //     });

  //     describe("WHEN the checkbox is clicked", () => {
  //       beforeAll(() => {
  //         act(() => {
  //           wrapper.find(TreeListItem).at(6).simulate("click");

  //           wrapper
  //             .find(TreeListItem)
  //             .at(6)
  //             .find(CheckboxBase)
  //             .simulate("change");
  //         });
  //       });

  //       afterAll(() => {
  //         wrapper.unmount();
  //       });

  //       it("THEN should not invoke onItemClick callback", () => {
  //         expect(onItemClickSpy).not.toHaveBeenCalled();
  //       });

  //       it("THEN should not invoke onCheckToggle callback", () => {
  //         expect(onCheckToggleSpy).not.toHaveBeenCalled();
  //       });
  //     });
  //   });

  //   describe("AND the data structure is non-specific", () => {
  //     let wrapper;
  //     let onItemClickSpy;
  //     let onCheckToggleSpy;

  //     beforeAll(() => {
  //       onCheckToggleSpy = jest.fn();
  //       onItemClickSpy = jest.fn();

  //       act(() => {
  //         wrapper = mountWithTheme(
  //           <Tree
  //             initialSource={createSampleTreeData()}
  //             onCheckToggle={onCheckToggleSpy}
  //             onItemClick={onItemClickSpy}
  //             variant="checkbox"
  //           />
  //         );
  //       });
  //     });

  //     afterAll(() => {
  //       wrapper.unmount();
  //     });

  //     it("THEN should render the `Tree` with checkboxes", () => {
  //       expect(wrapper.find(CheckboxBase).length).toBeGreaterThan(0);
  //     });

  //     describe("WHEN the checkbox is clicked", () => {
  //       beforeAll(() => {
  //         act(() => {
  //           wrapper
  //             .find(TreeListItem)
  //             .at(6)
  //             .find(CheckboxBase)
  //             .props()
  //             .onClick({ preventDefault: noop, stopPropagation: noop }, {});

  //           wrapper
  //             .find(TreeListItem)
  //             .at(6)
  //             .find(CheckboxBase)
  //             .props()
  //             .onChange({ preventDefault: noop, stopPropagation: noop });
  //         });
  //       });

  //       it("THEN should invoke onItemClick callback", () => {
  //         expect(onItemClickSpy).toHaveBeenCalledTimes(1);
  //       });

  //       it("THEN should invoke onCheckToggle callback", () => {
  //         expect(onCheckToggleSpy).toHaveBeenCalledTimes(1);
  //       });

  //       it("THEN should pass the path to the node", () => {
  //         expect(onCheckToggleSpy.mock.calls[0][2].join(".")).toEqual(
  //           "[0].childNodes[0].childNodes[1].childNodes[0]"
  //         );
  //       });

  //       it("THEN should check all children", () => {
  //         expect(
  //           wrapper.update().find(TreeListItem).at(8).find(CheckboxBase).props()
  //             .checked
  //         ).toBe(true);
  //       });
  //     });
  //   });
  // });

  // describe("AND a node is clicked", () => {
  //   let wrapper;
  //   let onSelectToggleSpy;
  //   let onItemClickSpy;

  //   beforeAll(() => {
  //     onSelectToggleSpy = jest.fn();
  //     onItemClickSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={createSampleTreeData()}
  //           onItemClick={onItemClickSpy}
  //           onSelectToggle={onSelectToggleSpy}
  //         />
  //       );
  //       wrapper
  //         .find(TreeListItem)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should invoke onItemClick", () => {
  //     expect(onItemClickSpy).toHaveBeenCalled();
  //   });

  //   it("THEN should invoke onSelect", () => {
  //     expect(onSelectToggleSpy).toHaveBeenCalled();
  //   });
  // });

  // describe("AND a node is expanded with a FAILED async request", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;

  //   function createMockPromise() {
  //     return () => {
  //       const promise = {
  //         then: () => promise,
  //         catch: (callback) => {
  //           try {
  //             callback(new Error("failure"));
  //           } catch (e) {
  //             // noop - exception is expected
  //           }
  //           return promise;
  //         },
  //       };

  //       return promise;
  //     };
  //   }

  //   beforeAll(() => {
  //     onExpandToggleSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "loadMore",
  //               name: "2019",
  //               description: "Node with children",
  //               childNodes: [],
  //             },
  //           ]}
  //           loadChildNodes={createMockPromise()}
  //           onExpandToggle={onExpandToggleSpy}
  //           variant="checkbox"
  //         />
  //       );
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should render a node with a description", () => {
  //     expect(
  //       wrapper.update().find(TreeListItem).at(1).find(TreeListItem).props()
  //         .description
  //     ).toEqual("Failed to load children. Please try again.");
  //   });
  // });

  // describe("AND the imperative API is used to remove the loading state", () => {
  //   let wrapper;

  //   beforeAll(() => {
  //     function ActionsTree() {
  //       const actionsRef = useRef();

  //       useEffect(() => {
  //         actionsRef.current.setLoadingStateById("child", false);
  //       }, []);

  //       return (
  //         <Tree
  //           actions={actionsRef}
  //           source={[
  //             {
  //               id: "root",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child",
  //                   name: "dynamic child",
  //                   childNodes: [],
  //                   expanded: true,
  //                 },
  //               ],
  //               name: "updated root",
  //             },
  //           ]}
  //           variant="default"
  //         />
  //       );
  //     }

  //     wrapper = mountWithTheme(<ActionsTree />);
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should not show the loading state", () => {
  //     expect(
  //       wrapper
  //         .update()
  //         .find(TreeListItem)
  //         .filter({ id: "child" })
  //         .prop("isLoading")
  //     ).toBe(false);
  //   });
  // });

  // describe("AND the imperative API is used to show the loading state", () => {
  //   let wrapper;

  //   beforeAll(() => {
  //     function ActionsTree() {
  //       const actionsRef = useRef();

  //       useEffect(() => {
  //         actionsRef.current.setLoadingStateById("child", true);
  //       }, []);

  //       return (
  //         <Tree
  //           actions={actionsRef}
  //           source={[
  //             {
  //               id: "root",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child",
  //                   name: "dynamic child",
  //                   childNodes: [],
  //                   expanded: true,
  //                 },
  //               ],
  //               name: "updated root",
  //             },
  //           ]}
  //           variant="default"
  //         />
  //       );
  //     }

  //     wrapper = mountWithTheme(<ActionsTree />);
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should not show the loading state", () => {
  //     expect(
  //       wrapper
  //         .update()
  //         .find(TreeListItem)
  //         .filter({ id: "child" })
  //         .prop("isLoading")
  //     ).toBe(true);
  //   });
  // });

  // describe("AND the imperative API is used to remove the error state", () => {
  //   let wrapper;

  //   beforeAll(() => {
  //     function ActionsTree() {
  //       const actionsRef = useRef();

  //       useEffect(() => {
  //         actionsRef.current.setErrorStateById("child", false);
  //       }, []);

  //       return (
  //         <Tree
  //           actions={actionsRef}
  //           source={[
  //             {
  //               id: "root",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child",
  //                   name: "dynamic child",
  //                   childNodes: [],
  //                   expanded: true,
  //                 },
  //               ],
  //               name: "updated root",
  //             },
  //           ]}
  //           variant="default"
  //         />
  //       );
  //     }

  //     wrapper = mountWithTheme(<ActionsTree />);
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should not show the error message", () => {
  //     expect(
  //       wrapper
  //         .update()
  //         .find(TreeListItem)
  //         .filter({ id: "child-subNode" })
  //         .prop("description")
  //     ).not.toBe("Failed to load children. Please try again.");
  //   });
  // });

  // describe("AND the imperative API is used to set the error state", () => {
  //   let wrapper;

  //   beforeAll(() => {
  //     function ActionsTree() {
  //       const actionsRef = useRef();

  //       useEffect(() => {
  //         actionsRef.current.setErrorStateById("child", true);
  //       }, []);

  //       return (
  //         <Tree
  //           actions={actionsRef}
  //           source={[
  //             {
  //               id: "root",
  //               expanded: true,
  //               childNodes: [
  //                 {
  //                   id: "child",
  //                   name: "dynamic child",
  //                   childNodes: [],
  //                   expanded: true,
  //                 },
  //               ],
  //               name: "updated root",
  //             },
  //           ]}
  //           variant="default"
  //         />
  //       );
  //     }

  //     wrapper = mountWithTheme(<ActionsTree />);
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should show the error message", () => {
  //     expect(
  //       wrapper
  //         .update()
  //         .find(TreeListItem)
  //         .filter({ id: "child-subNode" })
  //         .prop("description")
  //     ).toBe("Failed to load children. Please try again.");
  //   });
  // });

  // describe("AND a controlled node is expanded with 0 childNodes but then updates to return 1 childNodes", () => {
  //   let wrapper;

  //   beforeAll(() => {
  //     function ChangingTree() {
  //       const [isFirstRender, forceUpdate] = useReducer(() => false, true);

  //       useEffect(() => forceUpdate());

  //       return (
  //         <Tree
  //           source={
  //             isFirstRender
  //               ? [{ id: "root", childNodes: [], expanded: true, name: "root" }]
  //               : [
  //                   {
  //                     id: "root",
  //                     expanded: true,
  //                     childNodes: [{ id: "child", name: "dynamic child" }],
  //                     name: "updated root",
  //                   },
  //                 ]
  //           }
  //           variant="default"
  //         />
  //       );
  //     }

  //     wrapper = mountWithTheme(<ChangingTree />);
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should remove the no children message", () => {
  //     expect(
  //       wrapper
  //         .update()
  //         .find(TreeListItem)
  //         .filter({ description: "No children available." }).length
  //     ).toBe(0);
  //   });
  // });

  // Reproduction of https://jiradc-other.jpmchase.net/browse/UITK-1775
  // describe("AND a controlled node is expanded then the source changes and it is clicked again", () => {
  //   let wrapper;
  //   let onItemClickSpy;

  //   beforeAll(() => {
  //     onItemClickSpy = jest.fn();

  //     wrapper = mountWithTheme(
  //       <Tree
  //         onItemClick={onItemClickSpy}
  //         source={[
  //           { id: "moving-child", name: "child" },
  //           { id: "second-child", name: "child" },
  //         ]}
  //       />
  //     );

  //     act(() => {
  //       wrapper
  //         .update()
  //         .find(TreeListItem)
  //         .filter({ id: "moving-child" })
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });

  //     act(() => {
  //       wrapper.setProps({
  //         source: [
  //           { id: "second-child", name: "child" },
  //           { id: "moving-child", name: "child" },
  //         ],
  //       });
  //     });

  //     act(() => {
  //       wrapper
  //         .update()
  //         .find(TreeListItem)
  //         .filter({ id: "moving-child" })
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should call the callback with the correct args", () => {
  //     expect(onItemClickSpy.mock.calls[0][1][0]).toBe("[0]");
  //     expect(onItemClickSpy.mock.calls[1][1][0]).toBe("[1]");
  //   });
  // });

  // describe("AND a node is expanded with an async request that returns 0 childNodes", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;

  //   function createMockPromise() {
  //     return () => {
  //       const promise = {
  //         then: (resolve) => {
  //           resolve(0);

  //           return promise;
  //         },
  //         catch: () => promise,
  //       };

  //       return promise;
  //     };
  //   }

  //   beforeAll(() => {
  //     onExpandToggleSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "loadMore",
  //               name: "2019",
  //               description: "Node with children",
  //               childNodes: [],
  //             },
  //           ]}
  //           loadChildNodes={createMockPromise()}
  //           onExpandToggle={onExpandToggleSpy}
  //           variant="checkbox"
  //         />
  //       );
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   describe("WHEN the node is expanded", () => {
  //     beforeAll(() => {
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });

  //     it("THEN should have no indeterminate nodes", () => {
  //       expect(
  //         wrapper.update().find({ indeterminate: true }).filter(CheckboxBase)
  //           .length
  //       ).toEqual(0);
  //     });

  //     it("THEN should render a node with a description", () => {
  //       expect(
  //         wrapper
  //           .update()
  //           .first()
  //           .find({ description: "No children available." }).length
  //       ).toBeGreaterThan(0);
  //     });
  //   });
  // });

  // describe("AND an attempt to expand a node is made during a loading state", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;
  //   let resolver;

  //   function createMockPromise() {
  //     return () => {
  //       const promise = {
  //         then: (resolve) => {
  //           resolver = resolve;
  //           return promise;
  //         },
  //         catch: () => promise,
  //       };

  //       return promise;
  //     };
  //   }

  //   beforeAll((done) => {
  //     onExpandToggleSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "loadMore",
  //               name: "2019",
  //               description: "Node with children",
  //               childNodes: [],
  //             },
  //           ]}
  //           loadChildNodes={createMockPromise()}
  //           onExpandToggle={onExpandToggleSpy}
  //         />
  //       );
  //       wrapper.find(TreeListItem).last().simulate("keyDown", {
  //         which: 39,
  //       });

  //       wrapper.find(TreeListItem).last().simulate("keyDown", {
  //         which: 39,
  //       });

  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });

  //       setTimeout(() => {
  //         act(() => {
  //           resolver();
  //           done();
  //         });
  //       }, 50);
  //     });
  //   });

  //   it("THEN should only call the expander once", () => {
  //     expect(onExpandToggleSpy).toHaveBeenCalledTimes(1);
  //   });
  // });

  // describe("AND a node is expanded with an async request", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;
  //   let callCount = 0;

  //   function createMockPromise() {
  //     return () => {
  //       const promise = {
  //         then: (resolve) => {
  //           setTimeout(() =>
  //             act(() => {
  //               resolve(
  //                 createNodes(12, (index) => ({
  //                   name: `new item ${index}`,
  //                   id: `new-${index}`,
  //                   description: "some description",
  //                 }))
  //               );
  //             })
  //           );
  //           callCount++;
  //           return promise;
  //         },
  //         catch: () => promise,
  //       };

  //       return promise;
  //     };
  //   }

  //   beforeAll((done) => {
  //     onExpandToggleSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "loadMore",
  //               name: "2019",
  //               description: "Node with children",
  //               childNodes: [],
  //             },
  //           ]}
  //           loadChildNodes={createMockPromise()}
  //           onExpandToggle={onExpandToggleSpy}
  //           variant="checkbox"
  //         />
  //       );
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });

  //       setTimeout(done);
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should render the expansion node as expandable", () => {
  //     expect(
  //       wrapper.update().find(TreeListItem).first().props().expandable
  //     ).toEqual(true);
  //   });

  //   it("THEN the new nodes should all be unchecked", () => {
  //     expect(
  //       wrapper.update().find(CheckboxBase).filter({ checked: true }).length
  //     ).toBe(0);
  //   });

  //   it("THEN should list the newly retrieved child nodes", () => {
  //     expect(wrapper.update().find(TreeListItem).length).toEqual(13);
  //   });

  //   describe("AND the node is collapsed and re-expanded", () => {
  //     beforeAll(() => {
  //       callCount = 0;

  //       act(() => {
  //         wrapper
  //           .find(Expander)
  //           .first()
  //           .props()
  //           .onClick({ preventDefault: noop, stopPropagation: noop });

  //         wrapper
  //           .update()
  //           .find(Expander)
  //           .first()
  //           .props()
  //           .onClick({ preventDefault: noop, stopPropagation: noop });
  //       });
  //     });

  //     it("THEN should not make the async request again", () => {
  //       expect(callCount).toBe(0);
  //     });
  //   });
  // });

  // describe("AND a checked node is expanded with an async request", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;

  //   function createMockPromise() {
  //     return () => {
  //       const promise = {
  //         then: (resolve) => {
  //           resolve(
  //             createNodes(12, (index) => ({
  //               name: `new item ${index}`,
  //               id: `new-${index}`,
  //               description: "some description",
  //             }))
  //           );
  //           return promise;
  //         },
  //         catch: () => promise,
  //       };

  //       return promise;
  //     };
  //   }

  //   beforeAll(() => {
  //     onExpandToggleSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "loadMore",
  //               name: "2019",
  //               checked: true,
  //               description: "Node with children",
  //               childNodes: [],
  //             },
  //           ]}
  //           loadChildNodes={createMockPromise()}
  //           onExpandToggle={onExpandToggleSpy}
  //           variant="checkbox"
  //         />
  //       );
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN the new nodes should all be checked", () => {
  //     expect(
  //       wrapper.update().find(CheckboxBase).filter({ checked: true }).length
  //     ).toEqual(13);
  //   });

  //   it("THEN should list the newly retrieved child nodes", () => {
  //     expect(wrapper.update().find(TreeListItem).length).toEqual(13);
  //   });
  // });

  // describe("WHEN an unchecked node has async children", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;

  //   function createMockPromise() {
  //     return () => {
  //       const promise = {
  //         then: (resolve) => {
  //           resolve(
  //             createNodes(12, (index) => ({
  //               name: `new item ${index}`,
  //               id: `new-${index}`,
  //               checked: index % 2 === 0,
  //               description: "some description",
  //             }))
  //           );
  //           return promise;
  //         },
  //         catch: () => promise,
  //       };

  //       return promise;
  //     };
  //   }

  //   beforeAll(() => {
  //     onExpandToggleSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "loadMore",
  //               name: "2019",
  //               description: "Node with children",
  //               childNodes: [],
  //             },
  //           ]}
  //           loadChildNodes={createMockPromise()}
  //           onExpandToggle={onExpandToggleSpy}
  //           variant="checkbox"
  //         />
  //       );
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   describe("AND it is expanded", () => {
  //     beforeAll(() => {
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });

  //     it("THEN some of the new nodes should be checked", () => {
  //       expect(
  //         wrapper.update().find(CheckboxBase).filter({ checked: true }).length
  //       ).toEqual(6);
  //     });

  //     it("THEN should list the newly retrieved child nodes", () => {
  //       expect(wrapper.update().find(TreeListItem).length).toEqual(13);
  //     });
  //   });
  // });

  // describe("AND a node is expanded", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;

  //   beforeAll((done) => {
  //     onExpandToggleSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={createSampleTreeData(false)}
  //           onExpandToggle={onExpandToggleSpy}
  //         />
  //       );

  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });

  //       setTimeout(() => {
  //         act(() => {
  //           wrapper
  //             .update()
  //             .find(Expander)
  //             .first()
  //             .props()
  //             .onClick({ preventDefault: noop, stopPropagation: noop });
  //         });
  //         done();
  //       });
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN the args for multiple calls should not match", () => {
  //     expect(onExpandToggleSpy.mock.calls[0][1]).toEqual(true);
  //     expect(onExpandToggleSpy.mock.calls[1][1]).toEqual(false);
  //   });

  //   it("THEN should invoke onExpandToggle", () => {
  //     expect(onExpandToggleSpy).toHaveBeenCalled();
  //   });
  // });

  // describe("WHEN using a custom `NodeBody`", () => {
  //   let wrapper;

  //   beforeAll(() => {
  //     act(() => {
  //       const CustomNodeBody = forwardRef(function CustomNodeBody(props, ref) {
  //         return (
  //           <div className={props.className} ref={ref}>
  //             {props.children}
  //           </div>
  //         );
  //       });
  //       CustomNodeBody.propTypes = {
  //         children: PropTypes.oneOfType([
  //           PropTypes.arrayOf(PropTypes.node),
  //           PropTypes.node,
  //         ]),
  //         className: PropTypes.string,
  //       };
  //       wrapper = mountWithTheme(
  //         <Tree
  //           NodeBody={CustomNodeBody}
  //           initialSource={createNodes(13, (index) => ({
  //             name: `new item ${index}`,
  //             id: `new-${index}`,
  //             description: "some description",
  //           }))}
  //           variant="default"
  //         />
  //       );
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN should render correctly", () => {
  //     expect(wrapper.update().find(TreeListItem).length).toEqual(13);
  //   });
  // });

  // describe("WHEN passing both a source and initialSource", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;
  //   let warning;

  //   beforeAll(() => {
  //     onExpandToggleSpy = jest.fn();
  //     warning = require("warning");

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "usethis",
  //               name: "usethis",
  //               childNodes: [],
  //             },
  //           ]}
  //           loadChildNodes={() =>
  //             Promise.resolve(
  //               createNodes(12, (index) => ({
  //                 name: `Day ${index + 1}`,
  //               }))
  //             )
  //           }
  //           onExpandToggle={onExpandToggleSpy}
  //           source={[
  //             {
  //               id: "dontuse",
  //               name: "dontuse",
  //               childNodes: [],
  //             },
  //           ]}
  //           variant="default"
  //         />
  //       );
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN it should warn", () => {
  //     expect(warning).toHaveBeenCalledWith(
  //       false,
  //       "Both a source and an initialSource specified. Only initialSource will be acknowledged."
  //     );
  //   });

  //   it("THEN it should use the initialSource only", () => {
  //     expect(wrapper.find(TreeListItem).first().props().name).toEqual(
  //       "usethis"
  //     );
  //   });
  // });

  // describe("WHEN passing neither a source or an initialSource", () => {
  //   let wrapper;
  //   let warning;

  //   beforeAll(() => {
  //     warning = require("warning");

  //     act(() => {
  //       wrapper = mountWithTheme(<Tree variant="default" />);
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN it should warn", () => {
  //     expect(warning).toHaveBeenCalledWith(
  //       false,
  //       "A source or initialSource must be specified."
  //     );
  //   });
  // });

  // describe("WHEN in controlled mode AND using a stateReducer", () => {
  //   let wrapper;
  //   let stateReducerSpy;

  //   beforeAll(() => {
  //     stateReducerSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           source={createSampleTreeData()}
  //           stateReducer={stateReducerSpy}
  //           variant="default"
  //         />
  //       );
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN the stateReducer should be ignored", () => {
  //     expect(stateReducerSpy).not.toHaveBeenCalled();
  //   });
  // });

  // describe("WHEN in controlled mode", () => {
  //   let wrapper;
  //   let onExpandToggleSpy;

  //   beforeAll(() => {
  //     onExpandToggleSpy = jest.fn();

  //     act(() => {
  //       wrapper = mountWithTheme(
  //         <Tree
  //           onExpandToggle={onExpandToggleSpy}
  //           source={createSampleTreeData()}
  //           variant="default"
  //         />
  //       );
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN the args for multiple calls should match", () => {
  //     expect(onExpandToggleSpy.mock.calls[0][2]).toEqual(
  //       onExpandToggleSpy.mock.calls[1][2]
  //     );
  //   });
  // });

  // describe("WHEN in uncontrolled mode with an expanded root", () => {
  //   let wrapper;
  //   let warning;
  //   let loadChildNodesSpy;

  //   beforeAll(() => {
  //     function createMockPromise(spy) {
  //       return () => {
  //         spy();

  //         const promise = {
  //           then: (resolve) => {
  //             resolve(0);

  //             return promise;
  //           },
  //           catch: () => promise,
  //         };

  //         return promise;
  //       };
  //     }

  //     act(() => {
  //       warning = require("warning");
  //       warning.mockReset();

  //       loadChildNodesSpy = jest.fn();

  //       wrapper = mountWithTheme(
  //         <Tree
  //           initialSource={[
  //             {
  //               id: "usethis",
  //               name: "usethis",
  //               expanded: true,
  //               childNodes: [],
  //             },
  //           ]}
  //           loadChildNodes={createMockPromise(loadChildNodesSpy)}
  //           variant="default"
  //         />
  //       );
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN it should auto request new data", () => {
  //     expect(loadChildNodesSpy).toHaveBeenCalled();
  //   });
  // });

  // describe("WHEN in controlled mode with invalid props", () => {
  //   let wrapper;
  //   let warning;
  //   let loadChildNodesSpy;

  //   beforeAll(() => {
  //     act(() => {
  //       warning = require("warning");
  //       warning.mockReset();

  //       loadChildNodesSpy = jest.fn();

  //       wrapper = mountWithTheme(
  //         <Tree
  //           loadChildNodes={loadChildNodesSpy}
  //           source={createSampleTreeData()}
  //           variant="default"
  //         />
  //       );
  //       wrapper
  //         .find(Expander)
  //         .first()
  //         .props()
  //         .onClick({ preventDefault: noop, stopPropagation: noop });
  //     });
  //   });

  //   afterAll(() => {
  //     wrapper.unmount();
  //   });

  //   it("THEN it should never be called", () => {
  //     expect(loadChildNodesSpy).not.toHaveBeenCalled();
  //   });

  //   it("THEN it should warn", () => {
  //     expect(warning).toHaveBeenCalledWith(
  //       false,
  //       "loadChildNodes will not be invoked for controlled components." +
  //         "\n\nConsider adding an onExpandToggle handler and updating the data manually."
  //     );
  //   });
  // });
});
