//lib
export * from './lib/formbuilder';
export * from './lib/generator';
export * from './lib/normalizer';
export * from './lib/tools/subschemas';
export * from './lib/ToolFinder';
export {AbstractTool} from "./lib/tools/AbstractTool";
export type {ToolInterface, ToolContext, JsonFormsInterface} from "./lib/models";
export {defaultTools} from "./lib/tools";

//components
import FormBuilder from './components/FormBuilder.vue';
import FormBuilderBar from './components/FormBuilderBar.vue';
import FlexArea from './components/tools/flexArea.vue'
import ElementHeadOrToolIcon from './components/tools/utils/ElementHeadOrToolIcon.vue'
import ToolIcon from './components/tools/utils/ToolIcon.vue'
import Actions from './components/tools/utils/Actions.vue'
export { FormBuilder, FormBuilderBar, FlexArea, ElementHeadOrToolIcon, ToolIcon, Actions }

import { formbuilderRenderers } from './components/renderers'
export { formbuilderRenderers }

import boplusJsonfromsVueVanilla from "@backoffice-plus/jsonforms-vue-vanilla";
export const boplusVueVanillaRenderers = boplusJsonfromsVueVanilla;

/** @ts-ignore */
export {default as Vuedraggable} from "../packages/_vuedraggable/src/vuedraggable.js";

import './css/theme.css'
import 'vue-final-modal/style.css'
