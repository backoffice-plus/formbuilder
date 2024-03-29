<template>
  <div class="objectTool" :class="['rootItem', {isRoot:isRoot}]">

    <slot name="header">
      <ToolIcon :tool="tool" :isToolbar="isToolbar" :prefixLabel="isRoot ? 'schema:' : ''">
        <template v-slot:droparea>
          <template v-if="isRoot">
            Object
          </template>
          <template v-else-if="!isInlineType && !isRoot">
            <b>{{ tool.propertyName }}</b>
          </template>
          <SchemaFeatures :tool="tool"/>
        </template>
      </ToolIcon>
    </slot>

    <div v-if="!isToolbar" :class="[isRoot?'mr-9':'mr-5']">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="addItem" v-if="showAddItem">
          <Icon icon="mdi:plus"/>
        </button>
        <button type="button" @click="collapsed=!collapsed;" v-if="!isRoot">
          <Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'"/>
        </button>
      </Actions>


      <!--        <div class="tabs">-->
      <!--          <div class="flex items-center">-->
      <!--            <button type="button" class="add" @click="addItem('object')" v-text="'[Object]'"/>-->
      <!--            <button type="button" class="add" @click="addItem('string')" v-text="'[String]'"/>-->
      <!--          </div>-->
      <!--        </div>-->

      <Vuedraggable
          v-bind="vuedraggableOptions"

          :class="['dropArea nestedFlexArea flex-col', {drag:showDragClass}]"
          :list="childTools"
          :group="{name:'formBuilder', pull: groupPull, put: groupPut}"
          @start="onDrag"
          @end="onDrag"
          @change="onDropAreaChange"

          v-show="!collapsed"
      >
        <template #item="{ element: tool, index }">
          <div> <!-- div needed for edit mode?!?! -->
            <component :is="tool.importer()"

                       :tool="tool"
                       :isToolbar="false"

                       @deleteByTool="onDeleteByTool"

                       class="dropItem"
            />
          </div>
        </template>

        <template #footer>
          <FooterActions
              :showAdd="showAddItem"
              @add="addItem"
          />
        </template>

      </Vuedraggable>

    </div>

  </div>
</template>

<style>
.objectTool:not(.isRoot) {
  background-color: var(--tool-control-secondary);
}
</style>

<style scoped>
.objectTool {
  @apply
  relative
}

.dropArea .objectTool {
  min-height: 140px !important;
}
</style>

<script setup>
import {computed, nextTick, onMounted, ref, unref} from "vue";
import {Icon} from "@iconify/vue";
import {
  Actions,
  confirmAndRemoveChild,
  FooterActions,
  getFormbuilder,
  getToolDragging,
  getToolfinder,
  prepareAndCallOnDropAreaChange,
  SchemaFeatures,
  showNewPropertyDialogAndGetTool,
  toolComponentProps,
  ToolIcon,
  vuedraggableOptions,
  Vuedraggable,
} from "@/";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);

const childTools = ref([]);
const collapsed = ref(false);

const fb = getFormbuilder();
const toolFinder = getToolfinder();
const onDrag = fb?.exposed.onToolDrag;

onMounted(() => {
  if (!props.isToolbar) {
    childTools.value.push(...props.tool.initChilds(toolFinder));

    if (childTools.value.length) {
      nextTick().then(() => onDropAreaChange({mounted: {element: props.tool}}))
    }
  }
})

const onDropAreaChange = (e) => prepareAndCallOnDropAreaChange(e, props.tool, childTools.value, fb?.exposed?.onDropAreaChanged);

const addItem = () => {
  showNewPropertyDialogAndGetTool(fb?.exposed?.toolFinder, fb)
      .then(tools => {
        tools.forEach(tool => {
          childTools.value.push(tool);
          onDropAreaChange({added: {element: tool}});
        })
      })
};

const showAddItem = computed(() => {
  return allowedChild({uischema: {type: 'Control'}})
});

const allowedChild = (tool) => {
  const isControl = 'Control' === tool?.uischema?.type;
  const hasSchemaType = undefined !== tool?.schema?.type;
  const isSchemaReadOnly = !!fb?.props?.schemaReadOnly;

  return !isSchemaReadOnly && (hasSchemaType || isControl)
}

const showDragClass = computed(() => {
  const tool = getToolDragging();
  return tool && allowedChild(unref(tool));
})
const groupPut = (from, to, node, dragEvent) => {
  const isSchemaReadOnly = !!fb?.props?.schemaReadOnly;
  const tool = node._underlying_vm_;
  return tool && allowedChild(unref(tool)) && !isSchemaReadOnly;
};
const groupPull = (from, to, node, dragEvent) => {
  const isSchemaReadOnly = !!fb?.props?.schemaReadOnly;
  return !isSchemaReadOnly;
}

const onDeleteByTool = (e) => confirmAndRemoveChild(props.tool, e.tool, fb).then(e => {
  childTools.value = props.tool.edge.childs;
  onDropAreaChange(e);
});

const onDelete = () => {
  emit("deleteByTool", {tool: props.tool});
};


</script>
