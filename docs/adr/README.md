# ADR numbering

ADR numbers are a single global counter. Authors cannot safely mint the real
number — two branches can independently claim the same integer with different
filenames, which merges silently into a duplicate.

**Rule:** the number is claimed by `se-release-engineer` at merge time, not by
the author at writing time.

- Authors write `docs/adr/DRAFT-<slug>.md`.
- At land, check every branch tip (not just `main`) for the highest claimed
  number, assign the next free one, rename to `docs/adr/NNNN-<slug>.md`, and
  fix in-branch cross-references before opening the PR.
- A draft superseded before it lands keeps no number:
  `docs/adr/SUPERSEDED-<slug>.md`.

## Amending a landed ADR

A merged ADR's frozen decision text is never rewritten in place. A change is an
append-only `## Amendment AN`. The amendment rides the feature branch whose
change needs it.

Sebas owns the index and the claim-at-merge reminder. Sebas does not assign
the number — that is the release engineer, because the number is a git fact.
