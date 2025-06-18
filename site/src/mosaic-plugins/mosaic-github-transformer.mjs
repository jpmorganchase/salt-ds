function summarizeMinorChanges(mdx) {
  const sections = mdx.split(/###\s+/).slice(1);
  const minorChanges = sections.find((section) =>
    section.startsWith("Minor Changes"),
  );

  if (!minorChanges) return "";

  const changes = minorChanges
    .split("\n")
    .filter((line) => /^-\s+[a-f0-9]+:/.test(line));

  let topChanges = changes
    .map((change) => {
      return change.replace(/-\s+[a-f0-9]+:\s+/, "- ").replace("- -", "-");
    })
    .slice(0, 3);

  if (topChanges.some((line) => line.length > 120)) {
    topChanges = topChanges.slice(0, 2);
  }

  return topChanges.join("\n");
}

export default function (response, prefixDir) {
  const coreReleases = response.filter((release) =>
    release.tag_name.startsWith("@salt-ds/core"),
  );

  return coreReleases.map((release) => {
    const route = `${prefixDir}/${release.tag_name.replace(/[/]/g, "-")}`;
    return {
      fullPath: `/${route}.json`,
      route: route,
      title: release.name,
      lastModifiedDate: Date.parse(release.created_at),
      description: summarizeMinorChanges(release.body),
      content: "",
      tags: ["latest-update-feature"],
      data: {
        href: release.html_url,
      },
    };
  });
}
