<template>

    <span>

      <template v-if="isToolbar">

        <span :title="name">

            <span class="tool" :class="[tool.props.toolType]">
              <label>{{ name }}</label>
              <span class="icon"/>
            </span>

          <!-- Show name if while dragging tool is in dropArea -->
            <span class="component">{{ name }}</span>
          </span>

      </template>

      <template v-else>

        <div class="flex gap-2 items-center">
          <span :class="['toolIcon',  tool.props.toolType]" v-if="!isControl"><span class="icon"/></span>

          <label :class="{'font-medium':isControl}">{{ name }}</label>

          <span v-if="extraLabel">{{ extraLabel }}</span>
        </div>


      </template>


      <!--    <span class="font-mono text-xs" v-if="!tool">[{{ uuid }}]</span>-->

    </span>

</template>


<style scoped>
.tool,
.component {
  @apply hidden
}

.toolItem .tool {
  @apply block
}

.dropArea .component {
  @apply block
}

.dropArea .tool {
  @apply hidden
}

.toolItem .tool:where(.group, .flexRow, .flex, .tabs, .label) label {
  @apply hidden
}

.toolIcon .icon::before,
.toolItem .tool:where(.group, .flexRow, .flex, .tabs, .label) .icon::before {
  content: '';
  width: 20px;
  height: 20px;
  background-size: cover;
  display: block;
}
.toolIcon .icon::before {
  width: 16px;
  height: 16px;
}

.toolIcon.group .icon::before,
.toolItem .tool.group .icon::before {
  /* mdi:crop-landscape */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,17H5V7H19M19,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H19A2,2 0 0,0 21,17V7C21,5.89 20.1,5 19,5Z"/></svg>');
}

.toolIcon.flexRow .icon::before,
.toolItem .tool.flexRow .icon::before {
  /* mdi:land-rows-vertical */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2M6.5 20H4V4H6.5V20M11 20H8.5V4H11V20M15.5 20H13V4H15.5V20M20 20H17.5V4H20V20Z"/></svg>');
}

.toolIcon.flex .icon::before,
.toolItem .tool.flex .icon::before {
  /* mdi:land-rows-horizontal */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 20V4C22 2.9 21.1 2 20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20M4 6.5V4H20V6.5H4M4 11V8.5H20V11H4M4 15.5V13H20V15.5H4M4 20V17.5H20V20H4Z"/></svg>');
}

.toolIcon.tab .icon::before,
.toolItem .tool.tab .icon::before {
  /* mdi:tab */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H3V5h10v4h8v10Z"/></svg>');
}

.toolIcon.tabs .icon::before,
.toolItem .tool.tabs .icon::before {
  /* mdi:tab-plus */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3,3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5A2,2 0 0,0 21,3H3M3,5H13V9H21V19H3V5M10,10V13H7V15H10V18H12V15H15V13H12V10H10Z"/></svg>');
}

.toolIcon.label .icon::before,
.toolItem .tool.label .icon::before {
  /* mdi:tab-plus */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.41l9 9A2 2 0 0 0 13 22a2 2 0 0 0 1.41-.59l7-7A2 2 0 0 0 22 13a2 2 0 0 0-.59-1.42M6.5 8A1.5 1.5 0 1 1 8 6.5A1.5 1.5 0 0 1 6.5 8m5.09 7.41l-4-4L9 10l4 4m2.59.41l-5.5-5.5L11.5 7.5L17 13Z"/></svg>');
}



</style>

<script setup>
import {ref, computed} from 'vue'
import {Tool} from "../../../lib/models";

const props = defineProps({
  tool: Tool,
  isToolbar: Boolean,
  index: Number //for deleting correct element in list
})

const tool = props?.tool;

const extraLabel = ref('');

const isControl = computed(() => 'Control' === tool.props.jsonForms.uischema.type);
const name = computed(() => {

  const toolProps = tool?.props;
  let uischema = toolProps?.jsonForms?.uischema;
  let label = uischema?.label;

  if(!tool) {
    return '';
  }

  if(props.isToolbar) {
    return toolProps?.toolName ?? toolProps?.toolType
  }

  //if label exists, then show only label
  if(label && ['tab','group'].includes(toolProps.toolType)) {
    return label;
  }
  if(['label'].includes(toolProps.toolType)) {
    return uischema?.text ?? 'LABEL';
  }

  //fix tool/type name
  else if(['flex','flexRow','tabs','group'].includes(toolProps?.toolType)) {
    return toolProps?.toolName ?? toolProps?.toolType ?? 'UNKNOWN';
  }

  if(label) {
    extraLabel.value = label;
  }

  //:TODO add something for if Tool!=formInputByType
  return (toolProps?.propertyName ?? toolProps?.toolName ?? 'UNKNOWN');

});

</script>
