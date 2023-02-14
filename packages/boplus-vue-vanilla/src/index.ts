import CategorizationRenderer from "./components/CategorizationRenderer.vue";
import AllOfRenderer from "./components/AllOfRenderer.vue";
import AnyOfRenderer from "./components/AnyOfRenderer.vue";
import OneOfRenderer from "./components/OneOfRenderer.vue";
import ObjectRenderer from "./components/ObjectRenderer.vue";

//:TODO
//import {entry as arrayControlRenderer} from "./components/ArrayControlRenderer.vue";
//import {entry as enumArrayRenderer} from "./components/EnumArrayRenderer.vue";

import {
    and,
    categorizationHasCategory,
    isAllOfControl,
    isObjectControl,
    isOneOfControl,
    rankWith
} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";

export const categorizationRendererEntry = {
    renderer: CategorizationRenderer,
    tester: rankWith(2, and(uiTypeIs('Categorization'), categorizationHasCategory))
};

export const objectRendererEntry = {
    renderer: ObjectRenderer,
    tester: rankWith(3, isObjectControl)
};

export const allOfRendererEntry = {
    renderer: AllOfRenderer,
    tester: rankWith(3, isAllOfControl)
};
export const anyOfRendererEntry = {
    renderer: AnyOfRenderer,
    tester: rankWith(3, isAllOfControl)
};
export const OneOfRendererEntry = {
    renderer: OneOfRenderer,
    tester: rankWith(2, isOneOfControl)
};

export const boplusVueVanillaRenderers = [
    categorizationRendererEntry,
    OneOfRendererEntry,
    allOfRendererEntry,
    anyOfRendererEntry,
    objectRendererEntry,
    //arrayControlRenderer,
    //  enumArrayRenderer,
];
