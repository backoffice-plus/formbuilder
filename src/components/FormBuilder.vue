<template>

  <div class="formbuilder">

    <ModalsContainer />

    <Modal
        :tool="toolEdit"
        :jsonFormsRenderers="jsonFormsRenderers"

        @change="onChangeModal"
        @close="isModalOpen=false;toolEdit=null"

        v-if="isModalOpen && toolEdit"
    />

<!--    <div class="styleA" v-if="filteredBuilders.length>1">-->
<!--      Builder:-->
<!--      <select v-model="showBuilder" @change="onChangeBuilder" class="!w-auto !inline">-->
<!--        <option v-for="builder in filteredBuilders">{{ builder }}</option>-->
<!--      </select>-->
<!--    </div>-->

    <slot name="toolbar" v-if="!hideToolbar">
      <nav>

  <!--      <div class="tabs">-->
  <!--        <button @click="showBar='schema';" :class="{active:'schema'===showBar}" v-if="!schemaReadOnly">Controls</button>-->
  <!--        <button @click="showBar='uischema';" :class="{active:'uischema'===showBar}" v-if="showBuilder==='uischema'">Layout</button>-->
  <!--        <button @click="showBar='properties';" :class="{active:'properties'===showBar}" v-if="schemaReadOnly">Properties</button>-->
  <!--      </div>-->

            <FormBuilderToolbar
                :toolFinder="toolFinder"
                :schemaOnly="schemaOnly"
                :schemaReadOnly="schemaReadOnly"
                :showBuilder="showBuilder"
                @drag="e=>drag = !!e"
            />

      </nav>
    </slot>

    <slot name="droparea" v-if="!hideDroparea">
      <template  v-if="currentBaseTool">
        <component :is="currentBaseTool.importer()"
                   :tool="currentBaseTool"
                   :isRoot="true"
                   :key="currentBaseTool.propertyName"
                   v-bind="schemaToolProps"
        >

          <template v-slot:header  v-if="!schemaOnly && !schemaReadOnly">
            <div class="toolSwitcher">
              <ToolIcon :tool="baseUiTool" :prefixLabel="'uischema: '" :class="{active:showBuilder==='uischema'}" @click="showBuilder='uischema'" />
              <ToolIcon :tool="baseSchemaTool" :prefixLabel="'schema: '" :class="{active:showBuilder==='schema'}"  @click="showBuilder='schema'" />
            </div>
          </template>

        </component>
      </template>
    </slot>

  </div>

</template>

<style scoped>
.formbuilder {
    @apply flex flex-col gap-4
}
nav {
  ---background-color: var(--toolBar-bg);
  background-color: transparent;
}


.toolSwitcher {
  @apply flex gap-4 ml-2
}
.toolSwitcher .toolIcon.active {
  background-color: var(--dropArea);
  border-color: var(--toolItem-border);
  @apply border border-b-0
}
.toolSwitcher .toolIcon {

  @apply px-2 py-1 rounded-t cursor-pointer
}
.toolSwitcher .toolIcon:hover {
  background-color: var(--toolBar-tab-hover);
}
</style>

<style>
.toolSwitcher .toolIcon label {
  @apply cursor-pointer
}

</style>


<script setup>
import {computed, getCurrentInstance, ref, useSlots, watch} from 'vue'
import {generateJsonForm} from "../index";
import {initBaseTools} from "../lib/toolCreation";

import Modal from "./Modal.vue";
import _ from "lodash";
import {onDragGetTool} from "../lib/vue";
import {ToolFinder} from "../lib/ToolFinder";
import ToolIcon from "./tools/utils/ToolIcon.vue";
import FormBuilderToolbar from "./FormBuilderToolbar.vue";
import {BuilderEvent} from "../lib/BuilderEvent";
import {createVfm, ModalsContainer} from "vue-final-modal";

//const props = defineProps({...formbuilderProps()})
const props = defineProps({
  schema:Object,
  uischema:Object,
  jsonForms: Object,
  jsonFormsRenderers: Array,
  schemaOnly: Boolean,
  schemaReadOnly: Boolean,
  tools: Array,
  schemaTool: String,
  schemaToolProps: Object,
})

const rootSchema = ref();//props?.schema ?? props?.jsonForms?.schema ?? {});
const rootUischema = ref();//props?.uischema ?? props?.jsonForms?.uischema ?? {});
const showBuilder = ref(props?.schemaOnly ? 'schema' : 'uischema');

const emit = defineEmits(['schemaUpdated']);

const slots = useSlots()
const slotToolbar = slots?.toolbar && slots.toolbar();
const slotDroparea = slots?.droparea && slots.droparea();
const hideToolbar = 0 === slotToolbar?.length
const hideDroparea = 0 === slotDroparea?.length

const toolFinder = new ToolFinder(props.tools);

//base tools
const {schema, uischema} = initBaseTools(toolFinder, props)
const baseUiTool = ref(uischema);
const baseSchemaTool = ref(schema);
const currentBaseTool = computed(() => showBuilder.value === 'uischema' ? baseUiTool.value : baseSchemaTool.value)

const onChangeModal = (data) => toolEdit.value && updateJsonForm({modal:{element:toolEdit.value}})

const updateJsonForm = (e) => {
  const event = new BuilderEvent(e, props, showBuilder.value, toolFinder, baseUiTool.value, baseSchemaTool.value);
  const {schema, uischema} = generateJsonForm(event)
  undefined !== schema && (rootSchema.value = schema);
  undefined !== uischema && (rootUischema.value = uischema);
}

const emitSchemaUpdated = (init=false) => {
    const args = {
        schema: JSON.parse(JSON.stringify(rootSchema.value)), //to remove undefined vars
        uischema: JSON.parse(JSON.stringify(rootUischema.value))
    };
    if(init) {
        args.init = true;
    }

    //do not emit schema={}
    if(_.isEmpty(args.schema)) {
        args.schema = undefined;
    }

    emit('schemaUpdated', args)
}
const emitSchemaUpdatedDebounced = _.debounce(emitSchemaUpdated,50,{leading:false, trailing:true});
const emitSchemaUpdatedIfChanged = (a, b) => JSON.stringify(a) !== JSON.stringify(b) && emitSchemaUpdatedDebounced();
watch(rootSchema, emitSchemaUpdatedIfChanged)
watch(rootUischema, emitSchemaUpdatedIfChanged)

//initial emitSchemaUpdated if there are no elements
const hasElements = (rootSchema.value?.elements?.length ?? 0) > 0;
const hasUiElements = (rootUischema.value?.elements?.length ?? 0) > 0;
if(!hasUiElements && 'uischema' === showBuilder.value) {
    updateJsonForm({mounted:{element:currentBaseTool.value}});
    emitSchemaUpdated(true);
}

const app = getCurrentInstance().appContext.app;
if(!app.config.globalProperties['$vfm']) {
    app.use(createVfm());
}

//expose
const drag = ref(false);
const isModalOpen = ref(false);
const toolEdit = ref(null);
const toolDragging = ref();
const onToolDrag = (e) => toolDragging.value = onDragGetTool(e);
const onEditTool = (data) => {
    isModalOpen.value = true;
    toolEdit.value = data.tool;
}
defineExpose({toolFinder, showBuilder, toolDragging, rootSchema, rootUischema, baseSchemaTool, baseUiTool, onToolDrag,  onEditTool, onDropAreaChanged: updateJsonForm})

</script>

