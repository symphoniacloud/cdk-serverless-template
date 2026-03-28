# Quarterly Maintenance

Run through this checklist each quarter to keep the project up to date.

Always run `npm run local-checks` after making changes, and do a full remote test (`npm run remote-tests`) before wrapping up.

---

## Node.js version

Check the [AWS Lambda runtimes page](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) for the latest supported Node.js version.

If it has changed, update all of the following:

- `.nvmrc` — runtime version number (e.g. `24`)
- `package.json` — `engines.node` (e.g. `>=24.0.0`)
- `package.json` — `@tsconfig/nodeXX` and `@types/node` version constraints
- `src/cdk/app.ts` — `Runtime.NODEJS_XX_X`
- `eslint.config.js` — if using any node-version-specific rules

Also check whether a newer `@tsconfig/nodeXX` package exists (e.g. `@tsconfig/node26`) and if so replace the dependency and the `extends` path in `tsconfig.json`.

---

## npm dependencies

```bash
npm update
npm run local-checks
```

Review the diff in `package-lock.json` for anything unexpected, especially major version bumps. For major version bumps, check the changelog for breaking changes before committing.

Also run:

```bash
npm audit
```

Address any high or critical vulnerabilities. Moderate and below are judgment calls.

---

## GitHub Actions

For each action used in any workflow under `.github/workflows/`, check GitHub for new major versions and update as needed. Release notes are at `https://github.com/<action>/releases`.

Check each action's release notes for breaking changes before updating to a new major version.

Also check whether `ubuntu-latest` has moved to a new Ubuntu version and whether that affects anything.

---

## CDK

Check the [CDK changelog](https://github.com/aws/aws-cdk/blob/main/CHANGELOG.md) for deprecations or breaking changes relevant to the constructs used here (`NodejsFunction`, `FunctionUrl`, `LogGroup`).

CDK is pinned to `2.x` — no action needed for minor/patch updates (covered by `npm update`), but watch for anything deprecated in the changelog that might become a hard error in a future major version.

---

## TypeScript

Check the [TypeScript release notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html) for new strict checks or deprecations that might affect the build.

TypeScript is pinned to `5.x` — `npm update` covers patch/minor updates. If a new major version (6.x) is available, review breaking changes before upgrading. Also verify that `typescript-eslint` supports the new TypeScript major version before upgrading — it maintains an explicit peer dependency range and may lag behind TypeScript releases.

---

## Validate with a remote deploy

Once all updates are applied and `local-checks` is clean, do a full remote test to confirm the deployed stack still works:

```bash
npm run remote-tests
```

---

## After completing maintenance

- Update the version in `package.json` to reflect the current year/quarter (e.g. `2026.2.0`)
- Commit with a message like `Quarterly maintenance YYYY-QN`
