const DEFAULT_PHASES = [
  "prepare",
  "snapshot",
  "preflight",
  "activate",
  "verify-origin",
  "commit",
  "verify-public",
];

function failurePointMatches(failurePoint, phase, timing) {
  return failurePoint === `${timing}-${phase}`;
}

export class InjectedDeploymentFailure extends Error {
  constructor(point) {
    super(`Injected deployment failure at ${point}`);
    this.name = "InjectedDeploymentFailure";
    this.point = point;
  }
}

export async function runDeploymentTransaction(
  operations,
  {
    failurePoint = process.env.DEPLOY_FAIL_AT || "",
    logger = console,
    phases = DEFAULT_PHASES,
  } = {},
) {
  const state = {
    activated: false,
    committed: false,
    currentPhase: "initializing",
    history: [],
    rollbackAttempted: false,
    rollbackCompleted: false,
  };

  const transition = async (phase) => {
    state.currentPhase = phase;
    state.history.push(phase);
    logger.log(`DEPLOY_STATE phase=${phase}`);

    if (failurePointMatches(failurePoint, phase, "before")) {
      throw new InjectedDeploymentFailure(`before-${phase}`);
    }

    // Activation can fail after the old Passenger registration has already
    // been destroyed. Mark the transaction as rollback-eligible before the
    // operation begins, not after it completes.
    if (phase === "activate") {
      state.activated = true;
    }

    await operations[phase](state);

    if (phase === "commit") {
      state.committed = true;
    }

    if (failurePointMatches(failurePoint, phase, "after")) {
      throw new InjectedDeploymentFailure(`after-${phase}`);
    }
  };

  try {
    for (const phase of phases) {
      if (typeof operations[phase] !== "function") {
        throw new Error(`Deployment operation is missing phase: ${phase}`);
      }
      await transition(phase);
    }

    state.currentPhase = "complete";
    state.history.push("complete");
    logger.log("DEPLOY_STATE phase=complete");
    return state;
  } catch (error) {
    state.failure = error;
    state.failedPhase = state.currentPhase;
    logger.error(
      `DEPLOY_STATE phase=failed failedPhase=${state.failedPhase} message=${error.message}`,
    );

    if (state.activated) {
      state.rollbackAttempted = true;
      state.currentPhase = "rollback";
      state.history.push("rollback");
      logger.warn(`DEPLOY_STATE phase=rollback from=${state.failedPhase}`);

      try {
        await operations.rollback(state, error);
        state.rollbackCompleted = true;
        state.history.push("rollback-complete");
        logger.warn("DEPLOY_STATE phase=rollback-complete");
      } catch (rollbackError) {
        state.rollbackError = rollbackError;
        logger.error(`DEPLOY_STATE phase=rollback-failed message=${rollbackError.message}`);
        throw new AggregateError(
          [error, rollbackError],
          `Deployment failed during ${state.failedPhase}; automatic rollback also failed.`,
        );
      }
    }

    throw error;
  } finally {
    if (typeof operations.cleanup === "function") {
      await operations.cleanup(state);
    }
  }
}
