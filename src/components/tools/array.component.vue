<template>
  <div class="arrayTool rootItem" :class={isInlineType:isInlineType,isRoot:isRoot} :title="toolOptions.title">

    <slot name="header">
      <ToolIcon :tool="tool" :isToolbar="isToolbar">
        <template v-slot:droparea>
            <template v-if="!props.isInlineType">
                <b>{{ tool.propertyName }}:</b>
            </template>
            Array
          <span v-if="getFirstChildItemsType"> of {{ getFirstChildItemsType }}</span>
          <span v-else-if="isArrayOfRef"> of Ref</span>
          <span v-else-if="isArrayOfCombinator"> of {{ isArrayOfCombinator }}</span>
          <SchemaFeatures :tool="tool" />
        </template>

      </ToolIcon>
    </slot>

    <div v-if="!isToolbar" :class="[{'mr-5':!isRoot}]">

      <Actions :tool="tool" @delete="onDelete" :deletable="!isRoot">
        <button type="button" @click="() => addItem()" v-if="showAddItem"><Icon icon="mdi:plus" /></button>
        <button type="button" @click="collapsed=!collapsed;" v-if="!isRoot"><Icon :icon="collapsed ? 'mdi:arrow-expand-vertical' : 'mdi:arrow-collapse-vertical'" /></button>
      </Actions>

<!--      <div class="tabs">-->
<!--        <div class="flex items-center">-->
<!--        </div>-->
<!--      </div>-->

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
                       :isInlineType="isInlineType || isArrayOfRef || isArrayOfObject || !!isArrayOfCombinator"

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
.arrayTool:not(.isRoot) {
  background-color: var(--tool-control-secondary);
}
</style>

<style scoped>
.arrayTool {
  @apply
  relative
}

.dropArea .arrayTool {
  min-height: 140px !important;
}
</style>

<script setup>
import Actions from "./utils/Actions.vue";
import Vuedraggable from 'vuedraggable'
import {confirmAndRemoveChild, prepareAndCallOnDropAreaChange} from '../../'
import {computed, nextTick, onMounted, ref} from "vue";
import ToolIcon from "./utils/ToolIcon.vue";
import {Icon} from "@iconify/vue";
import {scalarTypes, toolComponentProps, vuedraggableOptions} from "../../lib/models";
import {ReferenceTool} from "../../lib/tools/referenceTool";
import {CombinatorTool} from "../../lib/tools/combinatorTool";
import {getFormbuilder, getToolDragging, getToolfinder} from "../../lib/vue";
import SchemaFeatures from "./utils/SchemaFeatures.vue";
import * as _ from 'lodash-es';
import FooterActions from "@/components/tools/utils/FooterActions.vue";

const props = defineProps({...toolComponentProps()})

const emit = defineEmits(['deleteByTool']);


const childTools = ref([]);
const collapsed = ref(false);

const isArrayOfObject = computed(() => 'object' === getFirstChildItemsType.value);
const isInlineType = computed(() => childTools.value.length >= 1 && scalarTypes.includes(getFirstChildItemsType.value));
const isArrayOfRef = computed(() => getFirstChild.value && '$ref' in getFirstChild.value?.schema);
const getFirstChild = computed(() => childTools.value[0]);
const isArrayOfCombinator = computed(() => getFirstChild.value && CombinatorTool.getKeyword(getFirstChild.value?.schema));
const getFirstChildItemsType = computed(() => getFirstChild.value?.schema?.type);
const toolOptions = computed(() => props.tool?.toolbarOptions() ?? {});

const childLayoutTools = computed(() => childTools.value.filter(tool => 'Control' !== tool.uischema.type));
const hasOneLayoutTool = computed(() => childLayoutTools.value.length>=1);


const fb = getFormbuilder();
const toolFinder = getToolfinder();
const onDrag = fb?.exposed.onToolDrag;

onMounted(() => {
  if (!props.isToolbar) {
    if (['array'].includes(props?.tool?.schema?.type)) {
      childTools.value.push(...props.tool.initChilds(toolFinder));

      if (childTools.value.length) {
        nextTick().then(() => onDropAreaChange({mounted:{element:props.tool}}))
      }
    }

    if(!childTools.value?.length) {
      //:DEV disabled for dev
      //addItem({type:'object',properties:{}})
    }
  }
})


const onDropAreaChange = (e) => prepareAndCallOnDropAreaChange(e, props.tool, childTools.value, fb?.exposed?.onDropAreaChanged);

const addItem = (initSchema = undefined) => {

  const addTools = (tools => {
    tools.forEach(tool => {
      childTools.value.push(tool);
      onDropAreaChange({added: {element:tool}});
    })
  });


  const schema = fb?.exposed?.rootSchema?.value;
  initSchema = initSchema ?? {type:'string'};
  // if(isArrayOfRef.value) {
  //   initSchema = {$ref:'#'}
  // }
  const tools = [toolFinder.findMatchingToolAndClone(schema, initSchema, {type: 'Control', scope: '#'})];

  //no name needed for "Array of Strings", also only one child
  //showNewPropertyDialogAndGetTool(fb?.exposed?.toolFinder).then(tools => addTools(tools))
  addTools(tools);
};


const allowChild = (tool) => {
  const isControl = 'Control' === tool?.uischema?.type;
  const isRefTool = tool instanceof ReferenceTool;
  const isSchemaReadOnly = !!fb?.props?.schemaReadOnly;
  //const isRefTool = '$ref' in tool.schema;//not working!!!
  //const isRefTool = tool instanceof ReferenceTool;//not working!!!
  //const isRefTool = 'ReferenceTool' === tool.constructor.name;

  // if(isArrayOfRef.value && isRefTool) {
  //   return true;
  // }

  if(isSchemaReadOnly) {
    return false;
  }

  if(!isControl) {
    return false;
  }

  const hasOneItem = childTools.value.length > 0;
  const itemsIsArray = _.isArray(props.tool.schema.items);


  if(itemsIsArray) {
    return true;
  }

  if(hasOneItem) {
    return false;
  }

  return true;

  //const isInlineType = scalarTypes.includes(props.tool?.schema?.items?.type)

  // if(isArrayOfRef.value && isRefTool) {
  //   return true;
  // }

  const childLayoutTools = childTools.value.filter(tool => 'Control' !== tool.uischema.type);
  const hasOneLayoutTool = childLayoutTools.length>=1;

  if(hasOneLayoutTool) {
    return false;
  }
  return !hasOneItem


  return isControl && !getFirstChild.value;
}

const showAddItem = computed(() => {
  return allowChild({uischema:{type:'Control'}})
});
const showDragClass = computed(() => {
  const toolDragging = getToolDragging();

  return allowChild(toolDragging);
})

const groupPut = (from, to, node, dragEvent) => {
  const tool = node._underlying_vm_;
  const isSchemaReadOnly = !!fb?.props?.schemaReadOnly;

  return allowChild(tool) && !isSchemaReadOnly;
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
  emit("deleteByTool", { tool: props.tool });
};


</script>
