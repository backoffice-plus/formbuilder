import allOfRenderer from "../packages/boplus-vue-vanilla/src/components/AllOfRenderer.vue";

export { default as ElementHeadOrToolIcon } from './components/tools/utils/ElementHeadOrToolIcon.vue'
export { default as Actions } from './components/tools/utils/Actions.vue'

//lib
export * from './lib/formbuilder';
export { layoutTools, controlTools, importToolComponent, findLayoutTool, findControlToolByTester } from './lib/tools';
export {ToolProps, updatableUischemaKeys, updatableSchemaKeys} from "./lib/models";


//components
export { default as FormBuilder } from './components/FormBuilder.vue';
export { default as FormBuilderBar } from './components/FormBuilderBar.vue';
export { default as FlexArea } from './components/tools/flexArea.vue'

//jsonForms Renderer
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {entry as tabsCategorizationRenderer} from "../packages/boplus-vue-vanilla/src/components/TabsCategorizationRenderer.vue";
import {entry as oneOfRenderer} from "../packages/boplus-vue-vanilla/src/components/OneOfRenderer.vue";
import {entry as allOfRenderera} from "../packages/boplus-vue-vanilla/src/components/AllOfRenderer.vue";
import {entry as anyOfRenderer} from "../packages/boplus-vue-vanilla/src/components/AnyOfRenderer.vue";
import {entry as objectRenderer} from "../packages/boplus-vue-vanilla/src/components/ObjectRenderer.vue";
import {entry as arrayControlRenderer} from "../packages/boplus-vue-vanilla/src/components/ArrayControlRenderer.vue";
import {entry as enumArrayRenderer} from "../packages/boplus-vue-vanilla/src/components/EnumArrayRenderer.vue";
export const jsonFormRenderes = Object.freeze([
    ...vanillaRenderers,
    tabsCategorizationRenderer,
    oneOfRenderer,
    allOfRenderera,
    anyOfRenderer,
    objectRenderer,
    arrayControlRenderer,
    enumArrayRenderer,
]);

import mitt from 'mitt'
type Events = {
    formBuilderModal: any,
    formBuilderUpdated: any,
    formBuilderSchemaUpdated: any,
};
export const emitter = mitt<Events>();
