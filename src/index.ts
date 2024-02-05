//lib
export * from './lib';

//components
export {default as FormBuilder } from './components/FormBuilder.vue';
export {default as FormBuilderBar } from './components/FormBuilderBar.vue';
export {default as FlexArea } from './components/tools/flexArea.vue'
export * from '@/components/tools/utils'


//renderer
export {formbuilderRenderers} from "./components/renderers";

import boplusJsonfromsVueVanilla from "@backoffice-plus/jsonforms-vue-vanilla";
export const boplusVueVanillaRenderers = boplusJsonfromsVueVanilla;

//export {default as Vuedraggable} from "vuedraggable"; //npm install vuedraggable isnt working!!!
export {default as Vuedraggable} from "../packages/_vuedraggable/src/vuedraggable"; //git clone from https://github.com/SortableJS/vue.draggable.next & npm install sortablejs

import './css/theme.css'
