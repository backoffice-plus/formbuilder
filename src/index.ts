//lib
export * from './lib/formbuilder';
export * from './lib/useDialog';
export * from './lib/generator';
export * from './lib/normalizer';
export * from './lib/tools/subschemas';
export * from './lib/ToolFinder';
export {AbstractTool} from "./lib/tools/AbstractTool";
export type {ToolInterface, ToolContext, JsonFormsInterface} from "./lib/models";
export {defaultTools} from "./lib/tools";

//components
export {default as FormBuilder } from './components/FormBuilder.vue';
export {default as FormBuilderBar } from './components/FormBuilderBar.vue';
export {default as FlexArea } from './components/tools/flexArea.vue'
export {default as ElementHeadOrToolIcon } from './components/tools/utils/ElementHeadOrToolIcon.vue'
export {default as ToolIcon } from './components/tools/utils/ToolIcon.vue'
export {default as Actions } from './components/tools/utils/Actions.vue'

//renderer
export {formbuilderRenderers} from "./components/renderers";

import boplusJsonfromsVueVanilla from "@backoffice-plus/jsonforms-vue-vanilla";
export const boplusVueVanillaRenderers = boplusJsonfromsVueVanilla;

/** @ts-ignore */
export {default as Vuedraggable} from "../packages/_vuedraggable/src/vuedraggable.js";

import './css/theme.css'
