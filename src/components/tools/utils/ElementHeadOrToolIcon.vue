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
        {{ name }}
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

.toolItem .tool:where(.group, .flexRow, .flex, .tabs) label {
  @apply hidden
}

.toolItem .tool:where(.group, .flexRow, .flex, .tabs) .icon::before {
  content: '';
  width: 20px;
  height: 20px;
  background-size: cover;
  display: block;
}

.toolItem .tool.group .icon::before {
  /* mdi:crop-landscape */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,17H5V7H19M19,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H19A2,2 0 0,0 21,17V7C21,5.89 20.1,5 19,5Z"/></svg>');
}

.toolItem .tool.flexRow .icon::before {
  /* mdi:land-rows-vertical */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2M6.5 20H4V4H6.5V20M11 20H8.5V4H11V20M15.5 20H13V4H15.5V20M20 20H17.5V4H20V20Z"/></svg>');
}

.toolItem .tool.flex .icon::before {
  /* mdi:land-rows-horizontal */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 20V4C22 2.9 21.1 2 20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20M4 6.5V4H20V6.5H4M4 11V8.5H20V11H4M4 15.5V13H20V15.5H4M4 20V17.5H20V20H4Z"/></svg>');
}

.toolItem .tool.tabs .icon::before {
  /* mdi:tab-plus */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3,3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5A2,2 0 0,0 21,3H3M3,5H13V9H21V19H3V5M10,10V13H7V15H10V18H12V15H15V13H12V10H10Z"/></svg>');
}


</style>

<script setup>
import {computed} from 'vue'
import {Tool} from "../../../lib/models";

const props = defineProps({
  tool: Tool,
  isToolbar: Boolean,
  index: Number //for deleting correct element in list
})

const tool = props?.tool;

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

  //:TODO add something for if Tool!=formInputByType
  return (toolProps?.propertyName ?? toolProps?.toolName ?? 'UNKNOWN') + (label ? (': ' + label) : '');

});

</script>
