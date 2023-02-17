<template>

    <span>

      <template v-if="isToolbar">

        <span :title="name ">

            <span class="tool" :class="[uiSchemaType,  {readOnly:tool.itemsReadOnly}]">
              <label>{{ name }}</label>
              <span class="icon"/>
            </span>

          <!-- Show name if while dragging tool is in dropArea -->
            <span class="component">{{ name }}</span>
          </span>

      </template>

      <template v-else>

        <div class="flex gap-2 items-center">
          <span :class="['toolIcon', uiSchemaType, ]" v-if="showIcon"><span class="icon"/></span>

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

.toolItem .tool:where(.Group, .VerticalLayout, .HorizontalLayout, .Categorization, .label, .Control:not(.readOnly), .reference, .combinator, .array) label {
  @apply hidden
}

.toolIcon .icon::before,
.toolItem .tool:where(.Group, .VerticalLayout, .HorizontalLayout, .Categorization, .label, .Control:not(.readOnly), .reference, .combinator, .array) .icon::before {
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

.toolIcon.Group .icon::before,
.toolItem .tool.Group .icon::before {
  /* mdi:crop-landscape */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,17H5V7H19M19,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H19A2,2 0 0,0 21,17V7C21,5.89 20.1,5 19,5Z"/></svg>');
}

.toolIcon.HorizontalLayout .icon::before,
.toolItem .tool.HorizontalLayout .icon::before {
  /* mdi:land-rows-vertical */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2M6.5 20H4V4H6.5V20M11 20H8.5V4H11V20M15.5 20H13V4H15.5V20M20 20H17.5V4H20V20Z"/></svg>');
}

.toolIcon.VerticalLayout .icon::before,
.toolItem .tool.VerticalLayout .icon::before {
  /* mdi:land-rows-horizontal */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 20V4C22 2.9 21.1 2 20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20M4 6.5V4H20V6.5H4M4 11V8.5H20V11H4M4 15.5V13H20V15.5H4M4 20V17.5H20V20H4Z"/></svg>');
}

.toolIcon.Categorization .icon::before,
.toolItem .tool.Categorization .icon::before {
  /* mdi:tab */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H3V5h10v4h8v10Z"/></svg>');
}

.toolIcon.Category .icon::before,
.toolItem .tool.Category .icon::before {
  /* mdi:tab-plus */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3,3A2,2 0 0,0 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5A2,2 0 0,0 21,3H3M3,5H13V9H21V19H3V5M10,10V13H7V15H10V18H12V15H15V13H12V10H10Z"/></svg>');
}

.toolIcon.label .icon::before,
.toolItem .tool.label .icon::before {
  /* mdi:tab-plus */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.41l9 9A2 2 0 0 0 13 22a2 2 0 0 0 1.41-.59l7-7A2 2 0 0 0 22 13a2 2 0 0 0-.59-1.42M6.5 8A1.5 1.5 0 1 1 8 6.5A1.5 1.5 0 0 1 6.5 8m5.09 7.41l-4-4L9 10l4 4m2.59.41l-5.5-5.5L11.5 7.5L17 13Z"/></svg>');
}
.toolIcon.Control .icon::before,
.toolItem .tool.Control:not(.readOnly) .icon::before {
  /* mdi:form-textbox */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M17 7h5v10h-5v2a1 1 0 0 0 1 1h2v2h-2.5c-.55 0-1.5-.45-1.5-1c0 .55-.95 1-1.5 1H12v-2h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2V2h2.5c.55 0 1.5.45 1.5 1c0-.55.95-1 1.5-1H20v2h-2a1 1 0 0 0-1 1v2M2 7h11v2H4v6h9v2H2V7m18 8V9h-3v6h3Z"/></svg>');
}
.toolIcon.reference .icon::before,
.toolItem .tool.Control.reference .icon::before {
  /* mdi:link-box-variant  */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-5.06 11.81L11.73 17c-.65.67-1.51 1-2.37 1c-.86 0-1.72-.33-2.36-1c-1.33-1.29-1.33-3.42 0-4.74l1.35-1.36l-.01.6c-.01.5.07 1 .23 1.44l.05.15l-.4.41a1.597 1.597 0 0 0 0 2.28c.61.62 1.67.62 2.28 0l2.2-2.19c.3-.31.48-.72.48-1.15c0-.44-.18-.83-.48-1.14a.87.87 0 0 1 0-1.24c.33-.33.91-.32 1.24 0c.63.64.98 1.48.98 2.38c0 .9-.35 1.74-.98 2.37M17 11.74l-1.34 1.36v-.6c.01-.5-.07-1-.23-1.44l-.05-.14l.4-.42a1.597 1.597 0 0 0 0-2.28c-.61-.62-1.68-.61-2.28 0l-2.2 2.2c-.3.3-.48.71-.48 1.14c0 .44.18.83.48 1.14c.17.16.26.38.26.62s-.09.46-.26.62a.86.86 0 0 1-.62.25c-.22 0-.45-.08-.62-.25a3.362 3.362 0 0 1 0-4.75L12.27 7A3.311 3.311 0 0 1 17 7c.65.62 1 1.46 1 2.36c0 .9-.35 1.74-1 2.38Z"/></svg>');
}

.toolIcon.combinator .icon::before,
.toolItem .tool.Control.combinator .icon::before {
  /* mdi:folder-pound */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M15.25 13h2l-.5 2h-2l.5-2M22 8v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.11.89-2 2-2h6l2 2h8a2 2 0 0 1 2 2m-2 4h-1.5l.5-2h-1l-.5 2h-2l.5-2h-1l-.5 2H13v1h1.25l-.5 2H12v1h1.5l-.5 2h1l.5-2h2l-.5 2h1l.5-2H19v-1h-1.25l.5-2H20v-1Z"/></svg>');
}
.toolIcon.select .icon::before,
.toolItem .tool.Control.select .icon::before {
  /* mdi:form-select */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M15 5h3l-1.5 2L15 5M5 2h14a2 2 0 0 1 2 2v16c0 1.11-.89 2-2 2H5a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2m0 2v4h14V4H5m0 16h14V10H5v10m2-8h10v2H7v-2m0 4h10v2H7v-2Z"/></svg>');
}

.toolIcon.array .icon::before,
.toolItem .tool.Control.array .icon::before {
  /* mdi:code-array */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5m3 1v12h4v-2H8V8h2V6H6m10 10h-2v2h4V6h-4v2h2v8Z"/></svg>');
}
.toolIcon.object .icon::before,
.toolItem .tool.Control.object .icon::before {
  /* mdi:code-braces-box */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-8 5H9v2c0 1.1-.9 2-2 2c1.1 0 2 .9 2 2v2h2v2H9c-1.1 0-2-.9-2-2v-1c0-1.1-.9-2-2-2v-2c1.1 0 2-.9 2-2V8c0-1.1.9-2 2-2h2v2m8 5c-1.1 0-2 .9-2 2v1c0 1.1-.9 2-2 2h-2v-2h2v-2c0-1.1.9-2 2-2c-1.1 0-2-.9-2-2V8h-2V6h2c1.1 0 2 .9 2 2v1c0 1.1.9 2 2 2v2Z"/></svg>');
}

</style>

<script setup>
import {ref, computed} from 'vue'

const props = defineProps({
  tool: Object,//ToolInterface
  isToolbar: Boolean,
  index: Number //for deleting correct element in list
})

const tool = props?.tool;
const uiSchemaType = computed(() => tool.uischema?.type);

const extraLabel = ref('');

const isControl = computed(() => 'Control' === tool.uischema.type);
const showIcon = computed(() => !isControl.value || ['reference','combinator','array','object'].includes('__tool.toolType'));

const name = computed(() => {

  let uischema = tool.uischema;
  let label = uischema?.label;

  if(!tool) {
    return '';
  }

  if(tool.itemsReadOnly) {
    return tool.propertyName;
  }

  if(['reference','combinator','array','object'].includes('__tool.toolType')) {
    label = null;
  }

  if(props.isToolbar) {
    return tool?.toolName ?? tool?.uischemyType
  }

  //if label exists, then show only label
  if(label && ['category','group'].includes('__tool.toolType')) {
    return label;
  }
  if(['Label'].includes(tool?.uischema.type)) {
    return uischema?.text ?? 'LABEL';
  }

  //fix tool/type name
  else if(['VerticalLayout','HorizontalLayout','Categorization','Group'].includes(tool?.uischema.type)) {
    return tool?.uischema.type;
  }

  extraLabel.value = label;

  //:TODO add something for if Tool!=formInputByType
  return (tool?.propertyName ?? tool?.toolName ?? 'UNKNOWN');

});

</script>
