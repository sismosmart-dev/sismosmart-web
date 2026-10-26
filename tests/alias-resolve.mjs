// Resolves the "@/*" tsconfig path alias to "src/*" so tests can import
// app source modules directly with `node --test`, without a bundler.
const srcRoot = new URL("../src/", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) {
    return nextResolve(specifier, context);
  }

  const withoutExtension = new URL(specifier.slice(2), srcRoot).href;
  const hasExtension = /\.(ts|tsx|mjs|js)$/.test(withoutExtension);
  const target = hasExtension ? withoutExtension : `${withoutExtension}.ts`;
  return nextResolve(target, context);
}
