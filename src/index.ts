export { default as ElementHeadOrToolIcon } from './components/tools/utils/ElementHeadOrToolIcon.vue'
export { default as Actions } from './components/tools/utils/Actions.vue'

//lib
export * from './lib/formbuilder';
export { layoutTools, controlTools  } from './lib/formbuilder';
export { getComponent } from './lib/tools/toolImporter';
export {ToolProps, updatableUischemaKeys, updatableSchemaKeys} from "./lib/models";


//components
export { default as FormBuilder } from './components/FormBuilder.vue';
export { default as FormBuilderBar } from './components/FormBuilderBar.vue';
export { default as FlexArea } from './components/tools/flexArea.vue'

//jsonForms Renderer
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {entry as tabsCategorizationRenderer} from "../packages/boplus-vue-vanilla/src/components/TabsCategorizationRenderer.vue";
export const jsonFormRenderes = Object.freeze([
    ...vanillaRenderers,
    tabsCategorizationRenderer,
]);

import mitt from 'mitt'
type Events = {
    formBuilderModal: any,
    formBuilderUpdated: any,
    formBuilderSchemaUpdated: any,
};
export const emitter = mitt<Events>();
