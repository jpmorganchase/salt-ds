# Extend saved reports into a report library

Start from the same local React/Vite fixture and meet every requirement in
`TASK.md`. Then extend it into one coherent saved-report library for the same
analyst. Use only the declared packages, make no network request, do not change
the package manifest, and keep all report state in one local report collection.
Do not add a backend, mock service, second fixture dataset or application
framework.

The library starts empty. Creating reports is how it gains its data. A user
must be able to add both of these reports through separate uses of **New
report**, and both must remain available together:

| Report name                  | Description                               |
| ---------------------------- | ----------------------------------------- |
| Quarterly risk overview      | Summary of open operational risks.        |
| Supplier resilience register | Ownership, dependencies and review dates. |

Each visible report summary must provide the accessible action **Open report
&lt;report name&gt;**. Saved-report summaries are the specific Card-covered role
identified by the earlier independent review, so use Salt Card for those
summaries. This is scoped to this report-summary role; choose the other
components and layouts from the matching local Knowledge based on their own
roles.

Provide an accessible field named **Search reports**. A search that matches no
report must visibly say **No reports match your search.**, and the action
**Clear search** must restore both reports. Opening Supplier resilience register
must show a region named **Report details** containing the selected report and
an action named **Edit report**.

Editing opens a dialog named **Edit report** with accessible fields **Report
name** and **Description**, actions **Save report** and **Cancel**, and the same
empty-name validation message, **Enter a report name.** Invalid submission must
move focus to Report name. Cancel must leave the saved values unchanged and
restore focus to Edit report. Saving the following values must update the
selected details, announce **Report "Supplier resilience register (updated)"
saved.**, and keep Quarterly risk overview available:

| Report name                            | Description                                       |
| -------------------------------------- | ------------------------------------------------- |
| Supplier resilience register (updated) | Ownership, dependencies and updated review dates. |

Keep the current provider and theme setup. All flows must work by keyboard and
at 320 CSS pixels without horizontal document overflow. Treat the existing
empty, validation, creation, cancellation and focus behavior as continuing
requirements, not a separate compatibility layer.
