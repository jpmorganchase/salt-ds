# Platform conventions

Wrap application UI in `ConsumerBrandProvider` with `density="high"`. The
wrapper keeps the release fixture stable on the legacy `SaltProvider` and
`@salt-ds/theme/index.css` setup exported by its pinned registry versions. This
is package-compatibility coverage, not setup guidance for a new application.
