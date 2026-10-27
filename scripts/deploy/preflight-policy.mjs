// Validation must establish a consistent, read-only baseline before remote uploads.
export const VALIDATION_PHASES = Object.freeze(["snapshot", "prepare", "preflight"]);

export function assertValidationBaseline({ existingApp, previousNodePath, previousRelease }) {
  if (!previousRelease) throw new Error("Validation requires a current release symlink.");
  if (!existingApp?.appRoot) throw new Error("Validation requires an existing Passenger application.");
  if (existingApp.appRoot !== previousRelease) {
    throw new Error("Validation requires Passenger and current release to agree.");
  }
  if (!previousNodePath) {
    throw new Error("Validation requires an existing executable Node.js runtime.");
  }
  return true;
}
