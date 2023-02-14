import TabsCategorizationRenderer from "./components/TabsCategorizationRenderer.component.vue";
import {entry as oneOfRenderer} from "./components/OneOfRenderer.vue";
import {entry as allOfRenderera} from "./components/AllOfRenderer.vue";
import {entry as anyOfRenderer} from "./components/AnyOfRenderer.vue";
import {entry as objectRenderer} from "./components/ObjectRenderer.vue";
import {entry as arrayControlRenderer} from "./components/ArrayControlRenderer.vue";
import {entry as enumArrayRenderer} from "./components/EnumArrayRenderer.vue";

import {and, categorizationHasCategory, rankWith} from "@jsonforms/core";
import type {JsonFormsRendererRegistryEntry} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";

export const tabsCategorizationRendererEntry = {
    renderer: TabsCategorizationRenderer,
    tester: rankWith(2, and(uiTypeIs('Categorization'), categorizationHasCategory))
} as JsonFormsRendererRegistryEntry;

export const boplusVueVanillaRenderers = [
    tabsCategorizationRendererEntry,
    oneOfRenderer,
    allOfRenderera,
    anyOfRenderer,
    objectRenderer,
    arrayControlRenderer,
    enumArrayRenderer,
];
