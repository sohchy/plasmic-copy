import { ensure, withoutNils } from "@/wab/common";
import { ComponentReference } from "@/wab/server/workers/codegen";
import { uniqBy } from "lodash";

/**
If some of the components in the build are missing from the bundle, esbuild
will throw an error message that looks like this:

```
Build failed with 1 error:
render__p_qAnx7Cavdb.tsx:69:71: ERROR: Could not resolve "./comp__xeF6Jn1vylil"
```

This means that the component with the uuid `p_qAnx7Cavdb` is trying to import the component with
the uuid `xeF6Jn1vylil`, but that component is missing from the bundle.
 */

// Regex generated by ChatGPT 4
const MISSING_COMPONENT_PATTERN =
  /(\w+)__([^:]+)\..*?Could not resolve "\.\/comp__(.*?)"/g;

function projectRefText(ref: ComponentReference) {
  return `"${ref.projectName}" (ID:${ref.projectId})`;
}

export function buildMissingComponentErrors(
  errors: {
    missingComponent?: ComponentReference;
    importingComponent: ComponentReference;
  }[]
) {
  const projects = uniqBy(
    [
      ...errors.map((err) => err.importingComponent),
      ...withoutNils(errors.map((err) => err.missingComponent)),
    ],
    (c) => c.projectId
  );
  return `
Found ${errors.length} errors while bundling the components:
${errors
  .map((err) => {
    if (err.missingComponent) {
      return `Component "${err.importingComponent.name}" is trying to import component "${err.missingComponent.name}".`;
    } else {
      return `Component "${err.importingComponent.name}" is trying to import an unknown component.`;
    }
  })
  .join("\n")}

Those components are in the following projects:
${projects.map((p) => `${projectRefText(p)}`).join("\n")}

They are hidden (prefixed with an underscore) or the plasmic-init configuration is improperly set up.

Please make sure that the components are correctly referenced in the Studio.
Contact support if you need help.
  `.trim();
}

// Given a message error throw by the bundling process, this function will attempt to transform it
// into a more user-friendly message.
export function transformBundlerErrors(
  msg: string,
  componentRefs: ComponentReference[]
) {
  if (MISSING_COMPONENT_PATTERN.test(msg)) {
    // Reset the regex to the beginning
    MISSING_COMPONENT_PATTERN.lastIndex = 0;
    const allErrors = Array.from(msg.matchAll(MISSING_COMPONENT_PATTERN)).map(
      (match) => {
        const [, , importingUuid, missingUuid] = match;
        const importingComponent = ensure(
          componentRefs.find((comp) => comp.id === importingUuid),
          `Bundle error is referencing a component not present in the site components "${importingUuid}"`
        );

        const missingComponent = componentRefs.find(
          (comp) => comp.id === missingUuid
        );

        return {
          missingComponent,
          importingComponent,
        };
      }
    );

    return buildMissingComponentErrors(allErrors);
  }

  return null;
}
